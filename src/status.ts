import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
import { httpGet, type HttpOptions, FileContainerRegistry, type RegistryEntry, httpOptsFor } from "./package";
import { formatLogLine, stripTimestamp, RESET, DIM, BOLD, CYAN, GREEN, YELLOW, RED } from "./format";

function displayFormattedLines(rawLines: string[]): void {
  for (const rawLine of rawLines) {
    const line = stripTimestamp(rawLine);
    const formatted = formatLogLine(line);
    if (formatted) console.log(formatted);
  }
}

function formatAge(isoDate: string): string {
  const ms = Date.now() - new Date(isoDate).getTime();
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

async function showHttpStatus(entry: RegistryEntry, httpOpts: HttpOptions = {}): Promise<void> {
  const status = await httpGet(`${entry.baseUrl}/status`, httpOpts);

  let stateLabel: string;
  if (status.state === "processing") {
    stateLabel = `${BOLD}${GREEN}PROCESSING${RESET}`;
  } else if (status.state === "idle") {
    stateLabel = `${BOLD}${GREEN}IDLE${RESET}`;
  } else if (status.state === "starting") {
    stateLabel = `${BOLD}${YELLOW}STARTING${RESET}`;
  } else if (status.state === "stopping") {
    stateLabel = `${YELLOW}STOPPING${RESET}`;
  } else {
    stateLabel = `${DIM}${status.state}${RESET}`;
  }

  const lastActivity = status.lastActivityAt ? `  ${DIM}last activity ${formatAge(status.lastActivityAt)}${RESET}` : "";
  console.log(`\n  ${stateLabel}  ${DIM}(${entry.containerName})${RESET}  ${DIM}started ${formatAge(entry.startedAt)}${RESET}${lastActivity}`);
  if (status.pushBranch) {
    console.log(`  ${DIM}Branch:${RESET}    ${status.pushBranch}`);
  }
  console.log(`  ${DIM}Server:${RESET}    ${entry.baseUrl}`);
  console.log(`  ${DIM}Revision:${RESET}  ${status.revision}`);

  const pendingTasks = status.pendingTasks ?? status.pendingGroups ?? 0;
  const tasksProcessed = status.tasksProcessed ?? status.groupsProcessed ?? 0;
  const queueInfo = `${status.queueLength} queued, ${pendingTasks} tasks pending`;
  console.log(`  ${DIM}Queue:${RESET}     ${queueInfo}`);
  console.log(`  ${DIM}Progress:${RESET}  ${tasksProcessed} tasks processed, iteration ${status.iteration}`);

  if (status.totalCost > 0) {
    console.log(`  ${DIM}Cost:${RESET}      $${status.totalCost.toFixed(4)}`);
  }

  if (status.detachRequested) {
    console.log(`  ${YELLOW}Detach requested — will exit when work complete${RESET}`);
  }
}

async function showRecentLogs(baseUrl: string, httpOpts: HttpOptions = {}, count?: number): Promise<void> {
  const maxLines = count ?? 20;
  const data = await httpGet(`${baseUrl}/logs?offset=0`, httpOpts);
  const rawLines: string[] = data.items;

  // Format all entries into display lines, then take the last N display lines.
  const displayLines: string[] = [];
  for (const rawLine of rawLines) {
    const line = stripTimestamp(rawLine);
    const formatted = formatLogLine(line);
    if (formatted) {
      for (const dl of formatted.split("\n")) {
        displayLines.push(dl);
      }
    }
  }

  const recent = maxLines === Infinity ? displayLines : displayLines.slice(-maxLines);
  console.log(`\n${BOLD}${CYAN}--- Recent output ---${RESET}`);
  for (const line of recent) {
    console.log(line);
  }
}

async function tailHttpLogs(baseUrl: string, httpOpts: HttpOptions = {}, contextCount?: number): Promise<void> {
  const count = contextCount ?? 20;
  const data = await httpGet(`${baseUrl}/logs?offset=0`, httpOpts);
  const lines: string[] = data.items;
  const recent = count === Infinity ? lines : lines.slice(-count);
  console.log(`\n${BOLD}${CYAN}--- Recent output ---${RESET}`);
  displayFormattedLines(recent);
  let offset = data.nextOffset;

  console.log(`\n${DIM}Tailing logs (Ctrl+C to stop)...${RESET}\n`);

  const poll = setInterval(async () => {
    try {
      const data = await httpGet(`${baseUrl}/logs?offset=${offset}`, httpOpts);
      for (const line of data.items) {
        const stripped = stripTimestamp(line);
        const formatted = formatLogLine(stripped);
        if (formatted) console.log(formatted);
      }
      offset = data.nextOffset;
    } catch (e) {
      clearInterval(poll);
      clearInterval(healthCheck);
      console.error(`\n${RED}Connection lost: ${e instanceof Error ? e.message : e}${RESET}\n`);
      process.exit(1);
    }
  }, 500);

  const exitTail = () => {
    clearInterval(poll);
    clearInterval(healthCheck);
    console.log(`\n${DIM}Container stopped.${RESET}\n`);
    process.exit(0);
  };

  const healthCheck = setInterval(async () => {
    try {
      const status = await httpGet(`${baseUrl}/status`, { ...httpOpts, timeout: 5000 });
      if (status.state === "stopped") exitTail();
    } catch {
      exitTail();
    }
  }, 2000);

  process.on("SIGINT", () => {
    clearInterval(poll);
    clearInterval(healthCheck);
    process.exit(0);
  });
}

function showStoppedEntries(entries: RegistryEntry[]): void {
  console.log(`\n${DIM}No running containers.${RESET}`);
  if (entries.length === 0) {
    console.log(`${DIM}No container history found.${RESET}`);
    return;
  }
  console.log(`\n${BOLD}Recent containers:${RESET}\n`);
  const sorted = [...entries].sort((a, b) => {
    const aTime = a.stoppedAt ?? a.startedAt;
    const bTime = b.stoppedAt ?? b.startedAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });
  for (const entry of sorted.slice(0, 10)) {
    const started = formatAge(entry.startedAt);
    const stopped = entry.stoppedAt ? formatAge(entry.stoppedAt) : "unknown";
    console.log(`  ${DIM}${entry.containerName}${RESET}  ${entry.type}  started ${started}  stopped ${stopped}`);
  }
}

async function showAllContainers(alive: RegistryEntry[], contextCount?: number): Promise<void> {
  console.log(`\n${BOLD}${alive.length} running containers:${RESET}`);
  for (const entry of alive) {
    const opts = httpOptsFor(entry);
    try {
      await showHttpStatus(entry, opts);
      await showRecentLogs(entry.baseUrl, opts, contextCount);
    } catch {
      console.log(`\n  ${RED}UNREACHABLE${RESET}  ${DIM}(${entry.containerName})${RESET}`);
      console.log(`  ${DIM}Server:${RESET}    ${entry.baseUrl}`);
    }
  }
  console.log(`\n${DIM}Use: npm run status -- --tail <containerName> to tail a specific container${RESET}`);
}

// --- Main ---

const KNOWN_FLAGS: Record<string, number> = {
  "--tail": 1,     // consumes 1 arg
  "--context": 1,
  "--all": 0,      // no arg
};

function parseArgs(args: string[]): { tailTarget: string | null; contextCount: number | undefined } {
  let tailTarget: string | null = null;
  let contextCount: number | undefined;
  let hasAll = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith("--")) {
      console.error(`${RED}Unexpected argument: ${arg}${RESET}`);
      process.exit(1);
    }
    const consumed = KNOWN_FLAGS[arg];
    if (consumed === undefined) {
      console.error(`${RED}Unknown flag: ${arg}${RESET}`);
      process.exit(1);
    }
    if (arg === "--tail") {
      tailTarget = args[++i];
      if (!tailTarget) {
        console.error(`${RED}--tail requires a container name${RESET}`);
        process.exit(1);
      }
    } else if (arg === "--context") {
      const val = args[++i];
      if (val === "all") {
        contextCount = Infinity;
      } else {
        const n = parseInt(val, 10);
        if (isNaN(n) || n < 1) {
          console.error(`${RED}--context requires a positive number or "all"${RESET}`);
          process.exit(1);
        }
        contextCount = n;
      }
    } else if (arg === "--all") {
      hasAll = true;
    }
  }

  if (hasAll && contextCount === undefined) {
    contextCount = Infinity;
  }

  return { tailTarget, contextCount };
}

async function main(): Promise<void> {
  const { tailTarget, contextCount } = parseArgs(process.argv.slice(2));

  const projectRoot = resolve(__dirname, "..");
  const registry = new FileContainerRegistry(resolve(projectRoot, ".container-registry.jsonl"));

  const entries = registry.getRecent();

  // If --tail <name>, find that container and tail it
  if (tailTarget) {
    const entry = entries.find((e) => e.containerName === tailTarget);
    if (!entry) {
      console.error(`${RED}Container "${tailTarget}" not found in registry.${RESET}`);
      process.exit(1);
    }
    const opts = httpOptsFor(entry);
    try {
      await showHttpStatus(entry, opts);
    } catch {
      console.error(`${RED}Cannot reach container "${tailTarget}" at ${entry.baseUrl} — may be stopped.${RESET}`);
      process.exit(1);
    }
    await tailHttpLogs(entry.baseUrl, opts, contextCount);
    return;
  }

  const alive = await registry.findAlive();

  if (alive.length === 0) {
    showStoppedEntries(entries);
  } else if (alive.length === 1) {
    // Single alive container — show status and tail logs (original behavior)
    const opts = httpOptsFor(alive[0]);
    try {
      await showHttpStatus(alive[0], opts);
    } catch {
      console.error(`${RED}Cannot reach agent at ${alive[0].baseUrl} — container may be stopped.${RESET}`);
      process.exit(1);
    }
    await tailHttpLogs(alive[0].baseUrl, opts, contextCount);
  } else {
    // Multiple alive — show status and recent logs for each, then exit
    await showAllContainers(alive, contextCount);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
