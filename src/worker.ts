import { ChildProcess, spawn } from "child_process";
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from "fs";
import { resolve, dirname, basename } from "path";
import type { Logger } from "./log";
import { ensureBranch } from "./git";

const REPO_ROOT = "/repo";
const LOGS_DIR = resolve(REPO_ROOT, "logs");
const CONTAINER_NAME = process.env.CONTAINER_NAME ?? "agent";
const TASKS_FILE = resolve(REPO_ROOT, `tasks/tasks-${CONTAINER_NAME}.json`);
const MAX_TASK_RETRIES = 5;
const DEBUG = !!process.env.DEBUG;
const DEBUG_LOG = resolve(LOGS_DIR, "worker-debug.log");

function debug(msg: string): void {
  if (!DEBUG) return;
  mkdirSync(LOGS_DIR, { recursive: true });
  appendFileSync(DEBUG_LOG, `[${new Date().toISOString()}] ${msg}\n`);
}

// --- Types ---

export interface Task {
  skill: string;
  subtasks: string[];
  timestamp: string;
  app?: string;
}

interface TasksFile {
  tasks: Task[];
}

// --- Claude invocation ---

export interface ClaudeResult {
  result: string;
  cost_usd?: number;
  duration_ms?: number;
  num_turns?: number;
  session_id?: string;
  doneSignaled: boolean;
}

export type EventCallback = (line: string) => void;

/** Reference to the currently running Claude child process, if any. */
export let currentClaudeProcess: ChildProcess | null = null;

function hasDoneSignal(source: string, text: string): boolean {
  const match = /<DONE[\s/>]/.test(text);
  debug(`hasDoneSignal(${source}): match=${match} text=${JSON.stringify(text.slice(0, 200))}`);
  return match;
}

function buildClaudeArgs(prompt: string, extraArgs: string[], resumeSessionId?: string): string[] {
  const args: string[] = [];
  if (resumeSessionId) {
    args.push("--resume", resumeSessionId, "-p", prompt);
  } else {
    args.push("-p", prompt);
  }
  args.push(...extraArgs);
  args.push("--output-format", "stream-json", "--verbose");
  return args;
}

function runClaude(
  claudeArgs: string[],
  log: Logger,
  onEvent?: EventCallback,
): Promise<ClaudeResult> {
  return new Promise((resolve, reject) => {
    const child = spawn("claude", claudeArgs, {
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    currentClaudeProcess = child;

    let resultEvent: ClaudeResult | null = null;
    let doneSignaled = false;
    let sessionId: string | undefined;
    let buffer = "";

    child.stdout!.on("data", (data: Buffer) => {
      buffer += data.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        log(line);
        onEvent?.(line);
        try {
          const event = JSON.parse(line);
          debug(`event type=${event.type} subtype=${event.subtype ?? ""}`);
          if (event.type === "system" && event.subtype === "init" && event.session_id) {
            sessionId = event.session_id;
          }
          if (event.type === "result") {
            debug(`result event: result=${JSON.stringify((event.result ?? "").slice(0, 500))}`);
            resultEvent = {
              result: event.result ?? "",
              cost_usd: event.total_cost_usd,
              duration_ms: event.duration_ms,
              num_turns: event.num_turns,
              doneSignaled: false,
            };
            if (hasDoneSignal("result", event.result ?? "")) doneSignaled = true;
          }
          if (event.type === "assistant" && event.message?.content) {
            for (const block of event.message.content) {
              if (block.type === "text") {
                if (hasDoneSignal("assistant-text", block.text ?? "")) doneSignaled = true;
              }
            }
          }
          if (event.type === "content_block_delta" && event.delta?.text) {
            if (hasDoneSignal("content-delta", event.delta.text)) doneSignaled = true;
          }
        } catch {}
      }
    });

    child.stderr!.on("data", (data: Buffer) => {
      for (const line of data.toString().split("\n")) {
        if (line.trim()) log(`[claude:err] ${line}`);
      }
    });

    child.on("error", (err) => {
      currentClaudeProcess = null;
      reject(err);
    });

    child.on("close", (code) => {
      currentClaudeProcess = null;
      debug(`claude process closed with code=${code}`);
      if (buffer.trim()) {
        debug(`final buffer: ${buffer.slice(0, 300)}`);
        log(buffer);
        onEvent?.(buffer);
        try {
          const event = JSON.parse(buffer);
          if (event.type === "result") {
            debug(`result event (final buffer): result=${JSON.stringify((event.result ?? "").slice(0, 500))}`);
            resultEvent = {
              result: event.result ?? "",
              cost_usd: event.total_cost_usd,
              duration_ms: event.duration_ms,
              num_turns: event.num_turns,
              doneSignaled: false,
            };
            if (hasDoneSignal("result-final", event.result ?? "")) doneSignaled = true;
          }
        } catch {}
      }
      debug(`runClaude finished: doneSignaled=${doneSignaled} hasResultEvent=${!!resultEvent}`);
      if (code !== 0 && !resultEvent) {
        reject(new Error(`claude exited with code ${code}`));
        return;
      }
      const result = resultEvent ?? { result: "", doneSignaled: false };
      result.doneSignaled = doneSignaled;
      if (sessionId) result.session_id = sessionId;
      resolve(result);
    });
  });
}

// --- Task system helpers ---

function readTasksFile(): TasksFile {
  if (!existsSync(TASKS_FILE)) return { tasks: [] };
  const content = readFileSync(TASKS_FILE, "utf-8").trim();
  if (!content) return { tasks: [] };
  return JSON.parse(content);
}

/**
 * Scan tasks/ for any task files not belonging to this container,
 * absorb their tasks into our own file, and delete the foreign files.
 */
export function absorbForeignTaskFiles(log: Logger): void {
  const tasksDir = dirname(TASKS_FILE);
  if (!existsSync(tasksDir)) return;

  const ownBasename = basename(TASKS_FILE);
  const files = readdirSync(tasksDir).filter(
    (f) => f.startsWith("tasks-") && f.endsWith(".json") && f !== ownBasename
  );
  if (files.length === 0) return;

  const ownData = readTasksFile();
  let absorbed = 0;

  for (const file of files) {
    const filePath = resolve(tasksDir, file);
    try {
      const content = readFileSync(filePath, "utf-8").trim();
      if (!content) {
        unlinkSync(filePath);
        continue;
      }
      const foreign: TasksFile = JSON.parse(content);
      if (foreign.tasks.length > 0) {
        ownData.tasks.push(...foreign.tasks);
        absorbed += foreign.tasks.length;
      }
      unlinkSync(filePath);
      log(`Absorbed ${foreign.tasks.length} task(s) from ${file}`);
    } catch (e: any) {
      log(`Warning: failed to absorb ${file}: ${e.message}`);
    }
  }

  if (absorbed > 0) {
    writeTasksFile(ownData);
    log(`Total: absorbed ${absorbed} task(s) from ${files.length} file(s)`);
  }
}

function writeTasksFile(data: TasksFile): void {
  mkdirSync(resolve(REPO_ROOT, "tasks"), { recursive: true });
  writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2) + "\n");
}

function tasksMatch(a: Task, b: Task): boolean {
  return (
    a.skill === b.skill &&
    a.timestamp === b.timestamp &&
    a.subtasks.length === b.subtasks.length &&
    a.subtasks.every((j, i) => j === b.subtasks[i])
  );
}

function completeTask(assignedTask: Task, log: Logger): void {
  const data = readTasksFile();
  const idx = data.tasks.findIndex((g) => tasksMatch(g, assignedTask));
  if (idx === -1) {
    debug(`completeTask: assigned task not found in task file (skill=${assignedTask.skill})`);
    log(`Warning: assigned task not found in task file, may have already been removed`);
    return;
  }
  const [completed] = data.tasks.splice(idx, 1);
  writeTasksFile(data);
  debug(`completeTask: removed task at index ${idx} (skill=${completed.skill})`);
  log(`Dequeued task: ${completed.subtasks.length} subtask(s) (skill: ${completed.skill})`);
}

function buildTaskPrompt(task: Task): string {
  const subtaskList = task.subtasks.map((j, i) => `${i + 1}. ${j}`).join("\n");
  return (
    `Read skill file: ${task.skill}\n` +
    `\n` +
    `Subtasks to complete:\n${subtaskList}\n` +
    `\n` +
    `Work through each subtask following the skill. When you have completed ALL subtasks,\n` +
    `output <DONE> to signal completion.\n` +
    `\n` +
    `When you need to add new tasks, use:\n` +
    `npx tsx /repo/scripts/add-task.ts --skill "<path>" --subtask "desc1" --subtask "desc2"`
  );
}

export function getPendingTaskCount(): number {
  return readTasksFile().tasks.length;
}


// --- Exported API ---

/**
 * Run a single prompt through Claude and return the result.
 * If resumeSessionId is provided, the prompt is sent as a follow-up
 * in the existing Claude Code session.
 */
export async function processMessage(
  prompt: string,
  extraArgs: string[],
  log: Logger,
  onEvent?: EventCallback,
  resumeSessionId?: string,
): Promise<ClaudeResult> {
  const claudeArgs = buildClaudeArgs(prompt, extraArgs, resumeSessionId);
  log(`Running Claude${resumeSessionId ? ` (resume ${resumeSessionId.slice(0, 8)}...)` : ""}...`);
  return runClaude(claudeArgs, log, onEvent);
}

export function getNextTask(): Task | null {
  const data = readTasksFile();
  return data.tasks.length > 0 ? data.tasks[0] : null;
}

export interface TaskResult {
  success: boolean;
  cost: number;
}

/**
 * Process a specific task. Retries up to MAX_TASK_RETRIES if it doesn't signal <DONE>.
 */
export async function processTask(
  task: Task,
  extraArgs: string[],
  log: Logger,
  onEvent?: EventCallback,
  shouldStop?: () => boolean,
  commitFn?: (label: string) => void,
  pushBranch?: string,
): Promise<TaskResult> {
  let retries = 0;
  let cost = 0;

  while (true) {
    if (shouldStop?.()) return { success: false, cost };

    const prompt = buildTaskPrompt(task);
    log(`Running task: ${task.subtasks.length} subtask(s) (skill: ${task.skill})`);
    for (const subtask of task.subtasks) {
      log(`  - ${subtask}`);
    }

    let response: ClaudeResult;
    try {
      response = await processMessage(prompt, extraArgs, log, onEvent);
    } catch (e: any) {
      log(`Error running claude: ${e.message}`);
      commitFn?.("Agent error recovery");
      continue;
    }

    if (pushBranch) {
      try {
        ensureBranch(pushBranch, log);
      } catch (e: any) {
        log(`Warning: failed to restore branch ${pushBranch}: ${e.message}`);
      }
    }

    if (response.cost_usd != null) {
      cost += response.cost_usd;
      log(`Cost: $${response.cost_usd.toFixed(4)}`);
    }
    if (response.num_turns != null) {
      log(`Turns: ${response.num_turns}`);
    }

    const subtaskSummary = task.subtasks[0].length > 60
      ? task.subtasks[0].slice(0, 57) + "..."
      : task.subtasks[0];
    commitFn?.(task.subtasks.length === 1
      ? subtaskSummary
      : `${subtaskSummary} (+${task.subtasks.length - 1} more)`);

    if (response.doneSignaled) {
      log(`Task signaled <DONE>. Completing task.`);
      completeTask(task, log);
      return { success: true, cost };
    }

    retries++;
    if (retries >= MAX_TASK_RETRIES) {
      log(`Task failed ${MAX_TASK_RETRIES} times. Aborting task queue.`);
      completeTask(task, log);
      return { success: false, cost };
    }
    log(`Task did NOT signal <DONE>. Retry ${retries}/${MAX_TASK_RETRIES}.`);
  }
}
