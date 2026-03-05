# app-building

Simple and extensible platform for dark factory agentic app building: creating apps
according to a spec without human involvement along the way. Example use cases:

* `npm run agent -- -p "Build me an app XYZ based on this spec: ..."`
* `npm run agent -- -p "Continue maintaining app XYZ and fix these bugs: ..."`
* `npm run agent -- -i` for interactive access to the agent.

Core ideas:

* The agent runs within a docker container that clones a repo and exposes an HTTP server for control.
* The agent builds by following a set of skill documents with guides
  for breaking its work down into tasks and directives for performing those tasks.
* The agent commits logs for it to review later and improve its skills.
* All code changes are committed and pushed back to the remote from inside the container.

Containers can run locally or remotely.

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and fill in the required values:

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude |
| `GITHUB_TOKEN` | Yes | GitHub personal access token with **`repo`** scope |
| `REPO_URL` | Yes | HTTPS URL of the target repo, e.g. `https://github.com/your-org/your-repo` — must be HTTPS, not SSH |
| `NETLIFY_AUTH_TOKEN` | Yes | Netlify auth token for deploying apps |
| `NETLIFY_ACCOUNT_SLUG` | Yes | Your Netlify account slug |
| `NEON_API_KEY` | Yes | Neon API key for database provisioning |
| `FLY_API_TOKEN` | No | Only needed when using `--remote` to run containers on Fly.io |
| `UPLOADTHING_TOKEN` | No | For apps that need file uploads |
| `RESEND_API_KEY` | No | For apps that send email |

### GitHub token

Create a token at github.com/settings/tokens and enable the **`repo`** scope (the top-level checkbox). This gives the agent the read/write access it needs to clone your repo and push commits back.

### Branch setup

The agent will not run when checked out on `main` — this is intentional to prevent accidental pushes to the main branch. Before running the agent, make sure you're on a feature branch:

```bash
git checkout -b feature/my-app
git push -u origin feature/my-app
```

The agent uses your current branch by default. Use `--branch` to override and target a different branch than the one you have checked out locally.

## Running the Agent

`npm run agent` starts a new container with the running agent. By default the container is local, add `--remote` to spawn the container remotely. This requires `FLY_API_TOKEN` in `.env`.

### Detached mode

```bash
npm run agent -- -p "<prompt>"
npm run agent -- --branch feature/my-app -p "<prompt>"
npm run agent -- --branch feature/my-app --push-branch feature/xyz -p "<prompt>"
```

Starts a container, optionally queues a prompt, then detaches. The container processes the prompt followed by any pending tasks, commits and pushes results, then exits.

Use `--push-branch` if you want to clone from one branch but push results to a different one.

### Interactive mode

```bash
npm run agent -- -i
```

Chat with the agent inside a container. Output is streamed via event polling. Press ESC to interrupt the current message. On exit, the container is detached and finishes any remaining work.

### Checking status

```bash
npm run status
```

Connects to the running container's HTTP API and shows state, revision, queue depth, cost, and recent log output. Tails logs in real-time (Ctrl+C to stop). Errors if no agent is running.

### Stopping the agent

```bash
npm run stop
npm run stop -- <containerName>
```

Sends an HTTP stop signal. Without arguments, finds and stops all running containers. Pass a container name to stop a specific one.

## Skills

The provided skill documents emphasize a structured approach for autonomously building
high quality, well tested apps from the initial spec. During the initial app build
it does the following:

1. Designs a comprehensive test specification based on the initial spec.
2. Builds the app and writes tests to match the spec.
3. Gets all the tests to pass, deploys to production, and does further testing.

The initial build will not come out perfect. The agent can followup with maintenance passes
where it checks to make sure it closely followed the spec and skill directives and fixes
any issues it finds. It will also fix reported bugs and update the skills to avoid
similar problems in the future.

As long as each individual step the agent takes is within its capabilities (it can usually
do it but not always) the agent will converge on an app that follows the initial spec
and skill directives.

Key things to watch out for:

* Best suited for CRUD and API-calling apps up to a medium level of complexity.
  Overly complicated or specialized apps will not work as well yet.
* Make sure to get a Replay API key and configure it. The agent will use Replay to identify
  and debug problems it encounters in tests or the deployed app.
