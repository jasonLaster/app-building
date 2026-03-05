# app-building

Simple and extensible platform for dark factory agentic app building: creating apps
according to a spec without human involvement along the way. Example use cases:

* `npm run agent -- --branch feature/my-app -p "Build me an app XYZ based on this spec: ..."`
* `npm run agent -- --branch feature/my-app -p "Continue maintaining app XYZ and fix these bugs: ..."`
* `npm run agent -- --branch feature/my-app -i` for interactive access to the agent.

### Tech stack

Every app the agent builds uses the same stack:

* **React** — frontend UI
* **Netlify** — hosting and serverless functions (backend API)
* **Neon** — serverless Postgres database
* **Playwright** — integration tests

If you need a different stack, this platform isn't the right fit yet.

Core ideas:

* The agent runs within a docker container that clones a repo and exposes an HTTP server for control.
* The agent builds by following a set of skill documents with guides
  for breaking its work down into tasks and directives for performing those tasks.
* The agent commits logs for it to review later and improve its skills.
* All code changes are committed and pushed back to the remote from inside the container.

Containers can run locally or remotely.

## Prerequisites

- **Docker Desktop** — must be installed and running before starting the agent. Download at docker.com/products/docker-desktop.
- **Node.js 18+**

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

## Replay Integration

[Replay](https://replay.io) is a time-travel debugging tool. When integrated, the agent uses
Replay's Playwright browser to record test runs, then queries those recordings to understand
exactly what happened when a test failed — inspecting network requests, component state,
console errors, and step-by-step UI interactions without re-running the test.

Without Replay, the agent only has Playwright's error output to work from, which is often
not enough to diagnose subtle failures. With Replay, it can pinpoint the root cause directly
and fix it in fewer iterations.

### Setup

1. Create an account at [app.replay.io](https://app.replay.io)
2. Go to your team settings and generate an API key
3. Add it to `.env`:
   ```
   RECORD_REPLAY_API_KEY=<your-key>
   ```

The Replay browser is already installed in the Docker image — no additional setup needed.
Once the key is present, the agent automatically gains access to these debugging tools
during test runs:

| Tool | What it shows |
|---|---|
| `PlaywrightSteps` | Step-by-step test actions with timing — first stop for any failure |
| `NetworkRequest` | Request payloads and response bodies for API calls |
| `Screenshot` | Visual snapshot at any point in the recording |
| `Logpoint` | Whether a specific function or event handler was called |
| `ConsoleMessages` | Browser console output at any point |
| `ReactRenders` | React component render history and props |

## Finding Your App

Once the agent has finished, check out the branch it pushed to. The built app lives at:

```
apps/<AppName>/
```

Key files:
- `apps/<AppName>/src/` — React frontend source code
- `apps/<AppName>/netlify/functions/` — serverless backend functions
- `apps/<AppName>/tests/` — Playwright integration tests
- `apps/<AppName>/AppSpec.md` — the spec the app was built from
- `apps/<AppName>/docs/tests.md` — the full test specification

### Checking the deployment

After a successful deploy, the app URL and resource IDs are saved to:

```
apps/<AppName>/deployment.txt
```

Example contents:
```
url=https://your-app-abc123.netlify.app
site_id=<netlify-site-id>
neon_project_id=<neon-project-id>
database_url=postgresql://...
deployed_at=2026-01-01T00:00:00Z
```

Open the `url` value in a browser to see the live app. Each subsequent deploy appends a history entry to this file describing what changed.

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

### Writing a good prompt

The quality of the initial prompt directly affects the quality of the app. A good prompt includes:

* **What the app does** — describe the core purpose in a sentence or two
* **Key features** — list the main things users can do (e.g. create, edit, delete, filter, sort)
* **Data the app stores** — what entities exist and how they relate (e.g. users have many tasks, tasks have a status)
* **User roles** — if different users have different access levels, say so
* **Any specific UI or UX requirements** — e.g. a dashboard layout, a modal for editing, etc.

Example of a detailed prompt:
```
Build a project management app where users can create projects and add tasks to them.
Each task has a title, description, status (todo/in-progress/done), priority (low/medium/high),
and due date. Users can filter tasks by status and priority, and sort by due date or priority.
Include a dashboard showing task counts by status across all projects.
```

The more specific you are, the closer the first build will be to what you want.

### Iterating on a built app

Once the agent finishes the initial build, you can ask it to make changes by running it
again on the same branch with a new prompt describing what to fix or add:

```bash
npm run agent -- --branch feature/my-app -p "The task filter isn't working correctly — selecting 'done' still shows in-progress tasks. Also add the ability to assign tasks to team members."
```

The agent will clone the branch, read the existing code and spec, make the requested changes,
run the tests, and push back. Each run is independent — you can queue as many follow-up
prompts as needed.

Key things to watch out for:

* Best suited for CRUD and API-calling apps up to a medium level of complexity.
  Overly complicated or specialized apps will not work as well yet.
* A full initial build typically costs $2–10 in Anthropic API usage depending on app complexity.
  Monitor spend with `npm run status` which shows running cost, and set API spend limits in your
  Anthropic console as a safeguard.
* Replay integration is optional but significantly improves the agent's ability to fix test
  failures. See below for details.
