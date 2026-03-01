# Skill

During this stage you will deploy the app to production and test it to make sure it works.

## Unpack Subtasks

Unpack the initial deployment task into a single task:

```
npx tsx /repo/scripts/add-task.ts --skill "skills/tasks/deployment.md" --app "<AppName>" \
  --subtask "DoDeploy: Deploy the app to production" \
  --subtask "TestDeploy: Test the deployed app"
```

## Deployment

Before running the deploy script, check whether the app has been deployed before by reading
`deployment.txt`. If it exists, you MUST populate `.env` with the existing resource IDs so
the script reuses them. See `skills/scripts/deploy.md` § "Populating `.env` for
Redeployments" for the exact steps.

Ensure the locale workaround is in place — the deploy script must prefix Netlify CLI commands
with `LC_ALL=C` to avoid locale errors in the container. See `skills/scripts/deploy.md` §
"Locale Workaround". Also verify dependencies are installed: `ls node_modules/@neondatabase/serverless 2>/dev/null || npm install`.

Then run `npm run deploy` from the app directory. See `skills/scripts/deploy.md` for the
full script specification. The script handles database creation/sync, Netlify site
creation/update, and writes the deployed URL to `deployment.txt`.

After a successful deployment, you MUST append a deployment history entry to the end of
`deployment.txt`. The entry must include the date and a summary of what changed:

```
--- Deployment 2026-02-26 ---
Changes:
- Added user authentication flow
- Fixed pagination bug on accounts page
- Updated dashboard layout to match mockup
```

Use `git log` to determine what changed since the last deployment. If `deployment.txt`
already has history entries, compare against the most recent one. If this is the first
deployment, summarize the initial feature set.

## Testing

After deploying, you MUST perform a functional test to verify the app actually works in production.
A deployment that serves HTTP 200 is not sufficient — the app must display real data and support updates.
The deployment test lives at `tests/deployment.spec.ts`, separate from the integration tests.
It must be excluded from regular `npm run test` runs by adding it to `testIgnore` in
`playwright.config.ts`:

```ts
testIgnore: ['**/deployment.spec.ts'],
```

The deployment test has its own config at `playwright.deployment.config.ts` which uses
`@replayio/playwright` to launch the Replay browser and auto-upload recordings.
All browsers must run headless — never use Xvfb or set `DISPLAY`.

```
npx playwright test --config playwright.deployment.config.ts
```

### Functional Test Requirements

The functional test must verify:
1. **Data displays**: Navigate to the main page and confirm that real data (e.g. client records) loads and renders visibly.
2. **Data can be updated**: Perform a write operation (e.g. add or edit a record) and confirm the change persists.

If either check fails, the deployment is broken and must be investigated and fixed before marking the task complete.

### Recording with Replay

All functional tests MUST be recorded using the Replay Playwright integration so that
the Replay browser is used to launch and interact with the deployed page, and failures
can be debugged from the recording.

The deployment test is a SINGLE Playwright test at `tests/deployment.spec.ts` that
runs against the deployed production URL (read from `deployment.txt`). It uses a
separate config (`playwright.deployment.config.ts`) that launches the Replay browser
via `@replayio/playwright` and auto-uploads recordings. It does not start a dev server
or reuse the integration test config.

#### Analyzing the Recording

After the test runs and the recording is uploaded, use Replay MCP tools to analyze
the recording and verify the app works correctly. If the test fails, use the recording
to diagnose the root cause before attempting a fix.

A deployment is only complete when the Replay recording confirms that the app displays data and
supports updates. Record the Replay recording ID in the deployment notes.

Read these skills to learn how to use these:

https://raw.githubusercontent.com/replayio/skills/refs/heads/main/skills/replay-playwright/SKILL.md
https://raw.githubusercontent.com/replayio/skills/refs/heads/main/skills/replay-mcp/SKILL.md

## Tips

- Do NOT use the `replayio record <url>` CLI to create recordings. It launches a headed browser
  which will crash in this headless container (`Missing X server or $DISPLAY`). Always use the
  Playwright deployment test config (`playwright.deployment.config.ts`) which runs headless with
  `@replayio/playwright` and handles browser setup correctly.
- Do NOT install or start Xvfb. All browsers must run headless. If a browser complains about
  a missing display, the fix is to ensure it runs headless, not to add a virtual display.
- NEVER stop, cancel, or skip a Replay recording upload that is in progress. The upload is a
  prerequisite for Replay MCP analysis, which is mandatory for verifying the deployment. If the
  upload is taking a long time, WAIT for it to finish. Do NOT decide you have "enough information"
  and proceed without the recording — you must complete the full upload → MCP analysis cycle.
