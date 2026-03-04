# Skill

QA a user journey on the live deployed app using Playwright MCP browser tools. Each subtask
specifies a journey to exercise. You will browse the app as a real user, record a video of the
session, upload it, and report any problems found.

## Subtask Format

```
JourneyQA: <Journey Title>
```

The journey title matches an entry in the app's `docs/userJourneys.md`. Read that file to
understand the persona, goals, and step-by-step actions for the journey.

## Prerequisites

- The app must be deployed. Read `deployment.txt` to get the deployed URL.
- `UPLOADTHING_TOKEN` must be set in the environment (it is provided in the container).
- `RECORD_REPLAY_API_KEY` must be set in the environment.
- Playwright MCP browser tools must be available (`browser_navigate`, `browser_click`, etc.).

## Procedure

### 1. Prepare

Read `docs/userJourneys.md` and find the journey matching the subtask title. Note the persona,
the expected actions, and what success looks like.

Read `deployment.txt` to get the deployed app URL.

### 2. Browse the journey

Use Playwright MCP tools to walk through the journey step by step on the live deployed app:

- `browser_navigate` to the deployed URL.
- Follow each action in the journey using `browser_click`, `browser_type`, `browser_fill`,
  `browser_select`, etc.
- After each action, use `browser_snapshot` to inspect the page state. Verify that the UI
  responds correctly — elements appear, data loads, navigation happens as expected.
- If something looks wrong (missing data, broken layout, error messages, unexpected behavior),
  use `browser_screenshot` to capture the current state and note the problem.
- Continue through all steps of the journey even if problems are found.

### 3. Upload video to UploadThing

Playwright MCP is configured with `--save-trace`, which records video of the browser session.
After completing the journey, use `browser_close` to finalize the trace and video files.

Find the video file in the trace output directory and upload it to UploadThing:

```typescript
import { UTApi } from "uploadthing/server";
import { readFileSync } from "fs";

const utapi = new UTApi();
const videoFile = new File(
  [readFileSync("/path/to/video.webm")],
  "journey-qa-<journey-title>.webm",
  { type: "video/webm" },
);
const result = await utapi.uploadFiles(videoFile);
console.log(result.data.url);
```

The `UPLOADTHING_TOKEN` environment variable provides authentication automatically.

After uploading, announce:

```
VIDEO: <uploadthing-url>: <journey-title> — <one-line description of what was tested>
```

### 5. Report results

**If the journey completed successfully** (all steps worked as expected):

Announce:

```
JOURNEY QA PASSED: <journey-title>
VIDEO: <uploadthing-url>: <description>
```

**If problems were found:**

Since the Replay browser is used for Playwright MCP sessions, a Replay recording is
available for debugging. Upload it:

1. Find the recording: `npx replayio list --json` — look for the most recent finished recording.
2. Upload it: `npx replayio upload <id>`. Note the recording ID.

For each problem encountered, announce:

```
JOURNEY QA FAILED: <journey-title>
PROBLEM: <description of what went wrong>
REPLAY RECORDING: <recordingId>
VIDEO: <uploadthing-url>: <description>
```

Then queue a task to analyze the recording and fix the issue:

```bash
npx tsx /repo/scripts/add-task.ts --skill "skills/tasks/journeyQA.md" --app "<AppName>" \
  --subtask "FixJourney: <journey-title> — <problem description>"
```

### 6. Fix journey problems (FixJourney subtasks)

When processing a `FixJourney` subtask, follow this mandatory debugging process. Every step
is required — do NOT skip or reorder steps.

1. Read the problem description from the subtask.
2. Find the Replay recording ID from the preceding `JOURNEY QA FAILED` announcement.
3. Announce `ANALYZING JOURNEY FAILURE: <journey-title>`.
4. Read the relevant debugging guide in `skills/debugging/` based on the failure category:
   - `skills/debugging/timeouts.md` — Page loads or actions that hang
   - `skills/debugging/component-rendering.md` — Empty DOM, components not mounting
   - `skills/debugging/network-and-api.md` — API errors, missing/wrong data
   - `skills/debugging/form-and-input.md` — Form validation, input interactions
   - `skills/debugging/seed-data.md` — Missing data, count mismatches
   - `skills/debugging/README.md` — Quick reference: symptom to starting tool
5. Announce `JOURNEY FAILURE UPLOADED: <recordingId>` (upload if not already uploaded).
6. Use Replay MCP tools to analyze the failure, following the tool sequence from the relevant
   debugging guide. Use as many tools as needed to understand what actually happened before
   making any changes.
7. Write a bug writeup to `docs/bugs/<JourneyTitle>.md`:
   ```
   # Bug: <journey-title>

   ## Step 1: Evidence

   Evidence the app is broken: <describe concrete evidence from Replay analysis — wrong API
   responses, incorrect state, missing data, UI rendering issues, etc. Write "None found" if
   no evidence.>

   ## Step 2: Root Cause

   <Completely explain the cause of the problem. Include the specific file(s), function(s),
   and line(s) involved. Explain WHY the code is wrong, not just WHAT is wrong.>

   ## Step 3: Fix

   <Describe the fix applied.>
   ```
8. Fix the app code based on what you found.
9. Commit changes and announce: `JOURNEY FAILURE FIXED: <git rev-parse HEAD>`
10. Re-run the journey (go back to step 2 of the Procedure) to verify the fix.

## Directives

- NEVER skip Replay analysis and jump straight to guessing at fixes. The Replay recording
  contains the actual runtime state — use it.
- NEVER skip the bug writeup before fixing code.
- NEVER stop or cancel a Replay recording upload. Wait for it to complete.
- Always test against the live deployed URL, not localhost.
- If the deployed app requires authentication, check the app's seed data or `.env` for test
  credentials.
- Continue through the entire journey even if a problem is found early — there may be
  multiple issues.
