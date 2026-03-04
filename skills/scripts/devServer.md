# devServer

## Purpose

Documents the standard procedure for starting and stopping the Netlify dev server, including
health-check polling to wait for readiness. Reduces `curl` failures caused by hitting endpoints
before the server is ready.

## Starting the Dev Server

Start the dev server in the background from the app directory:

```bash
npx netlify dev --port 8888 --functions ./netlify/functions &
```

**IMPORTANT**: Always pass `--functions ./netlify/functions` to avoid 404 errors on function
endpoints. The `base` setting in `netlify.toml` causes the functions directory to resolve
incorrectly without this flag.

## Health-Check Polling

After starting the dev server, wait for it to be ready before making requests. Use this
polling pattern with a timeout:

```bash
for i in $(seq 1 30); do curl -s http://localhost:8888 > /dev/null && break; sleep 1; done
```

This tries once per second for up to 30 seconds. If the server is not ready after 30 seconds,
investigate — check for port conflicts or startup errors in the terminal output.

For use in TypeScript scripts, poll with `fetch`:

```ts
async function waitForServer(url: string, timeoutMs = 30000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw new Error(`Server not ready after ${timeoutMs}ms`);
}
```

## Stopping the Dev Server

Always clean up dev server processes when done. Use error suppression to avoid failures when
no process is running:

```bash
pkill -f "netlify dev" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
```

The `|| true` ensures the command succeeds even if no matching process exists, avoiding
spurious failures in scripts.

## Common Issues

- **`curl` returns connection refused**: The server is not yet ready. Use the health-check
  polling pattern above instead of a single `curl`.
- **Port already in use**: A previous dev server is still running. Kill it first with the
  cleanup commands above.
- **Zombie processes**: `<defunct>` processes from previous runs are harmless and cannot be
  killed. They do not affect new server instances on different ports.

## When to Use Manual Dev Server

- **Testing**: Do NOT start the dev server manually. The test script (`npm run test`) manages
  the server automatically. See `skills/scripts/test.md`.
- **One-off curl checks**: Start manually, verify the endpoint, then stop immediately.
- **Debugging API endpoints**: Start manually to test function responses with `curl`.
