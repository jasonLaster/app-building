# @replayio/app-building

Library for managing agentic app-building containers. Start and stop containers locally (Docker) or remotely (Fly.io), communicate with the in-container HTTP server, and track container state via a local registry.

## Install

```bash
npm install @replayio/app-building
```

## Usage

```ts
import {
  loadDotEnv,
  FileContainerRegistry,
  getInfisicalConfig,
  createMachine,
  destroyMachine,
  type ContainerConfig,
  type RepoOptions,
  httpGet,
  httpPost,
  httpOptsFor,
} from "@replayio/app-building";

// Load orchestration vars from .env, then get Infisical credentials
const orchestrationVars = loadDotEnv("/path/to/project");
const infisicalConfig = await getInfisicalConfig(orchestrationVars);

const config: ContainerConfig = {
  projectRoot: "/path/to/project",  // optional — only needed for local Docker operations
  infisical: infisicalConfig,
  registry: new FileContainerRegistry("/path/to/.container-registry.jsonl"),
  flyToken: orchestrationVars.FLY_API_TOKEN,
  flyApp: orchestrationVars.FLY_APP_NAME,
};

// Create a Fly machine (automatically provisions a volume)
const { machineId, volumeId } = await createMachine(
  config.flyApp, config.flyToken, imageRef, containerEnv, machineName,
);

// Check status
const status = await httpGet(`https://${config.flyApp}.fly.dev/status`);

// Query the registry
const alive = await config.registry.findAlive();

// Clean up (destroys machine and its volume)
await destroyMachine(config.flyApp, config.flyToken, machineId, volumeId);
```

## Secrets architecture

Secrets are never passed directly to the container or agent. Instead:

1. The orchestration host passes **Infisical credentials** (token, project ID, environment) to the container.
2. At startup, the container fetches all secrets from Infisical and stores them in memory.
3. A **secrets server** (`127.0.0.1:9119`) runs inside the container, accessible only locally.
4. The agent process runs with a **restricted environment** — only `ANTHROPIC_API_KEY` (required for the Claude CLI) is present.
5. When the agent needs to run a command that requires secrets, it uses `exec-secrets`:

```bash
exec-secrets NEON_API_KEY -- curl -s -H "Authorization: Bearer $NEON_API_KEY" https://...
exec-secrets NETLIFY_AUTH_TOKEN NETLIFY_ACCOUNT_SLUG -- netlify deploy --prod
```

The secrets server spawns the command with the requested secrets in its environment and **redacts all secret values** from the output.

The agent can also run `list-secrets` to see which secrets are available, and `set-branch-secret` to store new branch-level secrets (e.g., `DATABASE_URL` created at deploy time). The server rejects values that have already appeared in logs.

## Exported API

### Domain objects

| Export | Description |
|---|---|
| `ContainerConfig` | Interface bundling all external state: `infisical` (required `InfisicalConfig`), optional `projectRoot` (only needed for local Docker operations), `registry`, optional `flyToken`/`flyApp`/`imageRef`/`webhookUrl`/`webhookSecret`/`detached`/`initialPrompt`/`localPort`/`absorbTasks`. See [Webhooks](#webhooks) and [Container lifecycle](#container-lifecycle) below. |
| `RepoOptions` | Per-invocation git settings: `repoUrl`, `cloneBranch`, `pushBranch`. |
| `ContainerRegistry` | Interface for container registry storage. Methods: `log`, `markStopped`, `clearStopped`, `getRecent`, `find`, `findAlive`. |
| `FileContainerRegistry` | Built-in file-backed implementation of `ContainerRegistry`, backed by a `.jsonl` file. |

### Container lifecycle

| Export | Description |
|---|---|
| `startContainer(config, repo)` | Build the Docker image locally and start a container with `--network host`. Returns `AgentState`. |
| `stopContainer(config, containerName)` | Stop a local Docker container by name. |
| `buildImage(config)` | Build the Docker image locally (called automatically by `startContainer`). |
| `spawnTestContainer(config)` | Start an interactive (`-it`) container with the repo mounted at `/repo`. |
| `loadDotEnv(projectRoot)` | Parse a `.env` file and return key-value pairs. |

**Types:** `AgentState`, `ContainerConfig`, `RepoOptions`

### Container registry (`ContainerRegistry` interface / `FileContainerRegistry` class)

| Method | Description |
|---|---|
| `log(state)` | Append a new entry to the registry. |
| `markStopped(name?)` | Mark a container as stopped. |
| `clearStopped(name)` | Clear the stopped flag (container came back alive). |
| `getRecent(limit?)` | Read the most recent registry entries. |
| `find(name)` | Find a specific container by name. |
| `findAlive()` | Probe recent entries and return those that are alive. Reconciles stopped flags. |

**Types:** `RegistryEntry`

### HTTP client

| Export | Description |
|---|---|
| `httpGet(url, opts?)` | GET with retries and timeout. Returns parsed JSON. |
| `httpPost(url, body?, opts?)` | POST with retries and timeout. Returns parsed JSON. |

**Types:** `HttpOptions`

### Container utilities

| Export | Description |
|---|---|
| `httpOptsFor(state)` | Return `HttpOptions` for a container (adds `fly-force-instance-id` header for remote containers). |
| `probeAlive(entry)` | Check if a container is responding to `/status`. |

### Fly.io utilities

| Export | Description |
|---|---|
| `createApp(token, name, org?)` | Create a Fly app and allocate IPs. |
| `createMachine(app, token, image, env, name)` | Create a Fly machine with a 50GB volume mounted at `/repo`. Returns `{ machineId, volumeId }`. |
| `waitForMachine(app, token, machineId)` | Poll until a machine reaches `started` state. |
| `listMachines(app, token)` | List all machines for an app. |
| `destroyMachine(app, token, machineId, volumeId?)` | Force-destroy a machine and optionally its volume. |
| `listVolumes(app, token)` | List all volumes for an app. |
| `deleteVolume(app, token, volumeId)` | Delete a Fly volume. |

**Types:** `FlyMachineInfo`, `FlyVolumeInfo`, `CreateMachineResult`

### Secrets (Infisical)

| Export | Description |
|---|---|
| `infisicalLogin(clientId, clientSecret)` | Log in via Universal Auth, returns a short-lived access token. |
| `getInfisicalConfig(envVars)` | Extract `InfisicalConfig` from env vars and log in. Requires `INFISICAL_CLIENT_ID`, `INFISICAL_CLIENT_SECRET`, `INFISICAL_PROJECT_ID`, `INFISICAL_ENVIRONMENT`. |
| `fetchGlobalSecrets(config)` | Fetch secrets from the `/global/` path. |
| `fetchBranchSecrets(config, branch)` | Fetch secrets from `/branches/<branch>/`. |
| `createBranchSecret(config, branch, name, value)` | Create or update a secret in `/branches/<branch>/`. |
| `fetchInfisicalSecrets(config, path)` | Raw fetch from any Infisical folder path. |

**Types:** `InfisicalConfig`

**Usage pattern** (orchestration scripts):

```ts
const orchestrationVars = loadDotEnv(projectRoot);
const infisicalConfig = await getInfisicalConfig(orchestrationVars);

const config: ContainerConfig = {
  infisical: infisicalConfig,
  flyToken: orchestrationVars.FLY_API_TOKEN,
  flyApp: orchestrationVars.FLY_APP_NAME,
  ...
};
```

### Image ref

| Export | Description |
|---|---|
| `getImageRef()` | Returns `CONTAINER_IMAGE_REF` env var, or `ghcr.io/replayio/app-building:latest` by default. |

## Container HTTP API

Each container runs an HTTP server that accepts the following requests:

| Method | Path | Description |
|---|---|---|
| `POST /message` | `{ prompt: string }` | Add a prompt as a task in the persistent task queue. Returns `{ ok: true }`. |
| `POST /detach` | | Signal the container to exit once all tasks are done. |
| `POST /stop` | | Force-stop the container immediately. Interrupts any running work, commits remaining changes, then exits. |
| `POST /interrupt` | | Kill the currently running Claude process without stopping the container. |
| `GET /status` | | Container state, queue depth, iteration count, cost, revision, etc. |
| `GET /events?offset=N` | | Stream of Claude events (JSON lines) since offset. |
| `GET /logs?offset=N` | | Stream of log lines since offset. |

### Container lifecycle

A container stays running and accepts messages until it receives a **detach** or **stop** signal:

- **Detached at startup** (`config.detached = true`): Set `detached` on `ContainerConfig` to start
  the container in detached mode. Use `config.initialPrompt` to provide a prompt that is queued
  before the HTTP server starts accepting requests. The container processes the initial prompt
  and any queued tasks, then exits cleanly. This is the preferred way to run fire-and-forget
  jobs — no race between container startup and a subsequent `POST /message` or `POST /detach`.
- **Detach** (`POST /detach`): Signal a running container to exit once all in-flight and queued
  work is done. In the CLI, interactive mode (`npm run agent -- -i`) sends `/detach` automatically
  when the user disconnects (Ctrl+C/D).
- **Stop** (`POST /stop`): The container exits immediately, interrupting any running Claude
  process. It commits any remaining work before shutting down. This is the forced shutdown path.

Without either signal, the container waits indefinitely for new messages — this is intentional
so that interactive users can send follow-up messages at any time.

### Task absorption

Set `config.absorbTasks = true` to have the container absorb task files from other containers
at startup. This is off by default. When enabled, the container scans `tasks/` for task files
belonging to other containers, merges their tasks into its own queue, and deletes the foreign files.

## Webhooks

Set `webhookUrl` on `ContainerConfig` to receive real-time notifications of container activity. The container POSTs JSON to that URL on key events (no retries; failures are logged to stderr). Set `webhookSecret` to include a `Bearer` token in the `Authorization` header for authenticating webhook requests.

### Payload format

Every POST body has this shape:

```json
{
  "type": "container.started",
  "containerName": "app-building-abc123",
  "timestamp": "2026-02-28T12:00:00.000Z",
  "data": { ... }
}
```

| Field | Type | Description |
|---|---|---|
| `type` | `string` | Event type (see table below). |
| `containerName` | `string` | Name of the container that emitted the event. |
| `timestamp` | `string` | ISO-8601 timestamp. |
| `data` | `object` | Event-specific payload. Present on all events; contents vary by type. |

### Events

| Type | When | `data` fields |
|---|---|---|
| `container.started` | HTTP server is listening | `pushBranch`, `revision` |
| `container.idle` | Container is waiting for work | `pendingTasks`, `queueLength` |
| `container.stopping` | Container is shutting down | _(empty)_ |
| `container.stopped` | Container has stopped | _(empty)_ |
| `message.queued` | `POST /message` received | `messageId`, `prompt` |
| `message.started` | Message processing begins | `iteration`, `prompt` |
| `message.done` | Message processing complete | `messageId`, `cost_usd`, `duration_ms`, `num_turns` |
| `message.error` | Message processing failed | `messageId`, `error` |
| `task.started` | Task processing begins | `iteration`, `skill`, `subtasks`, `prompt` |
| `task.done` | Task processing complete | `skill`, `subtasks`, `prompt`, `cost`, `totalCost`, `failed`, `pendingTasks`, `duration_ms` |
| `log` | Each log line | `line` |

### Example

```ts
const orchestrationVars = loadDotEnv("/path/to/project");
const infisicalConfig = await getInfisicalConfig(orchestrationVars);

const config: ContainerConfig = {
  projectRoot: "/path/to/project",
  infisical: infisicalConfig,
  registry: new FileContainerRegistry("/path/to/.container-registry.jsonl"),
  webhookUrl: "https://example.com/hooks/container-events",
  webhookSecret: "your-webhook-secret",
};
```
