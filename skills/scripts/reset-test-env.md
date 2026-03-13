# reset-test-env

## Purpose

Fully reset the test environment when tests are failing due to infrastructure issues (port
conflicts, crashed dev servers, empty databases). This replaces the ad-hoc triage that
otherwise takes 20+ commands.

## Procedure

Run each step as a **separate command**:

### Step 1: Kill stale processes

```bash
ps aux | grep -E "netlify|vite" | grep -v grep | awk '{print $2}' | xargs -r kill 2>/dev/null; echo "servers cleared"
```

### Step 2: Free ports

```bash
fuser -k 8888/tcp 5173/tcp 5174/tcp 2>/dev/null || true
```

Wait 2 seconds for ports to release.

### Step 3: Verify ports are free

```bash
fuser 8888/tcp 2>/dev/null && echo "WARNING: port 8888 still occupied" || echo "port 8888 free"
```

### Step 4: Re-seed the database

```bash
cd /repo/apps/<AppName> && npx tsx scripts/seed-db.ts
```

Or, if the app has API-based seed endpoints, call them in FK dependency order:

```bash
curl -X POST http://localhost:8888/api/instructors/reseed
curl -X POST http://localhost:8888/api/members/reseed
curl -X POST http://localhost:8888/api/bookings/reset-seed
```

**Important**: Seed parent tables before child tables to avoid FK constraint violations.
The correct order depends on the app's schema — always seed tables that are referenced by
foreign keys before tables that contain the foreign keys.

### Step 5: Verify dev server starts cleanly

```bash
npx netlify dev --offline --port 8888 --functions ./netlify/functions &
sleep 5
curl -s http://localhost:8888/api/health || echo "WARNING: dev server not responding"
```

## When to Use

- When test runs fail with `EADDRINUSE` (port already in use).
- When the dev server crashes mid-test-run.
- When tests fail with FK constraint violations or empty table errors after prior runs
  corrupted the database state.
- When multiple infrastructure-related failures accumulate in a single session.

## Notes

- This procedure addresses the three main infrastructure failure modes observed: stale
  processes (port conflicts), corrupted database state (missing seed data), and dev server
  instability.
- For disk space issues, run `skills/scripts/disk-cleanup.md` before this procedure.
