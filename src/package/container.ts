import { execFileSync, spawn } from "child_process";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import type { ContainerRegistry } from "./container-registry";
import type { InfisicalConfig } from "./secrets";

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
  execFileSync("docker", ["build", "--network", "host", "-t", IMAGE_NAME, config.projectRoot], {
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
    execFileSync("docker", ["build", "--network", "host", "-t", IMAGE_NAME, projectRoot], {
      stdio: "inherit",
      timeout: 600000,
    });
    console.log("Docker image built successfully.");
  }
}

function findFreePort(): number {
  let port = 3100;
  try {
    const out = execFileSync("ss", ["-tlnH"], {
      encoding: "utf-8",
      timeout: 5000,
    });
    const usedPorts = new Set<number>();
    for (const match of out.matchAll(/:(\d+)\s/g)) {
      usedPorts.add(parseInt(match[1], 10));
    }
    while (usedPorts.has(port)) port++;
  } catch {
    // ss not available, just use default
  }
  return port;
}

function infisicalEnvVars(config: InfisicalConfig): Record<string, string> {
  return {
    INFISICAL_TOKEN: config.token,
    INFISICAL_PROJECT_ID: config.projectId,
    INFISICAL_ENVIRONMENT: config.environment,
  };
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
    ...infisicalEnvVars(infisical),
    ...extra,
  };
  if (process.env.DEBUG) {
    env.DEBUG = process.env.DEBUG;
  }
  return env;
}

export async function startContainer(
  config: ContainerConfig,
  repo: RepoOptions,
): Promise<AgentState> {
  debugLog("startContainer config:", {
    projectRoot: config.projectRoot,
    flyApp: config.flyApp,
    imageRef: config.imageRef,
    webhookUrl: config.webhookUrl,
    detached: config.detached,
    initialPrompt: config.initialPrompt ? `${config.initialPrompt.slice(0, 100)}...` : undefined,
  });
  debugLog("startContainer repo:", repo);

  buildImage(config);

  const uniqueId = Math.random().toString(36).slice(2, 8);
  const containerName = `app-building-${uniqueId}`;
  const containerPort = 3000;
  const hostPort = config.localPort ?? findFreePort();

  const extra: Record<string, string> = {
    PORT: String(containerPort),
    CONTAINER_NAME: containerName,
  };
  if (config.webhookUrl) extra.WEBHOOK_URL = config.webhookUrl;
  if (config.webhookSecret) extra.WEBHOOK_SECRET = config.webhookSecret;
  if (config.detached) extra.DETACHED = "1";
  if (config.initialPrompt) extra.INITIAL_PROMPT = config.initialPrompt;
  if (config.absorbTasks) extra.ABSORB_TASKS = "1";
  const containerEnv = buildContainerEnv(repo, config.infisical, extra);

  // Build docker run args
  const args: string[] = ["run", "-d", "--rm", "--name", containerName];

  // Use explicit port mapping for macOS Docker Desktop compatibility
  // (--network host only works on Linux)
  args.push("-p", `${hostPort}:${containerPort}`);

  for (const [k, v] of Object.entries(containerEnv)) {
    args.push("--env", `${k}=${v}`);
  }

  // Image name — CMD is baked in (server.ts)
  args.push(IMAGE_NAME);

  const containerId = execFileSync("docker", args, {
    encoding: "utf-8",
    timeout: 30000,
  }).trim();

  console.log(`Container started: ${containerId.slice(0, 12)} (${containerName})`);

  // Wait for the HTTP server to become ready
  const baseUrl = `http://127.0.0.1:${hostPort}`;
  const maxWait = 120000; // clone can take a while
  const interval = 1000;
  const start = Date.now();
  let ready = false;

  while (Date.now() - start < maxWait) {
    // Check if the container is still alive (--rm removes it on exit)
    try {
      execFileSync(
        "docker",
        ["inspect", "--format", "{{.State.Running}}", containerName],
        { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"], timeout: 5000 },
      );
    } catch {
      // Container is gone — grab logs from docker if possible, otherwise just report
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

  const agentState: AgentState = { type: "local", containerName, port: hostPort, baseUrl };
  config.registry.log(agentState);

  return agentState;
}

export function stopContainer(config: ContainerConfig, containerName: string): void {
  try {
    execFileSync("docker", ["stop", containerName], { stdio: "ignore", timeout: 30000 });
  } catch {
    // Container may already be stopped
  }
  config.registry.markStopped(containerName);
}

export function spawnTestContainer(config: ContainerConfig): Promise<void> {
  if (!config.projectRoot) throw new Error("projectRoot is required for local Docker operations");
  ensureImageExists(config.projectRoot);

  const uniqueId = Math.random().toString(36).slice(2, 8);
  const containerName = `app-building-test-${uniqueId}`;

  const infisicalVars = infisicalEnvVars(config.infisical);

  const args: string[] = ["run", "-it", "--rm", "--name", containerName];
  args.push("-v", `${config.projectRoot}:/repo`);
  args.push("-w", "/repo");
  args.push("--network", "host");
  args.push("--user", `${process.getuid!()}:${process.getgid!()}`);
  args.push("--env", "HOME=/repo/.agent-home");
  args.push("--env", "PLAYWRIGHT_BROWSERS_PATH=/opt/playwright");
  for (const [k, v] of Object.entries(infisicalVars)) {
    args.push("--env", `${k}=${v}`);
  }
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
