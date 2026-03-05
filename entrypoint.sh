#!/bin/bash

# Start Playwright MCP server in the background
npx @playwright/mcp --headless --port 8931 --executable-path /home/agent/.replay/runtimes/chrome-linux/chrome --save-trace &

# Start the main server
exec npx tsx /app-building/src/server.ts
