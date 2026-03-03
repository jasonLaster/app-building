import { execFileSync, spawn } from "child_process";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { createMachine, waitForMachine, destroyMachine, listMachines } from "./fly";
import { getImageRef } from "./image-ref";
import type { ContainerRegistry } from "./container-registry";

const IMAGE_NAME = "app-building";

export interface AgentState {
  type: "local" | "remote";
  containerName: string;
  port: number;
  baseUrl: string;
  flyApp?: string;
  flyMachineId?: string;
}

export interface ContainerConfig {
  projectRoot?: string;
  envVars: Record<string, string>;
  registry: ContainerRegistry;
  flyToken?: string;
  flyApp?: string;
  imageRef?: string;
  webhookUrl?: string;
  /** Start the container in detached mode. It will exit after processing all messages and tasks. */
  detached?: boolean;
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

function buildContainerEnv(
  repo: RepoOptions,
  envVars: Record<string, string>,
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
    ...envVars,
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
  buildImage(config);

  const uniqueId = Math.random().toString(36).slice(2, 8);
  const containerName = `app-building-${uniqueId}`;
  const hostPort = findFreePort();

  const extra: Record<string, string> = {
    PORT: String(hostPort),
    CONTAINER_NAME: containerName,
  };
  if (config.webhookUrl) extra.WEBHOOK_URL = config.webhookUrl;
  if (config.detached) extra.DETACHED = "1";
  const containerEnv = buildContainerEnv(repo, config.envVars, extra);

  // Build docker run args
  const args: string[] = ["run", "-d", "--rm", "--name", containerName];

  // --network host: container shares host network stack (no -p needed)
  args.push("--network", "host");

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

export async function startRemoteContainer(
  config: ContainerConfig,
  repo: RepoOptions,
): Promise<AgentState> {
  if (!config.flyToken) throw new Error("flyToken is required for remote containers");
  if (!config.flyApp) throw new Error("flyApp is required for remote containers");

  const imageRef = config.imageRef ?? getImageRef();

  const uniqueId = Math.random().toString(36).slice(2, 8);
  const machineName = `app-building-${uniqueId}`;

  // Build env vars for the machine
  const remoteExtra: Record<string, string> = {
    PORT: "3000",
    CONTAINER_NAME: machineName,
  };
  if (config.webhookUrl) remoteExtra.WEBHOOK_URL = config.webhookUrl;
  if (config.detached) remoteExtra.DETACHED = "1";
  const containerEnv = buildContainerEnv(repo, config.envVars, remoteExtra);

  // Log existing machines (but don't destroy — multiple containers may run concurrently)
  const existing = await listMachines(config.flyApp, config.flyToken);
  if (existing.length > 0) {
    console.log(`${existing.length} existing machine(s) in ${config.flyApp}:`);
    for (const m of existing) {
      console.log(`  ${m.id} (${m.name}) — ${m.state}`);
    }
  }

  // Retry machine creation — the registry tag may take a moment to propagate
  console.log("Creating Fly machine...");
  let machineId = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      machineId = await createMachine(config.flyApp, config.flyToken, imageRef, containerEnv, machineName);
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
  console.log(`Machine created: ${machineId}`);

  // Register immediately so the container is tracked even if startup times out
  const baseUrl = `https://${config.flyApp}.fly.dev`;
  const agentState: AgentState = {
    type: "remote",
    containerName: machineName,
    port: 443,
    baseUrl,
    flyApp: config.flyApp,
    flyMachineId: machineId,
  };
  config.registry.log(agentState);

  console.log("Waiting for machine to start...");
  await waitForMachine(config.flyApp, config.flyToken, machineId);
  console.log("Machine started.");

  // Poll the public URL until the HTTP server is ready, targeting this specific machine
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
    // Clean up machine if we can't reach it
    console.log("Timed out waiting for machine, destroying...");
    await destroyMachine(config.flyApp, config.flyToken, machineId).catch(() => {});
    throw new Error("Remote container did not become ready within timeout");
  }

  return agentState;
}

export async function stopRemoteContainer(config: ContainerConfig, state: AgentState): Promise<void> {
  if (!state.flyApp || !state.flyMachineId) {
    throw new Error("Missing flyApp or flyMachineId in agent state");
  }

  if (!config.flyToken) throw new Error("flyToken is required to stop remote container");

  console.log(`Destroying Fly machine ${state.flyMachineId}...`);
  await destroyMachine(state.flyApp, config.flyToken, state.flyMachineId);
  console.log("Machine destroyed.");
  config.registry.markStopped(state.containerName);
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

  const args: string[] = ["run", "-it", "--rm", "--name", containerName];
  args.push("-v", `${config.projectRoot}:/repo`);
  args.push("-w", "/repo");
  args.push("--network", "host");
  args.push("--user", `${process.getuid!()}:${process.getgid!()}`);
  args.push("--env", "HOME=/repo/.agent-home");
  args.push("--env", "PLAYWRIGHT_BROWSERS_PATH=/opt/playwright");
  for (const [k, v] of Object.entries(config.envVars)) {
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
