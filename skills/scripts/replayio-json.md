# replayio-json

## Purpose

Documents the known issue with `npx replayio list --json` stdout pollution and the
recommended workaround.

## Problem

The `replayio` CLI embeds spinner and progress characters in stdout even when piped
or redirected, corrupting JSON output. The `--json` flag does not suppress them.
Attempts to parse the output with `node -e`, `python3 -c`, or `jq` fail due to
embedded ANSI escape sequences and carriage returns.

## Recommended Workaround

Use `script` to capture terminal output, then strip ANSI codes with `sed`:

```bash
script -qc "npx replayio list --json" /dev/null | sed 's/\x1b\[[0-9;]*[a-zA-Z]//g'
```

This produces clean JSON that can be piped to `jq` or parsed programmatically.

## Preferred Alternative

Where possible, avoid `npx replayio list --json` entirely. Instead, parse
`~/.replay/recordings.log` directly — it is newline-delimited JSON with structured
`kind` fields (`createRecording`, `addMetadata`, `writeStarted`, `writeFinished`).
The test script (`scripts/test.ts`) already uses this approach. See
`skills/scripts/test.md` for details.
