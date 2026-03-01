import { createServer, IncomingMessage, ServerResponse } from "http";
import { resolve } from "path";
import { cloneRepo, checkoutTargetBranch, commitAndPushTarget, getRevision, toTokenUrl } from "./git";
import {
  processMessage,
  processTasks,
  currentClaudeProcess,
  getPendingTaskCount,
  absorbForeignTaskFiles,
  type ClaudeResult,
  type EventCallback,
} from "./worker";
import { createBufferedLogger, archiveCurrentLog, redactSecrets } from "./log";

// --- Configuration from env ---

const PORT = parseInt(process.env.PORT ?? "3000", 10);
const REPO_URL = process.env.REPO_URL ?? "";
const CLONE_BRANCH = process.env.CLONE_BRANCH ?? "main";
const PUSH_BRANCH = process.env.PUSH_BRANCH ?? CLONE_BRANCH;
const CONTAINER_NAME = process.env.CONTAINER_NAME ?? "agent";
const WEBHOOK_URL = process.env.WEBHOOK_URL ?? "";
const REPO_DIR = "/repo";
const LOGS_DIR = resolve(REPO_DIR, "logs");

// Set CONTAINER_MODE so log.ts loads secrets from env vars
process.env.CONTAINER_MODE = "1";

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

// --- Message queue ---

interface MessageEntry {
  id: string;
  prompt: string;
  status: "queued" | "processing" | "done" | "error";
  result?: ClaudeResult;
  error?: string;
}

const messageQueue: string[] = [];
const messages = new Map<string, MessageEntry>();
const eventBuffer = new OffsetBuffer<string>();
const logBuffer = new OffsetBuffer<string>();

let nextMessageId = 1;
let totalCost = 0;
let iteration = 0;
let tasksProcessed = 0;
let lastActivityAt = new Date().toISOString();

// --- Container state ---

type ContainerState = "starting" | "idle" | "processing" | "stopping" | "stopped";
let state: ContainerState = "starting";
let detachRequested = false;
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
  fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
  }).catch(() => {});
}

// --- Claude extra args ---

function buildExtraArgs(): string[] {
  const args: string[] = [];
  args.push("--model", "claude-opus-4-6");
  args.push("--dangerously-skip-permissions");

  // Build MCP config if replay key is available
  const replayKey = process.env.RECORD_REPLAY_API_KEY;
  if (replayKey) {
    const mcpConfig = JSON.stringify({
      mcpServers: {
        replay: { type: "http", url: "https://dispatch.replay.io/nut/mcp" },
      },
    });
    args.push("--mcp-config", mcpConfig);
  }

  return args;
}

// --- Logger (initialized after clone) ---

let log: ReturnType<typeof createBufferedLogger>;

const onEvent: EventCallback = (rawLine) => {
  eventBuffer.append(redactSecrets(rawLine));
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

function routeMatch(url: string, pattern: string): string | null {
  // pattern like "/message/:id" matches "/message/abc" returning "abc"
  const patternParts = pattern.split("/");
  const urlParts = url.split("?")[0].split("/");
  if (patternParts.length !== urlParts.length) return null;
  let param: string | null = null;
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      param = urlParts[i];
    } else if (patternParts[i] !== urlParts[i]) {
      return null;
    }
  }
  return param;
}

function getQuery(url: string, key: string): string | null {
  const qIdx = url.indexOf("?");
  if (qIdx === -1) return null;
  const params = new URLSearchParams(url.slice(qIdx));
  return params.get(key);
}

// --- Processing loop ---

async function processLoop(): Promise<void> {
  const extraArgs = buildExtraArgs();
  // Track the Claude session ID across interactive messages so context is preserved
  let interactiveSessionId: string | undefined;

  while (true) {
    if (stopRequested) {
      log("Stop requested. Exiting loop.");
      break;
    }

    // Check for queued messages
    if (messageQueue.length > 0) {
      state = "processing";
      const msgId = messageQueue.shift()!;
      const entry = messages.get(msgId)!;
      entry.status = "processing";
      iteration++;
      postWebhook("container.processing", { iteration });

      log(`=== Message ${msgId} (iteration ${iteration}) ===`);
      log(`Initial revision: ${getRevision(REPO_DIR)}`);

      const messageStartTime = Date.now();
      try {
        const result = await processMessage(entry.prompt, extraArgs, log, onEvent, interactiveSessionId);
        entry.result = result;
        entry.status = "done";

        // Capture session ID for resuming subsequent messages
        if (result.session_id) {
          interactiveSessionId = result.session_id;
        }

        if (result.cost_usd != null) {
          totalCost += result.cost_usd;
          log(`Cost: $${result.cost_usd.toFixed(4)} (total: $${totalCost.toFixed(4)})`);
        }

        postWebhook("message.done", {
          messageId: msgId,
          cost_usd: result.cost_usd ?? 0,
          duration_ms: Date.now() - messageStartTime,
          num_turns: result.num_turns ?? 0,
        });
      } catch (e: any) {
        entry.status = "error";
        entry.error = e.message;
        log(`Error: ${e.message}`);
        postWebhook("message.error", { messageId: msgId, error: e.message });
      }

      lastActivityAt = new Date().toISOString();

      // Final commit and push after message
      if (!stopRequested) {
        const summary = entry.prompt.length > 72 ? entry.prompt.slice(0, 69) + "..." : entry.prompt;
        archiveCurrentLog(LOGS_DIR, CONTAINER_NAME, iteration);
        commitAndPushTarget(`${CONTAINER_NAME} iteration ${iteration}: ${summary}`, PUSH_BRANCH, log, () => stopRequested, REPO_DIR);
        log(`Final revision: ${getRevision(REPO_DIR)}`);
      }

      state = "idle";
      postWebhook("container.idle", { pendingTasks: getPendingTaskCount(), queueLength: messageQueue.length });
      continue;
    }

    // Process pending tasks (after message handling above, or standalone)
    const pendingTasks = getPendingTaskCount();
    if (!stopRequested && pendingTasks > 0) {
      log(`Processing ${pendingTasks} pending task(s)...`);
      state = "processing";
      postWebhook("container.processing", { iteration });
      postWebhook("task.started", { pendingTasks });
      const jobResult = await processTasks(
        extraArgs,
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
      );
      tasksProcessed += jobResult.tasksProcessed;
      totalCost += jobResult.totalCost;
      log(`Task processing complete. ${jobResult.tasksProcessed} task(s) processed, cost: $${jobResult.totalCost.toFixed(4)}`);
      postWebhook("task.done", { tasksProcessed: jobResult.tasksProcessed, totalCost: jobResult.totalCost });
      state = "idle";
      postWebhook("container.idle", { pendingTasks: getPendingTaskCount(), queueLength: messageQueue.length });
      continue;
    }

    // Check for detach: exit when queue is empty and no pending tasks
    if (detachRequested && messageQueue.length === 0 && getPendingTaskCount() === 0) {
      log("Detach requested and all work complete. Shutting down.");
      break;
    }

    // Wait for something to happen
    log(`Idle. Queue: ${messageQueue.length} messages, ${getPendingTaskCount()} tasks pending. Waiting...`);
    state = "idle";
    postWebhook("container.idle", { pendingTasks: getPendingTaskCount(), queueLength: messageQueue.length });
    await waitForWake();
  }

  state = "stopping";
  postWebhook("container.stopping", {});
  log("Server shutting down.");

  // Commit and push any remaining work on stop
  if (stopRequested) {
    try {
      iteration++;
      archiveCurrentLog(LOGS_DIR, CONTAINER_NAME, iteration);
      commitAndPushTarget(`Final work from ${CONTAINER_NAME}`, PUSH_BRANCH, log, () => true, REPO_DIR);
    } catch (e: any) {
      log(`Warning: failed to push final work: ${e.message}`);
    }
  }

  state = "stopped";
  postWebhook("container.stopped", {});

  // Wait briefly for final status polls before exiting
  setTimeout(() => process.exit(0), 5000);
}

// --- HTTP server ---

const server = createServer(async (req, res) => {
  const url = req.url ?? "/";
  const method = req.method ?? "GET";

  try {
    // POST /message
    if (method === "POST" && url === "/message") {
      const body = JSON.parse(await readBody(req));
      const prompt = body.prompt;
      if (!prompt || typeof prompt !== "string") {
        json(res, 400, { error: "prompt is required" });
        return;
      }
      const id = String(nextMessageId++);
      const entry: MessageEntry = { id, prompt, status: "queued" };
      messages.set(id, entry);
      messageQueue.push(id);
      postWebhook("message.queued", { messageId: id, prompt });
      wake();
      json(res, 200, { id });
      return;
    }

    // GET /message/:id
    const msgId = routeMatch(url, "/message/:id");
    if (method === "GET" && msgId !== null) {
      const entry = messages.get(msgId);
      if (!entry) {
        json(res, 404, { error: "message not found" });
        return;
      }
      json(res, 200, {
        id: entry.id,
        status: entry.status,
        result: entry.result ?? null,
        error: entry.error ?? null,
      });
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
      if (currentClaudeProcess) {
        currentClaudeProcess.kill("SIGINT");
        json(res, 200, { interrupted: true });
      } else {
        json(res, 200, { interrupted: false, message: "no active process" });
      }
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
      // Kill any running claude process
      if (currentClaudeProcess) {
        currentClaudeProcess.kill("SIGINT");
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
        queueLength: messageQueue.length,
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

  // Clone repo
  if (!REPO_URL) {
    startupLog("Fatal: REPO_URL environment variable is required");
    process.exit(1);
  }

  const cloneUrl = toTokenUrl(REPO_URL, process.env.GITHUB_TOKEN);
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
    logBuffer.append(line);
    postWebhook("log", { line });
  });

  // Checkout target branch if different from clone branch
  if (PUSH_BRANCH !== CLONE_BRANCH) {
    log(`Checking out target branch ${PUSH_BRANCH}...`);
    checkoutTargetBranch(PUSH_BRANCH, log, REPO_DIR);
  }

  log(`Revision: ${getRevision(REPO_DIR)}`);
  log(`Push branch: ${PUSH_BRANCH}`);

  // Absorb task files from other containers before checking task count
  absorbForeignTaskFiles(log);

  log(`Pending tasks: ${getPendingTaskCount()}`);

  // Change working directory to repo
  process.chdir(REPO_DIR);

  // Start HTTP server
  server.listen(PORT, () => {
    log(`HTTP server listening on port ${PORT}`);
    state = "idle";
    postWebhook("container.started", { pushBranch: PUSH_BRANCH, revision: getRevision(REPO_DIR) });
    postWebhook("container.idle", { pendingTasks: getPendingTaskCount(), queueLength: messageQueue.length });
  });

  // Start processing loop
  processLoop();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
