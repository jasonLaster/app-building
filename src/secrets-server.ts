/**
 * Internal HTTP server on 127.0.0.1:9119 for secret management.
 *
 * Secrets are fetched from Infisical on every request — no caching.
 *
 * Endpoints:
 *   GET  /list  — returns JSON array of secret names (fetched live)
 *   POST /exec  — { secrets, cmd, cwd } — run command with secrets in env
 *   POST /set   — { name, value } — store a branch secret in Infisical
 */

import { createServer } from "http";
import { spawn } from "child_process";
import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";
import {
  createBranchSecret,
  fetchGlobalSecrets,
  fetchBranchSecrets,
  type InfisicalConfig,
} from "./package/secrets";

export const SECRETS_SERVER_PORT = 9119;

export interface SecretsServerOptions {
  infisicalConfig: InfisicalConfig;
  branch: string;
  logsDir: string;
  getEventLines: () => string[];
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
 * Fetch all secrets (global + branch) from Infisical. Called on every request.
 */
async function fetchAllSecrets(opts: SecretsServerOptions): Promise<Record<string, string>> {
  const [global, branch] = await Promise.all([
    fetchGlobalSecrets(opts.infisicalConfig),
    fetchBranchSecrets(opts.infisicalConfig, opts.branch).catch(() => ({})),
  ]);
  return { ...global, ...branch };
}

/**
 * Check if a value appears in any logged output.
 */
function valueAppearsInLogs(value: string, opts: SecretsServerOptions): string | null {
  for (const line of opts.getEventLines()) {
    if (line.includes(value)) {
      return "Value found in event log — it has already been leaked. Use file-based extraction instead.";
    }
  }

  for (const line of opts.getLogLines()) {
    if (line.includes(value)) {
      return "Value found in worker log buffer — it has already been leaked. Use file-based extraction instead.";
    }
  }

  const currentLog = join(opts.logsDir, "worker-current.log");
  if (existsSync(currentLog)) {
    const content = readFileSync(currentLog, "utf-8");
    if (content.includes(value)) {
      return "Value found in worker-current.log — it has already been leaked. Use file-based extraction instead.";
    }
  }

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

function jsonResponse(res: import("http").ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

export function startSecretsServer(opts: SecretsServerOptions, log: (msg: string) => void): Promise<void> {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        // --- GET /list ---
        if (req.method === "GET" && req.url === "/list") {
          const secrets = await fetchAllSecrets(opts);
          jsonResponse(res, 200, Object.keys(secrets));
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
            jsonResponse(res, 400, { error: "invalid JSON" });
            return;
          }

          if (!body.name || typeof body.name !== "string" || !body.value || typeof body.value !== "string") {
            jsonResponse(res, 400, { error: "name (string) and value (string) are required" });
            return;
          }

          // Leak check — skip for non-sensitive identifiers
          const LEAK_CHECK_SKIP = new Set(["NETLIFY_SITE_ID", "NEON_PROJECT_ID", "NETLIFY_ACCOUNT_SLUG"]);
          if (!LEAK_CHECK_SKIP.has(body.name)) {
            const leakMessage = valueAppearsInLogs(body.value, opts);
            if (leakMessage) {
              log(`set-branch-secret: REJECTED ${body.name} — value found in logs`);
              jsonResponse(res, 400, { error: leakMessage });
              return;
            }
          }

          try {
            await createBranchSecret(opts.infisicalConfig, opts.branch, body.name, body.value);
          } catch (e: any) {
            log(`set-branch-secret: Infisical error for ${body.name}: ${e.message}`);
            jsonResponse(res, 500, { error: `Failed to store in Infisical: ${e.message}` });
            return;
          }

          log(`set-branch-secret: stored ${body.name}`);
          jsonResponse(res, 200, { ok: true, name: body.name });
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

        // Fetch secrets fresh from Infisical
        const allSecrets = await fetchAllSecrets(opts);

        // Build minimal env for the subprocess
        const env: Record<string, string> = {};
        for (const key of [
          "PATH", "HOME", "USER", "SHELL", "TERM", "LANG", "LC_ALL",
          "NODE_PATH", "LD_LIBRARY_PATH", "PLAYWRIGHT_BROWSERS_PATH",
        ]) {
          if (process.env[key]) env[key] = process.env[key]!;
        }
        for (const key of [
          "GIT_AUTHOR_NAME", "GIT_AUTHOR_EMAIL",
          "GIT_COMMITTER_NAME", "GIT_COMMITTER_EMAIL",
        ]) {
          if (process.env[key]) env[key] = process.env[key]!;
        }

        // Resolve requested secrets
        const missing: string[] = [];
        const requestedValues: string[] = [];
        for (const name of body.secrets ?? []) {
          const value = allSecrets[name];
          if (value) {
            env[name] = value;
            requestedValues.push(value);
          } else {
            missing.push(name);
          }
        }

        if (missing.length > 0) {
          log(`exec-secrets: unknown secrets: ${missing.join(", ")}`);
          jsonResponse(res, 400, { error: `Unknown secrets: ${missing.join(", ")}. Run list-secrets to see available secrets.` });
          return;
        }
        log(`exec-secrets: ${body.cmd.join(" ")} (secrets: ${(body.secrets ?? []).join(", ")})`);

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
      } catch (e: any) {
        log(`secrets-server error: ${e.message}`);
        if (!res.headersSent) {
          jsonResponse(res, 500, { error: e.message });
        }
      }
    });

    server.listen(SECRETS_SERVER_PORT, "127.0.0.1", () => {
      log(`Secrets server listening on 127.0.0.1:${SECRETS_SERVER_PORT}`);
      resolve();
    });
  });
}
