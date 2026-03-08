import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { Command } from "commander";

const __dirname = dirname(fileURLToPath(import.meta.url));
import { loadDotEnv, FileContainerRegistry, type ContainerConfig, startContainer, stopContainer, httpGet, httpPost, type HttpOptions, httpOptsFor } from "./package";
import { startRemoteContainer } from "./remote-container";
import { getLocalRemoteUrl, getLocalBranch } from "./git";
import { formatEvent } from "./format";

// --- Input helpers ---

function readInput(): Promise<string | null> {
  return new Promise((resolve) => {
    let buffer = "";
    let resolved = false;

    const finish = (result: string | null) => {
      if (resolved) return;
      resolved = true;
      process.stdin.removeListener("data", onData);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      process.stdin.pause();
      resolve(result);
    };

    process.stdout.write("> ");

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();

    const onData = (data: Buffer) => {
      const str = data.toString("utf-8");

      // Ctrl+C or Ctrl+D -> EOF
      if (data.length === 1 && (data[0] === 0x03 || data[0] === 0x04)) {
        process.stdout.write("\n");
        finish(null);
        return;
      }

      // Enter -> submit
      if (str === "\r" || str === "\n" || str === "\r\n") {
        process.stdout.write("\n");
        finish(buffer);
        return;
      }

      // Backspace
      if (data.length === 1 && (data[0] === 0x7f || data[0] === 0x08)) {
        if (buffer.length > 0) {
          buffer = buffer.slice(0, -1);
          process.stdout.write("\b \b");
        }
        return;
      }

      // Ignore escape sequences (arrows, etc.)
      if (data[0] === 0x1b) {
        return;
      }

      // Regular input or paste
      const normalized = str.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      buffer += normalized;
      process.stdout.write(normalized);
    };

    process.stdin.on("data", onData);
  });
}

// --- Event polling ---

async function pollEvents(
  baseUrl: string,
  startOffset: number,
  signal: AbortSignal,
  httpOpts: HttpOptions,
): Promise<number> {
  let offset = startOffset;

  while (!signal.aborted) {
    try {
      const data = await httpGet(`${baseUrl}/events?offset=${offset}`, httpOpts);
      const nextOffset = typeof data.nextOffset === "number" ? data.nextOffset : offset;
      // Only process if the server reports a higher offset (new events)
      if (nextOffset > offset && Array.isArray(data.items)) {
        for (const line of data.items) {
          try {
            const event = JSON.parse(line);
            const formatted = formatEvent(event);
            if (formatted) console.log(formatted);
          } catch {
            // not JSON, skip
          }
        }
        offset = nextOffset;
      }
    } catch {
      // Server may be busy, retry
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  return offset;
}

// --- Wait for server to become idle (task completed) ---

async function waitForIdle(
  baseUrl: string,
  signal: AbortSignal,
  httpOpts: HttpOptions,
): Promise<void> {
  let pollCount = 0;
  while (!signal.aborted) {
    try {
      const data = await httpGet(`${baseUrl}/status`, httpOpts);
      pollCount++;
      console.log(`waitForIdle poll #${pollCount}: state=${data.state} pendingTasks=${data.pendingTasks} tasksProcessed=${data.tasksProcessed}`);
      if ((data.state === "idle" && data.pendingTasks === 0) || data.state === "stopping" || data.state === "stopped") {
        console.log(`waitForIdle done after ${pollCount} polls: state=${data.state}`);
        return;
      }
    } catch (err) {
      pollCount++;
      console.log(`waitForIdle poll #${pollCount} error: ${err instanceof Error ? err.message : err}`);
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  console.log(`waitForIdle aborted after ${pollCount} polls`);
}

// --- Interactive mode ---

async function runInteractive(config: ContainerConfig, opts: {
  repo: string;
  branch: string;
  pushBranch: string;
  remote?: boolean;
}): Promise<void> {
  const repo = { repoUrl: opts.repo, cloneBranch: opts.branch, pushBranch: opts.pushBranch };
  const state = opts.remote
    ? await startRemoteContainer(config, repo)
    : await startContainer(config, repo);

  const { containerName, baseUrl } = state;
  const httpOpts = httpOptsFor(state);

  console.log(`Container: ${containerName}`);
  console.log(`Server: ${baseUrl}`);

  process.on("SIGINT", () => {
    httpPost(`${baseUrl}/detach`, undefined, httpOpts)
      .then(() => console.log("Detached from container. It will exit when work completes."))
      .catch(() => console.log("Failed to detach, container may still be running."))
      .finally(() => process.exit(0));
  });

  let eventOffset = 0;

  try {
    while (true) {
      const input = await readInput();
      if (input === null) break;
      if (!input.trim()) continue;

      console.log("...");

      try {
        await httpPost(`${baseUrl}/message`, { prompt: input }, httpOpts);

        // Poll events in background while waiting
        const abortController = new AbortController();

        // Listen for ESC to interrupt
        let interrupted = false;
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(true);
        }
        process.stdin.resume();
        const onKey = (data: Buffer) => {
          if (data[0] === 0x1b) {
            interrupted = true;
            httpPost(`${baseUrl}/interrupt`, undefined, httpOpts).catch(() => {});
            console.log("\nInterrupted.");
          }
        };
        process.stdin.on("data", onKey);

        // Poll events and wait for completion concurrently
        const eventPoll = pollEvents(baseUrl, eventOffset, abortController.signal, httpOpts);
        await waitForIdle(baseUrl, abortController.signal, httpOpts);

        // Stop event polling and capture final offset
        abortController.abort();
        eventOffset = await eventPoll.catch(() => eventOffset);

        // Tear down ESC listener
        process.stdin.removeListener("data", onKey);
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
        }
        process.stdin.pause();
      } catch (err) {
        console.error(`\nError: ${err instanceof Error ? err.message : err}`);
        // Reset stdin state and continue the interactive loop
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false);
        }
        process.stdin.pause();
      }
    }
  } finally {
    // Send detach so container finishes any remaining work and exits
    try {
      await httpPost(`${baseUrl}/detach`, undefined, httpOpts);
      console.log("Detached from container. It will exit when work completes.");
    } catch {
      stopContainer(config, containerName);
    }
  }
}

// --- Detached mode ---

async function runDetached(config: ContainerConfig, opts: {
  repo: string;
  branch: string;
  pushBranch: string;
  remote?: boolean;
}): Promise<void> {
  const repo = { repoUrl: opts.repo, cloneBranch: opts.branch, pushBranch: opts.pushBranch };
  const state = opts.remote
    ? await startRemoteContainer(config, repo)
    : await startContainer(config, repo);

  console.log(`Container: ${state.containerName}`);
  console.log(`Server: ${state.baseUrl}`);
  console.log("Detached. Container will exit when all work is complete.");
  console.log(`Monitor: npm run status`);
  console.log(`Stop: npm run stop`);
}

// --- Main ---

async function main(): Promise<void> {
  const program = new Command();
  program
    .option("-i, --interactive", "interactive mode")
    .option("-p, --prompt <text>", "handle a prompt before consuming jobs")
    .option("--repo <url>", "git repo URL to clone")
    .option("--branch <name>", "branch to clone")
    .option("--push-branch <name>", "branch to push to")
    .option("--remote", "run container on Fly.io instead of local Docker")
    .option("--webhook <url>", "webhook URL for container event notifications")
    .allowUnknownOption(false)
    .allowExcessArguments(false)
    .parse();

  const opts = program.opts();

  const repo = opts.repo ?? process.env.REPO_URL ?? getLocalRemoteUrl();
  const branch = opts.branch ?? process.env.CLONE_BRANCH ?? getLocalBranch();

  if (branch === "main") {
    console.error("Error: main branch is not allowed");
    process.exit(1);
  }

  const pushBranch = opts.pushBranch ?? branch;

  const projectRoot = resolve(__dirname, "..");
  const envVars = loadDotEnv(projectRoot);
  const config: ContainerConfig = {
    projectRoot,
    envVars,
    registry: new FileContainerRegistry(resolve(projectRoot, ".container-registry.jsonl")),
    flyToken: envVars.FLY_API_TOKEN,
    flyApp: envVars.FLY_APP_NAME,
    webhookUrl: opts.webhook,
  };

  if (opts.interactive) {
    await runInteractive(config, { repo, branch, pushBranch, remote: opts.remote });
  } else {
    config.detached = true;
    if (opts.prompt) config.initialPrompt = opts.prompt;
    await runDetached(config, { repo, branch, pushBranch, remote: opts.remote });
  }
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
