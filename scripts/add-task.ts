/**
 * add-task: Adds a task to the front of the queue (next to be processed).
 *
 * Usage: npx tsx /repo/scripts/add-task.ts --skill <path> --subtask "desc1" --subtask "desc2" [--app "<name>"]
 *
 * All --subtask values become the subtasks array within the task. Subtasks execute in the
 * order listed.
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
}

interface TasksFile {
  tasks: Task[];
}

function parseArgs(): { skill: string; subtasks: string[]; app?: string } {
  const args = process.argv.slice(2);
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
  if (!skill || subtasks.length === 0) {
    console.error('Usage: add-task --skill "<path>" --subtask "desc1" [--subtask "desc2" ...] [--app "<name>"]');
    process.exit(1);
  }
  return { skill, subtasks, app };
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

function main() {
  const { skill, subtasks, app } = parseArgs();
  const data = readTasksFile();
  const newTask: Task = { skill, subtasks, timestamp: new Date().toISOString(), ...(app && { app }) };

  data.tasks.unshift(newTask);

  writeTasksFile(data);
  console.log(`Added task at front: ${subtasks.length} subtask(s) (skill: ${skill})`);
  for (const subtask of subtasks) {
    console.log(`  - ${subtask}`);
  }
  console.log(`Queue now has ${data.tasks.length} task(s).`);
}

main();
