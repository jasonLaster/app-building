# deployment-url

## Purpose

Documents how to discover the deployed URL for an app. Agents frequently waste 10+ commands
searching for deployment URLs that don't exist or are stored inconsistently.

## Discovery Procedure

Follow these steps in order. Stop as soon as you find the URL.

### 1. Check `.netlify/state.json`

```bash
cat apps/<AppName>/.netlify/state.json 2>/dev/null
```

If the file exists, it contains the linked Netlify site ID. Construct the URL from it.

### 2. Check Netlify sites list

```bash
npx netlify sites:list --json 2>/dev/null | python3 -c "
import sys, json
sites = json.load(sys.stdin)
for s in sites:
    if '<appname>' in s.get('name', '').lower():
        print(s['ssl_url'])
        break
"
```

Replace `<appname>` with the lowercase app name.

### 3. If not deployed

If neither method finds a URL, the app has not been deployed yet. In this case:

- **For journey tests**: Use `npm run test` (local dev server mode) instead. The test script
  starts its own dev server and creates ephemeral Neon branches. Do not spend time deploying
  just to run tests.
- **For production-URL journey tests**: Deploy the app first using `npm run deploy` from the
  app directory, then re-check step 1.

### 3. Check `deployment.txt`

```bash
cat apps/<AppName>/deployment.txt 2>/dev/null
```

If it exists, it contains `url` and `deployed_at`. The `url` field is the deployed
production URL.

### 4. If not deployed

If none of the above methods find a URL, the app has not been deployed yet. In this case:

- **For journey tests**: Use `npm run test` (local dev server mode) instead. The test script
  starts its own dev server and creates ephemeral Neon branches. Do not spend time deploying
  just to run tests.
- **For production-URL journey tests**: Deploy the app first using `npm run deploy` from the
  app directory, then re-check step 1.

## Important

- Do not run more than 3 commands searching for a deployment URL. If the above steps don't
  find it, the app is not deployed.
- After deploying, the URL is stored in `.netlify/state.json` automatically by `netlify link`.
