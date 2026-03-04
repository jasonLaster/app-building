import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
import { loadDotEnv, FileContainerRegistry, type ContainerConfig, httpGet, httpPost, type RegistryEntry, httpOptsFor } from "./package";
import { stopRemoteContainer } from "./remote-container";
import { RED, RESET } from "./format";

async function waitForStopped(baseUrl: string, timeoutMs: number = 120000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const status = await httpGet(`${baseUrl}/status`, { timeout: 5000 });
      if (status.state === "stopped") {
        return;
      }
    } catch {
      // Server may have already exited
      return;
    }
  }
}

async function stopEntry(config: ContainerConfig, entry: RegistryEntry): Promise<void> {
  console.log(`Stopping container ${entry.containerName}...`);
  const httpOpts = httpOptsFor(entry);

  // Send HTTP stop signal to the container's server
  try {
    await httpPost(`${entry.baseUrl}/stop`, undefined, httpOpts);
    console.log("Stop signal sent. Waiting for graceful shutdown...");
  } catch {
    console.log("Could not reach container (may already be stopped).");
  }

  // Wait for the server to reach "stopped" state
  await waitForStopped(entry.baseUrl);

  // Show the last "Pushed" log line
  try {
    const data = await httpGet(`${entry.baseUrl}/logs?offset=0`, { ...httpOpts, timeout: 5000 });
    const lines: string[] = data.items ?? [];
    const pushLine = [...lines].reverse().find((l: string) => l.includes("Pushed to "));
    if (pushLine) {
      console.log(pushLine);
    }
  } catch {
    // Server already gone
  }

  if (entry.type === "remote") {
    // Destroy the Fly machine so it doesn't sit idle and cost money
    await stopRemoteContainer(config, entry);
    return;
  }

  // Wait for local container to exit
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      await fetch(`${entry.baseUrl}/status`);
      // Still running, keep waiting
    } catch {
      // Connection refused = container is gone
      console.log("Container stopped.");
      config.registry.markStopped(entry.containerName);
      return;
    }
  }

  console.error("Container did not stop within 5 seconds.");
  process.exit(1);
}

async function main(): Promise<void> {
  const projectRoot = resolve(__dirname, "..");
  const envVars = loadDotEnv(projectRoot);
  const config: ContainerConfig = {
    projectRoot,
    envVars,
    registry: new FileContainerRegistry(resolve(projectRoot, ".container-registry.jsonl")),
    flyToken: envVars.FLY_API_TOKEN,
    flyApp: envVars.FLY_APP_NAME,
  };

  const targetName = process.argv[2];

  if (targetName) {
    // Stop a specific container by name from the registry
    const entry = config.registry.find(targetName);
    if (!entry) {
      console.error(`${RED}Container "${targetName}" not found in registry.${RESET}`);
      process.exit(1);
    }
    await stopEntry(config, entry);
    return;
  }

  // No name given: find all alive containers and stop them.
  const alive = await config.registry.findAlive();

  if (alive.length === 0) {
    console.log("No running containers found.");
    return;
  }

  for (const entry of alive) {
    await stopEntry(config, entry);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
