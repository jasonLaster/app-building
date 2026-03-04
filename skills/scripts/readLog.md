# read-log

## Purpose

Reads raw log files and formats them into a readable conversation showing assistant text,
tool calls, and results. Raw log files contain JSON events and ANSI escape codes that are
unreadable without this script.

## Usage

- `package.json` entry: `"read-log": ...`
- **Run from the repo root**: `npm run read-log /path/to/log`
- Do NOT use the Read tool, cat, head, tail, or grep on raw log files.
- Do NOT pipe read-log output through grep or other filters.

## Prerequisites

**You must run `npm install` from the repo root before first use.** The read-log script
depends on npm packages that may not be installed in a fresh environment. If you see a
module-not-found or missing dependency error, run `npm install` and retry.

## Outputs

- **stdout**: Formatted conversation output showing the full log contents.

## Common Issues

- **Missing dependencies**: If `npm run read-log` fails with a module resolution error,
  run `npm install` from the repo root first. This is the most common failure mode.
