import { mkdirSync, writeFileSync, appendFileSync, existsSync, statSync, renameSync, readFileSync } from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export type Logger = (message: string) => void;

// --- Env vars whose values are safe to show in logs (not secrets) ---
const SAFE_ENV_VARS = new Set([
  "NETLIFY_ACCOUNT_SLUG",
  "FLY_APP_NAME",
  "CLONE_BRANCH",
  "PORT",
  "REPO_URL",
]);

/** Load secret values from .env file */
function loadSecretsFromFile(): string[] {
  const envPath = resolve(__dirname, "..", ".env");
  if (!existsSync(envPath)) return [];
  const secrets: string[] = [];
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (value && !SAFE_ENV_VARS.has(key)) {
      secrets.push(value);
    }
  }
  return secrets;
}

/** Load secret values from environment variables (container mode).
 *  Reads .env.example to know which keys came from .env, then checks
 *  process.env for their values. */
function loadSecretsFromEnv(): string[] {
  const examplePath = resolve(__dirname, "..", ".env.example");
  let envKeys: string[] = [];
  if (existsSync(examplePath)) {
    envKeys = readFileSync(examplePath, "utf-8")
      .split("\n")
      .map((l) => l.split("#")[0].trim())
      .filter((l) => l && l.includes("="))
      .map((l) => l.split("=")[0].trim());
  }
  const secrets: string[] = [];
  for (const key of envKeys) {
    if (SAFE_ENV_VARS.has(key)) continue;
    const value = process.env[key];
    if (value) secrets.push(value);
  }
  return secrets;
}

let _secrets: string[] | null = null;

/** Replace .env secret values with [REDACTED] */
export function redactSecrets(text: string): string {
  if (!_secrets) {
    _secrets = process.env.CONTAINER_MODE ? loadSecretsFromEnv() : loadSecretsFromFile();
  }
  let result = text;
  for (const secret of _secrets) {
    if (result.includes(secret)) {
      result = result.replaceAll(secret, "[REDACTED]");
    }
  }
  return result;
}

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
    const line = `[${new Date().toISOString()}] ${redactSecrets(message)}\n`;
    appendFileSync(currentLogFile, line);
  };
}

/**
 * Create a logger that writes to both a log file and an in-memory buffer.
 * The buffer callback receives formatted log lines (with timestamps, redacted).
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
    const line = `[${new Date().toISOString()}] ${redactSecrets(message)}`;
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
