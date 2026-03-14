# Skill

Use this skill when the user asks about the last deployment, when something was
last deployed, or wants the production URL for an app.

## Identifying the app

Determine which app the user is asking about. If the user does not specify, infer it
from context (e.g. the current branch name, recent work, or the apps directory).
If the app cannot be determined, ask the user.

## Finding deployment info

Read `apps/<AppName>/deployment.txt`. This file is written by the deploy script and
contains key=value pairs:

- `url` — the production URL of the deployed app.
- `deployed_at` — ISO 8601 timestamp of the last deployment.

## Responding

Report the deployment information to the user in a readable format: the app name,
the production URL, and when it was last deployed (converted to a human-friendly
date/time). If the file does not exist, tell the user the app has not been deployed yet.
