import { mkdirSync, writeFileSync, appendFileSync, existsSync, statSync, renameSync } from "fs";
import { join } from "path";

export type Logger = (message: string) => void;

/**
 * Log file lifecycle:
 *
 * 1. The current worker always writes to `worker-current.log`. This file is
 *    gitignored so it doesn't create noise in every commit.
 * 2. When a worker finishes (a Claude invocation completes), the caller must
 *    call `archiveCurrentLog()` to rename it to
 *    `worker-<containerName>-<iteration>-<timestamp>.log`.
 *    The archived file is NOT gitignored and will be included in the next
 *    `git add -A` / commit.
 * 3. On the next `createLogFile` call a fresh `worker-current.log` is created.
 *
 * This means `archiveCurrentLog` must be called before `commitAndPushTarget` for
 * the logs to appear in the commit.
 */
export function createLogFile(logsDir: string, containerName: string, iteration: number): Logger {
  mkdirSync(logsDir, { recursive: true });
  const currentLogFile = join(logsDir, "worker-current.log");

  if (existsSync(currentLogFile) && statSync(currentLogFile).size > 0) {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    renameSync(currentLogFile, join(logsDir, `worker-${containerName}-${iteration}-${ts}.log`));
  }
  writeFileSync(currentLogFile, "");

  return (message: string): void => {
    const line = `[${new Date().toISOString()}] ${message}\n`;
    appendFileSync(currentLogFile, line);
  };
}

/**
 * Create a logger that writes to both a log file and an in-memory buffer.
 * The buffer callback receives formatted log lines (with timestamps).
 */
export function createBufferedLogger(
  logsDir: string,
  containerName: string,
  iteration: number,
  onLine: (line: string) => void,
): Logger {
  const fileLogger = createLogFile(logsDir, containerName, iteration);
  return (message: string): void => {
    fileLogger(message);
    const line = `[${new Date().toISOString()}] ${message}`;
    onLine(line);
  };
}

/**
 * Rename worker-current.log to a named archive file.
 */
export function archiveCurrentLog(logsDir: string, containerName: string, iteration: number): void {
  const currentLogFile = join(logsDir, "worker-current.log");
  if (existsSync(currentLogFile)) {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    renameSync(currentLogFile, join(logsDir, `worker-${containerName}-${iteration}-${ts}.log`));
  }
}
