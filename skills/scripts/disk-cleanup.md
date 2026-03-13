# disk-cleanup

## Purpose

Standard disk cleanup procedure when free space drops below 1GB. Follow this priority order
to maximize space recovered with minimal risk.

## Procedure

Run each step as a **separate command**. Check `df -h /` after each step to see if you've
freed enough space.

### Step 1: Delete Replay recordings (biggest win — can be 7+ GB)

```bash
find ~/.replay -name "recording-*.dat" -delete
find ~/.replay -name "PLAYWRIGHT_METADATA_*" -delete
```

**WARNING**: Do NOT delete `~/.replay/runtimes/` — this contains the Replay browser binary
needed for test recordings. Deleting it requires a full `npx replayio install` to recover
and causes all subsequent test runs to fail until reinstalled.

### Step 2: Delete test artifacts

```bash
rm -rf test-results/ blob-report/ playwright-report/
```

### Step 3: Clear caches

```bash
rm -rf ~/.cache/ms-playwright 2>/dev/null
rm -rf .tsbuildinfo 2>/dev/null
find /tmp -maxdepth 1 -user $(whoami) -mmin +60 -delete 2>/dev/null
```

### Step 4: Clear stale npx caches (if needed)

```bash
rm -rf ~/.npm/_npx 2>/dev/null
```

Note: This clears cached npx binaries. They will be re-downloaded on next use.

### Step 5: Emergency — remove node_modules (last resort)

```bash
rm -rf node_modules
```

**WARNING**: This requires running `npm install --legacy-peer-deps` before any further
development or testing. Only use when steps 1–4 are insufficient.

## When to Use

- Before test runs when `df -h /` shows less than 1GB free (see `preflight.md` step 1b).
- When `netlify dev` or `npm install` fails with disk-related errors.
- After extended test sessions that produce many recordings.

## Notes

- Replay recordings at `~/.replay/recording-*.dat` are the single largest space consumer
  (7+ GB observed in one session). Always clean these first.
- Deleting `node_modules` is destructive — it breaks all commands until `npm install` runs.
  Only use as a last resort.
