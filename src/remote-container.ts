import {
  createMachine, waitForMachine, destroyMachine, listMachines,
  type CreateMachineResult,
} from "./package/fly";
import { getImageRef } from "./package/image-ref";
import type { AgentState, ContainerConfig, RepoOptions } from "./package/container";

function debugLog(...args: unknown[]): void {
  if (process.env.DEBUG) console.log("[container]", ...args);
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

export async function startRemoteContainer(
  config: ContainerConfig,
  repo: RepoOptions,
): Promise<AgentState> {
  debugLog("startRemoteContainer config:", {
    projectRoot: config.projectRoot,
    flyApp: config.flyApp,
    imageRef: config.imageRef,
    webhookUrl: config.webhookUrl,
    detached: config.detached,
    initialPrompt: config.initialPrompt ? `${config.initialPrompt.slice(0, 100)}...` : undefined,
    envVarKeys: Object.keys(config.envVars),
  });
  debugLog("startRemoteContainer repo:", repo);

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
  if (config.webhookSecret) remoteExtra.WEBHOOK_SECRET = config.webhookSecret;
  if (config.detached) remoteExtra.DETACHED = "1";
  if (config.initialPrompt) remoteExtra.INITIAL_PROMPT = config.initialPrompt;
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

  // Register immediately so the container is tracked even if startup times out
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
    // Clean up machine and volume if we can't reach it
    console.log("Timed out waiting for machine, destroying...");
    await destroyMachine(config.flyApp, config.flyToken, machineId, volumeId).catch(() => {});
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
  await destroyMachine(state.flyApp, config.flyToken, state.flyMachineId, state.flyVolumeId);
  console.log("Machine destroyed.");

  config.registry.markStopped(state.containerName);
}
