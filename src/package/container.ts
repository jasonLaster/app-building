import { execFileSync, spawn } from "child_process";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { platform } from "os";
import type { ContainerRegistry, RegistryEntry } from "./container-registry";
import type { InfisicalConfig } from "./secrets";
import { createMachine, waitForMachine, destroyMachine, listMachines } from "./fly";
import { getImageRef } from "./image-ref";

const IMAGE_NAME = "app-building";

function debugLog(...args: unknown[]): void {
  if (process.env.DEBUG) console.log("[container]", ...args);
}

export interface AgentState {
  type: "local" | "remote";
  containerName: string;
  port: number;
  baseUrl: string;
  flyApp?: string;
  flyMachineId?: string;
  flyVolumeId?: string;
}

export interface ContainerConfig {
  projectRoot?: string;
  /** Infisical credentials — required for all containers. */
  infisical: InfisicalConfig;
  registry: ContainerRegistry;
  flyToken?: string;
  flyApp?: string;
  imageRef?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  /** Start the container in detached mode. It will exit after processing all messages and tasks. */
  detached?: boolean;
  /** Initial prompt to queue at container startup (before the HTTP server accepts external requests). */
  initialPrompt?: string;
  /** Override the host port for local containers (default: auto-selected). */
  localPort?: number;
  /** Absorb task files from other containers at startup. Default: false. */
  absorbTasks?: boolean;
  /** Container name prefix. Default: "app-building". */
  namePrefix?: string;
}

export interface RepoOptions {
  repoUrl: string;
  cloneBranch: string;
  pushBranch: string;
}

export function loadDotEnv(projectRoot: string): Record<string, string> {
  const envPath = resolve(projectRoot, ".env");
  if (!existsSync(envPath)) {
    return {};
  }
  const content = readFileSync(envPath, "utf-8");
  const vars: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

export function buildImage(config: ContainerConfig): void {
  if (!config.projectRoot) throw new Error("projectRoot is required for local Docker operations");
  console.log("Building Docker image...");
  execFileSync("docker", ["build", "--platform", "linux/amd64", "--network", "host", "-t", IMAGE_NAME, config.projectRoot], {
    stdio: "inherit",
    timeout: 600000,
  });
  console.log("Docker image built successfully.");
}

function ensureImageExists(projectRoot: string): void {
  try {
    execFileSync("docker", ["image", "inspect", IMAGE_NAME], {
      stdio: "ignore",
    });
  } catch {
    console.log("Building Docker image...");
    execFileSync("docker", ["build", "--platform", "linux/amd64", "--network", "host", "-t", IMAGE_NAME, projectRoot], {
      stdio: "inherit",
      timeout: 600000,
    });
    console.log("Docker image built successfully.");
  }
}

function findFreePort(): number {
  let port = 3100;
  const usedPorts = new Set<number>();
  try {
    const [cmd, args] = platform() === "linux"
      ? ["ss", ["-tlnH"]] as const
      : ["lsof", ["-iTCP", "-sTCP:LISTEN", "-nP"]] as const;
    const out = execFileSync(cmd, [...args], { encoding: "utf-8", timeout: 5000 });
    for (const match of out.matchAll(/:(\d+)\s/g)) {
      usedPorts.add(parseInt(match[1], 10));
    }
  } catch {
    // Command unavailable or failed — fall through to default
  }
  while (usedPorts.has(port)) port++;
  return port;
}

function buildContainerEnv(
  repo: RepoOptions,
  infisical: InfisicalConfig,
  extra: Record<string, string> = {},
): Record<string, string> {
  const env: Record<string, string> = {
    REPO_URL: repo.repoUrl,
    CLONE_BRANCH: repo.cloneBranch,
    PUSH_BRANCH: repo.pushBranch,
    GIT_AUTHOR_NAME: "App Builder",
    GIT_AUTHOR_EMAIL: "app-builder@localhost",
    GIT_COMMITTER_NAME: "App Builder",
    GIT_COMMITTER_EMAIL: "app-builder@localhost",
    PLAYWRIGHT_BROWSERS_PATH: "/opt/playwright",
    INFISICAL_TOKEN: infisical.token,
    INFISICAL_PROJECT_ID: infisical.projectId,
    INFISICAL_ENVIRONMENT: infisical.environment,
    ...extra,
  };
  if (process.env.DEBUG) {
    env.DEBUG = process.env.DEBUG;
  }
  return env;
}

function buildExtraEnv(config: ContainerConfig, containerName: string): Record<string, string> {
  const extra: Record<string, string> = {
    PORT: "3000",
    CONTAINER_NAME: containerName,
  };
  if (config.webhookUrl) extra.WEBHOOK_URL = config.webhookUrl;
  if (config.webhookSecret) extra.WEBHOOK_SECRET = config.webhookSecret;
  if (config.detached) extra.DETACHED = "1";
  if (config.initialPrompt) extra.INITIAL_PROMPT = config.initialPrompt;
  if (config.absorbTasks) extra.ABSORB_TASKS = "1";
  return extra;
}

function isRemote(config: ContainerConfig): boolean {
  return !!(config.flyToken && config.flyApp);
}

// ---------------------------------------------------------------------------
// Local container
// ---------------------------------------------------------------------------

async function startLocalContainer(
  config: ContainerConfig,
  repo: RepoOptions,
): Promise<AgentState> {
  buildImage(config);

  const uniqueId = Math.random().toString(36).slice(2, 8);
  const prefix = config.namePrefix ?? "app-building";
  const containerName = `${prefix}-${uniqueId}`;
  const containerPort = 3000;
  const hostPort = config.localPort ?? findFreePort();

  const extra = buildExtraEnv(config, containerName);
  extra.PORT = String(containerPort);
  const containerEnv = buildContainerEnv(repo, config.infisical, extra);

  const args: string[] = ["run", "--platform", "linux/amd64", "-d", "--rm", "--name", containerName];
  args.push("-p", `${hostPort}:${containerPort}`);
  for (const [k, v] of Object.entries(containerEnv)) {
    args.push("--env", `${k}=${v}`);
  }
  args.push(IMAGE_NAME);

  const containerId = execFileSync("docker", args, {
    encoding: "utf-8",
    timeout: 30000,
  }).trim();

  console.log(`Container started: ${containerId.slice(0, 12)} (${containerName})`);

  const baseUrl = `http://127.0.0.1:${hostPort}`;
  const maxWait = 120000;
  const interval = 1000;
  const start = Date.now();
  let ready = false;

  while (Date.now() - start < maxWait) {
    try {
      execFileSync(
        "docker",
        ["inspect", "--format", "{{.State.Running}}", containerName],
        { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"], timeout: 5000 },
      );
    } catch {
      let logs = "";
      try {
        logs = execFileSync("docker", ["logs", "--tail", "30", containerName], {
          encoding: "utf-8",
          timeout: 5000,
        });
      } catch {
        // Container already removed (--rm)
      }
      throw new Error(
        `Container exited during startup.${logs ? `\n\n--- container logs ---\n${logs}` : " (no logs available, container was removed)"}`,
      );
    }

    try {
      const res = await fetch(`${baseUrl}/status`);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {
      // Not ready yet
    }
    await new Promise((r) => setTimeout(r, interval));
  }

  if (!ready) {
    throw new Error("Container did not become ready within timeout");
  }

  return { type: "local", containerName, port: hostPort, baseUrl };
}

function stopLocalContainer(containerName: string): void {
  try {
    execFileSync("docker", ["stop", containerName], { stdio: "ignore", timeout: 30000 });
  } catch {
    // Container may already be stopped
  }
}

// ---------------------------------------------------------------------------
// Remote container (Fly.io)
// ---------------------------------------------------------------------------

async function startRemoteContainerImpl(
  config: ContainerConfig,
  repo: RepoOptions,
): Promise<AgentState> {
  if (!config.flyToken) throw new Error("flyToken is required for remote containers");
  if (!config.flyApp) throw new Error("flyApp is required for remote containers");

  const imageRef = config.imageRef ?? getImageRef();

  const uniqueId = Math.random().toString(36).slice(2, 8);
  const prefix = config.namePrefix ?? "app-building";
  const machineName = `${prefix}-${uniqueId}`;

  const extra = buildExtraEnv(config, machineName);
  const containerEnv = buildContainerEnv(repo, config.infisical, extra);

  const existing = await listMachines(config.flyApp, config.flyToken);
  if (existing.length > 0) {
    console.log(`${existing.length} existing machine(s) in ${config.flyApp}:`);
    for (const m of existing) {
      console.log(`  ${m.id} (${m.name}) — ${m.state}`);
    }
  }

  console.log("Creating Fly machine (with volume)...");
  let machineId = "";
  let volumeId = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const result = await createMachine(config.flyApp, config.flyToken, imageRef, containerEnv, machineName);
      machineId = result.machineId;
      volumeId = result.volumeId;
      break;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("MANIFEST_UNKNOWN") && attempt < 4) {
        console.log("Image not yet available in registry, retrying in 5s...");
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }
      throw err;
    }
  }
  console.log(`Machine created: ${machineId} (volume: ${volumeId})`);

  const baseUrl = `https://${config.flyApp}.fly.dev`;
  const agentState: AgentState = {
    type: "remote",
    containerName: machineName,
    port: 443,
    baseUrl,
    flyApp: config.flyApp,
    flyMachineId: machineId,
    flyVolumeId: volumeId,
  };

  console.log("Waiting for machine to start...");
  await waitForMachine(config.flyApp, config.flyToken, machineId);
  console.log("Machine started.");

  const maxWait = 180000;
  const interval = 2000;
  const start = Date.now();
  let ready = false;

  while (Date.now() - start < maxWait) {
    try {
      const res = await fetch(`${baseUrl}/status`, {
        headers: { "fly-force-instance-id": machineId },
      });
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {
      // Not ready yet
    }
    await new Promise((r) => setTimeout(r, interval));
  }

  if (!ready) {
    console.log("Timed out waiting for machine, destroying...");
    await destroyMachine(config.flyApp, config.flyToken, machineId, volumeId).catch(() => {});
    throw new Error("Remote container did not become ready within timeout");
  }

  return agentState;
}

async function stopRemoteContainerImpl(config: ContainerConfig, state: AgentState | RegistryEntry): Promise<void> {
  if (!state.flyApp || !state.flyMachineId) {
    throw new Error("Missing flyApp or flyMachineId in agent state");
  }
  if (!config.flyToken) throw new Error("flyToken is required to stop remote container");

  console.log(`Destroying Fly machine ${state.flyMachineId}...`);
  await destroyMachine(state.flyApp, config.flyToken, state.flyMachineId, state.flyVolumeId);
  console.log("Machine destroyed.");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Start a container (local Docker or remote Fly.io based on config).
 * If flyToken and flyApp are set, starts remotely; otherwise locally.
 */
export async function startContainer(
  config: ContainerConfig,
  repo: RepoOptions,
): Promise<AgentState> {
  const { token, projectId, environment } = config.infisical;
  if (!token || !projectId || !environment) {
    const missing = [
      !token && "token",
      !projectId && "projectId",
      !environment && "environment",
    ].filter(Boolean);
    throw new Error(`Missing Infisical credentials: ${missing.join(", ")}. Containers cannot start without Infisical.`);
  }

  debugLog("startContainer config:", {
    projectRoot: config.projectRoot,
    flyApp: config.flyApp,
    imageRef: config.imageRef,
    webhookUrl: config.webhookUrl,
    detached: config.detached,
    remote: isRemote(config),
    initialPrompt: config.initialPrompt ? `${config.initialPrompt.slice(0, 100)}...` : undefined,
  });
  debugLog("startContainer repo:", repo);

  const state = isRemote(config)
    ? await startRemoteContainerImpl(config, repo)
    : await startLocalContainer(config, repo);

  config.registry.log(state);
  return state;
}

/**
 * Stop a container by its state or registry entry.
 */
export async function stopContainer(
  config: ContainerConfig,
  state: AgentState | RegistryEntry,
): Promise<void> {
  if (state.type === "remote") {
    await stopRemoteContainerImpl(config, state);
  } else {
    stopLocalContainer(state.containerName);
  }
  config.registry.markStopped(state.containerName);
}

/**
 * Spawn an interactive test container (local only).
 */
export function spawnTestContainer(config: ContainerConfig): Promise<void> {
  if (!config.projectRoot) throw new Error("projectRoot is required for local Docker operations");
  ensureImageExists(config.projectRoot);

  const uniqueId = Math.random().toString(36).slice(2, 8);
  const containerName = `app-building-test-${uniqueId}`;

  const args: string[] = ["run", "--platform", "linux/amd64", "-it", "--rm", "--name", containerName];
  args.push("-v", `${config.projectRoot}:/repo`);
  args.push("-w", "/repo");
  args.push("--network", "host");
  args.push("--user", `${process.getuid!()}:${process.getgid!()}`);
  args.push("--env", "HOME=/repo/.agent-home");
  args.push("--env", "PLAYWRIGHT_BROWSERS_PATH=/opt/playwright");
  args.push("--env", `INFISICAL_TOKEN=${config.infisical.token}`);
  args.push("--env", `INFISICAL_PROJECT_ID=${config.infisical.projectId}`);
  args.push("--env", `INFISICAL_ENVIRONMENT=${config.infisical.environment}`);
  args.push(IMAGE_NAME, "bash");

  return new Promise((resolvePromise, reject) => {
    const child = spawn("docker", args, { stdio: "inherit" });
    child.on("close", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`Container exited with code ${code}`));
    });
    child.on("error", reject);
  });
}
