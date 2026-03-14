import { createServer, IncomingMessage, ServerResponse } from "http";
import { resolve } from "path";
import { cloneRepo, checkoutTargetBranch, commitAndPushTarget, getRevision, toTokenUrl } from "./git";
import {
  processTask,
  getNextTask,
  currentAgentProcess,
  getPendingTaskCount,
  absorbForeignTaskFiles,
  addPromptTask,
  requestInterrupt,
  type EventCallback,
  type CommandSpec,
} from "./worker";
import { createBufferedLogger, archiveCurrentLog } from "./log";
import { formatLogLine, stripTimestamp } from "./format";
import { fetchGlobalSecrets, type InfisicalConfig } from "./package/secrets";
import { startSecretsServer } from "./secrets-server";

// --- Configuration from env ---

const PORT = parseInt(process.env.PORT ?? "3000", 10);
const REPO_URL = process.env.REPO_URL ?? "";
const CLONE_BRANCH = process.env.CLONE_BRANCH ?? "main";
const PUSH_BRANCH = process.env.PUSH_BRANCH ?? CLONE_BRANCH;
const CONTAINER_NAME = process.env.CONTAINER_NAME ?? "agent";
const WEBHOOK_URL = process.env.WEBHOOK_URL ?? "";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET ?? "";
const INITIAL_PROMPT = process.env.INITIAL_PROMPT ?? "";
const REPO_DIR = "/repo";
const LOGS_DIR = resolve(REPO_DIR, "logs");

// --- OffsetBuffer ---

class OffsetBuffer<T> {
  private items: T[] = [];

  append(item: T): void {
    this.items.push(item);
  }

  since(offset: number): { items: T[]; nextOffset: number } {
    const start = Math.max(0, Math.min(offset, this.items.length));
    return {
      items: this.items.slice(start),
      nextOffset: this.items.length,
    };
  }

  get length(): number {
    return this.items.length;
  }
}

// --- State ---

const eventBuffer = new OffsetBuffer<string>();
const logBuffer = new OffsetBuffer<string>();

let totalCost = 0;
let iteration = 0;
let tasksProcessed = 0;
let lastActivityAt = new Date().toISOString();

// --- Container state ---

type ContainerState = "starting" | "idle" | "processing" | "stopping" | "stopped";
let state: ContainerState = "starting";
let detachRequested = process.env.DETACHED === "1";
let stopRequested = false;
// Wake signal for processing loop
let wakeResolve: (() => void) | null = null;

function wake(): void {
  if (wakeResolve) {
    wakeResolve();
    wakeResolve = null;
  }
}

function waitForWake(): Promise<void> {
  return new Promise((resolve) => {
    wakeResolve = resolve;
  });
}

// --- Webhook ---

function postWebhook(type: string, data?: Record<string, unknown>): void {
  if (!WEBHOOK_URL) return;
  const payload = JSON.stringify({
    type,
    containerName: CONTAINER_NAME,
    timestamp: new Date().toISOString(),
    ...(data !== undefined ? { data } : {}),
  });
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (WEBHOOK_SECRET) headers["Authorization"] = `Bearer ${WEBHOOK_SECRET}`;
  fetch(WEBHOOK_URL, {
    method: "POST",
    headers,
    body: payload,
  }).then((res) => {
    if (!res.ok) {
      console.error(`Webhook ${type} failed: ${res.status} ${res.statusText}`);
    }
  }).catch((err) => {
    console.error(`Webhook ${type} error: ${err.message}`);
  });
}

// --- Build a restricted environment for the agent process ---
// The agent gets only non-secret system/container vars plus ANTHROPIC_API_KEY.
// All other secrets must be accessed through exec-secrets.

function buildAgentEnv(secrets: Record<string, string>): Record<string, string> {
  const env: Record<string, string> = {};

  // System vars
  for (const key of [
    "PATH", "HOME", "USER", "SHELL", "TERM", "LANG", "LC_ALL",
    "NODE_PATH", "NODE_ENV", "LD_LIBRARY_PATH", "PLAYWRIGHT_BROWSERS_PATH",
  ]) {
    if (process.env[key]) env[key] = process.env[key]!;
  }

  // Non-secret container vars
  for (const key of [
    "CLONE_BRANCH", "PUSH_BRANCH", "CONTAINER_NAME",
    "GIT_AUTHOR_NAME", "GIT_AUTHOR_EMAIL",
    "GIT_COMMITTER_NAME", "GIT_COMMITTER_EMAIL",
    "DEBUG",
  ]) {
    if (process.env[key]) env[key] = process.env[key]!;
  }

  // ANTHROPIC_API_KEY is required for the claude CLI to function
  if (secrets.ANTHROPIC_API_KEY) {
    env.ANTHROPIC_API_KEY = secrets.ANTHROPIC_API_KEY;
  }

  return env;
}

// --- Default agent config ---

function buildDefaultAgent(secrets: Record<string, string>): CommandSpec {
  const args: string[] = [];
  args.push("--model", "claude-opus-4-6");
  args.push("--dangerously-skip-permissions");

  // MCP servers
  const mcpServers: Record<string, object> = {
    playwright: { type: "http", url: "http://localhost:8931/mcp" },
  };
  if (secrets.RECORD_REPLAY_API_KEY) {
    mcpServers.replay = { type: "http", url: "https://dispatch.replay.io/nut/mcp" };
  }
  args.push("--mcp-config", JSON.stringify({ mcpServers }));

  return { bin: "claude", args };
}

// --- Logger (initialized after clone) ---

let log: ReturnType<typeof createBufferedLogger>;

const onEvent: EventCallback = (rawLine) => {
  eventBuffer.append(rawLine);
  lastActivityAt = new Date().toISOString();
};

// --- HTTP helpers ---

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

function json(res: ServerResponse, status: number, body: unknown): void {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  res.end(data);
}

function getQuery(url: string, key: string): string | null {
  const qIdx = url.indexOf("?");
  if (qIdx === -1) return null;
  const params = new URLSearchParams(url.slice(qIdx));
  return params.get(key);
}

// --- Processing loop ---

async function processLoop(agentEnv: Record<string, string>, secrets: Record<string, string>): Promise<void> {
  const defaultAgent = buildDefaultAgent(secrets);
  // Track session ID across prompt tasks so interactive messages share context
  let promptSessionId: string | undefined;

  while (true) {
    if (stopRequested) {
      log("Stop requested. Exiting loop.");
      break;
    }

    // Process pending tasks
    const task = getNextTask(log);
    if (task) {
      state = "processing";
      postWebhook("task.started", { iteration, skill: task.skill, subtasks: task.subtasks, prompt: task.prompt ?? null });
      const taskStartedAt = Date.now();
      const result = await processTask(
        task,
        defaultAgent,
        log,
        onEvent,
        () => stopRequested,
        (label) => {
          if (!stopRequested) {
            iteration++;
            lastActivityAt = new Date().toISOString();
            archiveCurrentLog(LOGS_DIR, CONTAINER_NAME, iteration);
            commitAndPushTarget(label, PUSH_BRANCH, log, () => stopRequested, REPO_DIR);
          }
        },
        PUSH_BRANCH,
        task.prompt ? promptSessionId : undefined,
        agentEnv,
      );
      if (task.prompt && result.session_id) {
        promptSessionId = result.session_id;
      }
      totalCost += result.cost;
      tasksProcessed++;
      postWebhook("task.done", { skill: task.skill, subtasks: task.subtasks, prompt: task.prompt ?? null, cost: result.cost, totalCost, failed: !result.success, pendingTasks: getPendingTaskCount(), duration_ms: Date.now() - taskStartedAt });
      continue;
    }

    // Detach: exit immediately when task queue is empty
    if (detachRequested) {
      log("Detach requested and all work complete. Exiting.");
      break;
    }

    // Wait for something to happen
    log(`Idle. ${getPendingTaskCount()} tasks pending. Waiting...`);
    state = "idle";
    postWebhook("container.idle", { pendingTasks: getPendingTaskCount() });
    await waitForWake();
  }

  // Only reachable via stopRequested or detach — commit remaining work and exit
  log("Shutting down.");
  postWebhook("container.stopping", {});

  try {
    iteration++;
    archiveCurrentLog(LOGS_DIR, CONTAINER_NAME, iteration);
    commitAndPushTarget(`Final work from ${CONTAINER_NAME}`, PUSH_BRANCH, log, () => true, REPO_DIR);
  } catch (e: any) {
    log(`Warning: failed to push final work: ${e.message}`);
  }

  postWebhook("container.stopped", {});

  setTimeout(() => process.exit(0), 5000);
}

// --- HTTP server ---

const server = createServer(async (req, res) => {
  const url = req.url ?? "/";
  const method = req.method ?? "GET";

  try {
    // POST /message — add prompt as a task
    if (method === "POST" && url === "/message") {
      const body = JSON.parse(await readBody(req));
      const prompt = body.prompt;
      if (!prompt || typeof prompt !== "string") {
        json(res, 400, { error: "prompt is required" });
        return;
      }
      addPromptTask(prompt);
      log(`Message received (state=${state}, pendingTasks=${getPendingTaskCount()})`);
      postWebhook("message.queued", { prompt });
      wake();
      json(res, 200, { ok: true });
      return;
    }

    // GET /events?offset=N
    if (method === "GET" && url.startsWith("/events")) {
      const offset = parseInt(getQuery(url, "offset") ?? "0", 10);
      const result = eventBuffer.since(offset);
      json(res, 200, { items: result.items, nextOffset: result.nextOffset });
      return;
    }

    // GET /logs?offset=N
    if (method === "GET" && url.startsWith("/logs")) {
      const offset = parseInt(getQuery(url, "offset") ?? "0", 10);
      const result = logBuffer.since(offset);
      json(res, 200, { items: result.items, nextOffset: result.nextOffset });
      return;
    }

    // POST /interrupt
    if (method === "POST" && url === "/interrupt") {
      log(`Interrupt received (state=${state}, hasProcess=${!!currentAgentProcess})`);
      const hadProcess = !!currentAgentProcess;
      requestInterrupt(log);
      json(res, 200, { interrupted: hadProcess });
      return;
    }

    // POST /detach
    if (method === "POST" && url === "/detach") {
      detachRequested = true;
      wake();
      json(res, 200, { detaching: true });
      return;
    }

    // POST /stop
    if (method === "POST" && url === "/stop") {
      stopRequested = true;
      // Kill any running agent process
      if (currentAgentProcess) {
        currentAgentProcess.kill("SIGINT");
      }
      wake();
      json(res, 200, { stopping: true });
      return;
    }

    // GET /status
    if (method === "GET" && url === "/status") {
      json(res, 200, {
        state,
        containerName: CONTAINER_NAME,
        pushBranch: PUSH_BRANCH,
        pendingTasks: getPendingTaskCount(),
        tasksProcessed,
        totalCost,
        iteration,
        detachRequested,
        revision: getRevision(REPO_DIR),
        lastActivityAt,
      });
      return;
    }

    json(res, 404, { error: "not found" });
  } catch (e: any) {
    json(res, 500, { error: e.message });
  }
});

// --- Startup ---

/** Log to both console and the HTTP log buffer (if available). */
function startupLog(msg: string): void {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  logBuffer.append(line);
}

async function main(): Promise<void> {
  startupLog(`=== Container starting ===`);
  startupLog(`Container: ${CONTAINER_NAME}`);
  startupLog(`Clone branch: ${CLONE_BRANCH}, Push branch: ${PUSH_BRANCH}`);
  startupLog(`Repo URL: ${REPO_URL || "(not set)"}`);

  if (!REPO_URL) {
    startupLog("Fatal: REPO_URL environment variable is required");
    process.exit(1);
  }

  // Fetch secrets from Infisical — the container only has Infisical credentials
  // in its env, not the actual secrets.
  const infisicalConfig: InfisicalConfig = {
    token: process.env.INFISICAL_TOKEN ?? "",
    projectId: process.env.INFISICAL_PROJECT_ID ?? "",
    environment: process.env.INFISICAL_ENVIRONMENT ?? "",
  };

  if (!infisicalConfig.token || !infisicalConfig.projectId || !infisicalConfig.environment) {
    startupLog("Fatal: INFISICAL_TOKEN, INFISICAL_PROJECT_ID, and INFISICAL_ENVIRONMENT are required");
    process.exit(1);
  }

  // Fetch global secrets once for startup needs (clone token, agent env, MCP config).
  // The secrets server fetches live from Infisical on every request — no caching.
  startupLog("Fetching global secrets from Infisical...");
  let secrets: Record<string, string>;
  try {
    secrets = await fetchGlobalSecrets(infisicalConfig);
    startupLog(`Fetched ${Object.keys(secrets).length} global secret(s).`);
  } catch (e: any) {
    startupLog(`Fatal: failed to fetch secrets: ${e.message}`);
    process.exit(1);
  }

  // Start the secrets server — fetches from Infisical on every request
  await startSecretsServer(
    {
      infisicalConfig,
      branch: PUSH_BRANCH,
      logsDir: LOGS_DIR,
      getEventLines: () => eventBuffer.since(0).items,
      getLogLines: () => logBuffer.since(0).items,
    },
    startupLog,
  );

  // Clone repo using GITHUB_TOKEN from the secrets store
  const cloneUrl = toTokenUrl(REPO_URL, secrets.GITHUB_TOKEN);
  startupLog(`Cloning repo...`);
  try {
    cloneRepo(cloneUrl, CLONE_BRANCH, REPO_DIR);
    startupLog("Clone complete.");
  } catch (e: any) {
    startupLog(`Fatal: clone failed: ${e.message}`);
    process.exit(1);
  }

  // Now that /repo exists, initialize the logger
  log = createBufferedLogger(LOGS_DIR, CONTAINER_NAME, iteration, (line) => {
    console.log(line);
    logBuffer.append(line);
    // Format log lines for webhook using the same logic as read-log
    const formatted = formatLogLine(stripTimestamp(line));
    if (formatted) {
      postWebhook("log", { line: formatted });
    }
  });

  // Checkout target branch if different from clone branch
  if (PUSH_BRANCH !== CLONE_BRANCH) {
    log(`Checking out target branch ${PUSH_BRANCH}...`);
    checkoutTargetBranch(PUSH_BRANCH, log, REPO_DIR);
  }

  log(`Revision: ${getRevision(REPO_DIR)}`);
  log(`Push branch: ${PUSH_BRANCH}`);

  // Absorb task files from other containers (opt-in via ABSORB_TASKS env var)
  if (process.env.ABSORB_TASKS === "1") {
    absorbForeignTaskFiles(log);
  }

  // Add INITIAL_PROMPT as a task only if there are no existing tasks.
  if (INITIAL_PROMPT && getPendingTaskCount() === 0) {
    log("Adding initial prompt as task.");
    addPromptTask(INITIAL_PROMPT);
  }

  log(`Pending tasks: ${getPendingTaskCount()}`);

  // Change working directory to repo
  process.chdir(REPO_DIR);

  // Build restricted agent environment — no secrets except ANTHROPIC_API_KEY
  const agentEnv = buildAgentEnv(secrets);

  // Start HTTP server
  server.listen(PORT, () => {
    log(`HTTP server listening on port ${PORT}`);
    state = "idle";
    postWebhook("container.started", { pushBranch: PUSH_BRANCH, revision: getRevision(REPO_DIR) });
    postWebhook("container.idle", { pendingTasks: getPendingTaskCount() });
  });

  // Start processing loop
  processLoop(agentEnv, secrets);
}

// --- Process exit diagnostics ---

process.on("exit", (code) => {
  console.log(`[${new Date().toISOString()}] Process exiting with code ${code}`);
});

process.on("SIGTERM", () => {
  console.log(`[${new Date().toISOString()}] Received SIGTERM`);
  stopRequested = true;
  if (currentAgentProcess) {
    currentAgentProcess.kill("SIGINT");
  }
  wake();
});

process.on("SIGINT", () => {
  console.log(`[${new Date().toISOString()}] Received SIGINT`);
  stopRequested = true;
  if (currentAgentProcess) {
    currentAgentProcess.kill("SIGINT");
  }
  wake();
});

process.on("uncaughtException", (err) => {
  console.error(`[${new Date().toISOString()}] Uncaught exception: ${err.stack ?? err.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error(`[${new Date().toISOString()}] Unhandled rejection: ${reason}`);
  process.exit(1);
});

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
