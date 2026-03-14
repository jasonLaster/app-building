import { createServer } from "http";
import { spawn } from "child_process";
import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";
import { createBranchSecret, type InfisicalConfig } from "./package/secrets";

export const SECRETS_SERVER_PORT = 9119;

export type SecretsStore = Record<string, string>;

export interface SecretsServerOptions {
  store: SecretsStore;
  infisicalConfig: InfisicalConfig | null;
  branch: string;
  logsDir: string;
  /** Returns all buffered event lines */
  getEventLines: () => string[];
  /** Returns all buffered log lines */
  getLogLines: () => string[];
}

function redact(text: string, secretValues: string[]): string {
  let result = text;
  for (const v of secretValues) {
    if (v && result.includes(v)) {
      result = result.replaceAll(v, "[REDACTED]");
    }
  }
  return result;
}

/**
 * Check if a value appears in any logged output.
 * Returns an error message if found, null if clean.
 */
function valueAppearsInLogs(value: string, opts: SecretsServerOptions): string | null {
  // Check in-memory event buffer
  for (const line of opts.getEventLines()) {
    if (line.includes(value)) {
      return "Value found in event log — it has already been leaked. Use file-based extraction instead.";
    }
  }

  // Check in-memory log buffer
  for (const line of opts.getLogLines()) {
    if (line.includes(value)) {
      return "Value found in worker log buffer — it has already been leaked. Use file-based extraction instead.";
    }
  }

  // Check worker-current.log on disk
  const currentLog = join(opts.logsDir, "worker-current.log");
  if (existsSync(currentLog)) {
    const content = readFileSync(currentLog, "utf-8");
    if (content.includes(value)) {
      return "Value found in worker-current.log — it has already been leaked. Use file-based extraction instead.";
    }
  }

  // Check archived log files
  if (existsSync(opts.logsDir)) {
    for (const file of readdirSync(opts.logsDir)) {
      if (file.startsWith("worker-") && file.endsWith(".log") && file !== "worker-current.log") {
        const content = readFileSync(join(opts.logsDir, file), "utf-8");
        if (content.includes(value)) {
          return `Value found in ${file} — it has already been leaked. Use file-based extraction instead.`;
        }
      }
    }
  }

  return null;
}

/**
 * Start an HTTP server on 127.0.0.1 that handles secrets requests.
 *
 * Endpoints:
 *   GET  /list  — returns JSON array of secret names
 *   POST /exec  — { secrets: string[], cmd: string[] } — run command with secrets, stream NDJSON
 *   POST /set   — { name: string, value: string } — store a branch secret in Infisical
 */
export function startSecretsServer(opts: SecretsServerOptions, log: (msg: string) => void): Promise<void> {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      if (req.method === "GET" && req.url === "/list") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(Object.keys(opts.store)));
        return;
      }

      // --- POST /set ---
      if (req.method === "POST" && req.url === "/set") {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);

        let body: { name: string; value: string };
        try {
          body = JSON.parse(Buffer.concat(chunks).toString());
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "invalid JSON" }));
          return;
        }

        if (!body.name || typeof body.name !== "string" || !body.value || typeof body.value !== "string") {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "name (string) and value (string) are required" }));
          return;
        }

        // Safety check: reject if value appears in any logs.
        // Skip for non-sensitive identifiers that are safe even if logged.
        const LEAK_CHECK_SKIP = new Set(["NETLIFY_SITE_ID", "NEON_PROJECT_ID", "NETLIFY_ACCOUNT_SLUG"]);
        if (!LEAK_CHECK_SKIP.has(body.name)) {
          const leakMessage = valueAppearsInLogs(body.value, opts);
          if (leakMessage) {
            log(`set-branch-secret: REJECTED ${body.name} — value found in logs`);
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: leakMessage }));
            return;
          }
        }

        // Store in Infisical if configured
        if (opts.infisicalConfig) {
          try {
            await createBranchSecret(opts.infisicalConfig, opts.branch, body.name, body.value);
          } catch (e: any) {
            log(`set-branch-secret: Infisical error for ${body.name}: ${e.message}`);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: `Failed to store in Infisical: ${e.message}` }));
            return;
          }
        }

        // Add to local store so future /exec and /list calls include it
        opts.store[body.name] = body.value;

        log(`set-branch-secret: stored ${body.name}`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, name: body.name }));
        return;
      }

      // --- POST /exec ---
      if (req.method !== "POST" || req.url !== "/exec") {
        res.writeHead(404);
        res.end();
        return;
      }

      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(chunk as Buffer);

      let body: { secrets: string[]; cmd: string[]; cwd?: string };
      try {
        body = JSON.parse(Buffer.concat(chunks).toString());
      } catch {
        res.writeHead(400);
        res.end();
        return;
      }

      if (!Array.isArray(body.cmd) || body.cmd.length === 0) {
        res.writeHead(400);
        res.end();
        return;
      }

      // Build minimal env for the subprocess
      const env: Record<string, string> = {};
      // System essentials
      for (const key of [
        "PATH", "HOME", "USER", "SHELL", "TERM", "LANG", "LC_ALL",
        "NODE_PATH", "LD_LIBRARY_PATH", "PLAYWRIGHT_BROWSERS_PATH",
      ]) {
        if (process.env[key]) env[key] = process.env[key]!;
      }
      // Non-secret container vars
      for (const key of [
        "GIT_AUTHOR_NAME", "GIT_AUTHOR_EMAIL",
        "GIT_COMMITTER_NAME", "GIT_COMMITTER_EMAIL",
      ]) {
        if (process.env[key]) env[key] = process.env[key]!;
      }

      // Add requested secrets
      const missing: string[] = [];
      for (const name of body.secrets ?? []) {
        const value = opts.store[name];
        if (value) {
          env[name] = value;
        } else {
          missing.push(name);
        }
      }

      if (missing.length > 0) {
        log(`exec-secrets: unknown secrets: ${missing.join(", ")}`);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: `Unknown secrets: ${missing.join(", ")}. Run list-secrets to see available secrets.` }));
        return;
      }
      log(`exec-secrets: ${body.cmd.join(" ")} (secrets: ${(body.secrets ?? []).join(", ")})`);

      // Only redact values of the secrets that were requested
      const requestedValues: string[] = [];
      for (const name of body.secrets ?? []) {
        const value = opts.store[name];
        if (value) requestedValues.push(value);
      }

      res.writeHead(200, { "Content-Type": "application/x-ndjson" });

      const child = spawn(body.cmd[0], body.cmd.slice(1), {
        env,
        stdio: ["ignore", "pipe", "pipe"],
        cwd: body.cwd || process.cwd(),
      });

      child.stdout!.on("data", (data: Buffer) => {
        res.write(JSON.stringify({ s: "o", d: redact(data.toString(), requestedValues) }) + "\n");
      });

      child.stderr!.on("data", (data: Buffer) => {
        res.write(JSON.stringify({ s: "e", d: redact(data.toString(), requestedValues) }) + "\n");
      });

      child.on("close", (code) => {
        res.write(JSON.stringify({ s: "x", c: code ?? 1 }) + "\n");
        res.end();
      });

      child.on("error", (err) => {
        res.write(JSON.stringify({ s: "e", d: `exec error: ${err.message}\n` }) + "\n");
        res.write(JSON.stringify({ s: "x", c: 1 }) + "\n");
        res.end();
      });
    });

    server.listen(SECRETS_SERVER_PORT, "127.0.0.1", () => {
      log(`Secrets server listening on 127.0.0.1:${SECRETS_SERVER_PORT}`);
      resolve();
    });
  });
}
