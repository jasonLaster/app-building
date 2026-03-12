/**
 * add-task: Adds one or more tasks to the front of the queue (next to be processed).
 *
 * Preferred usage: Pass a JSON array of tasks via stdin (heredoc recommended):
 *
 *   npx tsx /repo/scripts/add-task.ts <<'EOF'
 *   [
 *     { "skill": "skills/tasks/build/writeApp.md", "app": "SalesCRM", "subtasks": ["SetupApp: Setup the app", "DesignDatabase: Design the database"] },
 *     { "skill": "skills/tasks/build/writeTests.md", "app": "SalesCRM", "subtasks": ["WriteTestAuth: Write test for Auth"] }
 *   ]
 *   EOF
 *
 * Legacy usage (backwards compatible):
 *
 *   npx tsx /repo/scripts/add-task.ts --skill "<path>" --subtask "desc1" --subtask "desc2" [--app "<name>"]
 *
 * Tasks are inserted at the front of the queue in the order listed (first element = first to run).
 * Each task object must have "skill" and "subtasks". "app" is optional.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";

const CONTAINER_NAME = process.env.CONTAINER_NAME ?? "agent";
const TASKS_FILE = resolve(`/repo/tasks/tasks-${CONTAINER_NAME}.json`);

interface Task {
  skill: string;
  subtasks: string[];
  timestamp: string;
  app?: string;
  command?: string;
}

interface TaskInput {
  skill: string;
  subtasks: string[];
  app?: string;
  command?: string;
}

interface TasksFile {
  tasks: Task[];
  current?: Task;
}

function readTasksFile(): TasksFile {
  if (!existsSync(TASKS_FILE)) return { tasks: [] };
  const content = readFileSync(TASKS_FILE, "utf-8").trim();
  if (!content) return { tasks: [] };
  return JSON.parse(content);
}

function writeTasksFile(data: TasksFile): void {
  mkdirSync(resolve("/repo/tasks"), { recursive: true });
  writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2) + "\n");
}

function parseArgs(): TaskInput | null {
  const args = process.argv.slice(2);
  if (args.length === 0) return null;
  let skill = "";
  let app: string | undefined;
  const subtasks: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--skill" && i + 1 < args.length) {
      skill = args[i + 1];
      i++;
    } else if (args[i] === "--subtask" && i + 1 < args.length) {
      subtasks.push(args[i + 1]);
      i++;
    } else if (args[i] === "--app" && i + 1 < args.length) {
      app = args[i + 1];
      i++;
    }
  }
  if (!skill || subtasks.length === 0) return null;
  return { skill, subtasks, app };
}

function readStdin(): string {
  try {
    return readFileSync(0, "utf-8").trim();
  } catch {
    return "";
  }
}

function main() {
  // Try legacy CLI args first
  const legacyInput = parseArgs();
  let inputs: TaskInput[];

  if (legacyInput) {
    inputs = [legacyInput];
  } else {
    // Try stdin JSON
    const stdin = readStdin();
    if (!stdin) {
      console.error(`add-task: Adds one or more tasks to the front of the queue.

USAGE (preferred — stdin JSON):

  npx tsx /repo/scripts/add-task.ts <<'EOF'
  [
    {
      "skill": "skills/tasks/build/writeApp.md",
      "app": "SalesCRM",
      "subtasks": [
        "SetupApp: Setup the app",
        "DesignDatabase: Design the database"
      ]
    },
    {
      "skill": "skills/tasks/build/writeTests.md",
      "app": "SalesCRM",
      "subtasks": [
        "WriteTestAuth: Write test for Auth"
      ]
    }
  ]
  EOF

  Input: A JSON array of task objects via stdin.
  Each task object has:
    - "skill"    (string, required): Path to the skill file.
    - "subtasks" (string[], required): List of subtask descriptions.
    - "app"      (string, optional): App name (directory under apps/).

  Tasks are inserted at the front of the queue in the order listed
  (first element = first to run).

USAGE (legacy — CLI flags):

  npx tsx /repo/scripts/add-task.ts --skill "skills/..." --subtask "desc1" --subtask "desc2" [--app "AppName"]

  Adds a single task. Each --subtask flag adds one subtask.

ERROR: No input provided. Pass a JSON array via stdin or use --skill/--subtask flags.`);
      process.exit(1);
    }

    try {
      inputs = JSON.parse(stdin);
    } catch (e: any) {
      console.error(`Error: invalid JSON: ${e.message}`);
      process.exit(1);
    }

    if (!Array.isArray(inputs) || inputs.length === 0) {
      console.error("Error: input must be a non-empty JSON array of tasks.");
      process.exit(1);
    }
  }

  const timestamp = new Date().toISOString();
  const newTasks: Task[] = [];

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    if (!input.skill || !Array.isArray(input.subtasks) || input.subtasks.length === 0) {
      console.error(`Error: task[${i}] must have "skill" (string) and "subtasks" (non-empty array).`);
      process.exit(1);
    }
    newTasks.push({
      skill: input.skill,
      subtasks: input.subtasks,
      timestamp,
      ...(input.app && { app: input.app }),
      ...(input.command && { command: input.command }),
    });
  }

  const data = readTasksFile();
  // Insert at front, preserving order (first input task = first to run)
  data.tasks.unshift(...newTasks);
  writeTasksFile(data);

  console.log(`Added ${newTasks.length} task(s) at front of queue.`);
  for (const task of newTasks) {
    console.log(`  ${task.skill} (${task.subtasks.length} subtask(s)${task.app ? `, app: ${task.app}` : ""})`);
    for (const subtask of task.subtasks) {
      console.log(`    - ${subtask}`);
    }
  }
  console.log(`Queue now has ${data.tasks.length} task(s).`);
}

main();
