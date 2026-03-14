import { createServer } from "http";
import { spawn } from "child_process";

export const SECRETS_SERVER_PORT = 9119;

export type SecretsStore = Record<string, string>;

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
 * Start an HTTP server on 127.0.0.1 that handles exec-secrets requests.
 * Each request specifies secret names and a command to run.
 * The server resolves secret values from the store, spawns the command
 * with those secrets in its environment, and streams redacted output back.
 */
export function startSecretsServer(store: SecretsStore, log: (msg: string) => void): Promise<void> {
  const allValues = Object.values(store).filter((v) => v.length > 0);

  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      if (req.method === "GET" && req.url === "/list") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(Object.keys(store)));
        return;
      }

      if (req.method !== "POST" || req.url !== "/exec") {
        res.writeHead(404);
        res.end();
        return;
      }

      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(chunk as Buffer);

      let body: { secrets: string[]; cmd: string[] };
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
        const value = store[name];
        if (value) {
          env[name] = value;
        } else {
          missing.push(name);
        }
      }

      if (missing.length > 0) {
        log(`exec-secrets: unknown secrets: ${missing.join(", ")}`);
      }
      log(`exec-secrets: ${body.cmd.join(" ")} (secrets: ${(body.secrets ?? []).join(", ")})`);

      res.writeHead(200, { "Content-Type": "application/x-ndjson" });

      const child = spawn(body.cmd[0], body.cmd.slice(1), {
        env,
        stdio: ["ignore", "pipe", "pipe"],
        cwd: process.cwd(),
      });

      child.stdout!.on("data", (data: Buffer) => {
        res.write(JSON.stringify({ s: "o", d: redact(data.toString(), allValues) }) + "\n");
      });

      child.stderr!.on("data", (data: Buffer) => {
        res.write(JSON.stringify({ s: "e", d: redact(data.toString(), allValues) }) + "\n");
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
