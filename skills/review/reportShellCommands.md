# Report Definition: Shell Commands

This file defines the analysis template and synthesis instructions for a shell-commands report.
It is referenced by `analyzeLogs.md` and `synthesizeReport.md` during report generation.

## Per-Log Analysis Template

For each log file, produce a markdown file with the following structure:

```
# <log filename>

## Summary
NOTES: <brief summary of what this log was about>
SHELL_COMMANDS_USED: <total count of distinct shell commands run in this log>
DIFFICULTY_OBSERVED: none/low/medium/high (how much trouble the agent had with shell commands)

## Commands

For each shell command invocation:

### Command <N>
COMMAND: <the exact command run>
PURPOSE: <what the agent was trying to accomplish>
MULTIPLE_ATTEMPTS: yes/no (did the agent retry this command or try variations?)
SUCCESS: yes/no/partial
```

If a log has no shell commands, just write the Summary section with SHELL_COMMANDS_USED: 0.

## Report Synthesis

Compile all analysis files into a single report with these sections:

### 1. Summary Statistics
- Total logs analyzed
- Total shell commands across all logs
- Unique commands (deduplicated by base command)
- Logs with difficulty (medium or high)
- Overall success rate
- Multiple-attempt rate

### 2. Command Catalog
Group commands by category:
- **Build & Dev**: npm run, npx, vite, netlify dev, etc.
- **Testing**: npm run test, npx playwright, npx replayio, etc.
- **Git**: git add, commit, checkout, diff, log, etc.
- **Database**: neon CLI, psql, SQL commands, etc.
- **File & System**: ls, mkdir, cp, mv, rm, chmod, etc.
- **Network**: curl, wget, etc.
- **Package Management**: npm install, npm uninstall, etc.
- **Other**: anything not fitting the above

For each command, note: frequency, typical purpose, success rate.

### 3. Difficulty Analysis
- Commands that frequently required multiple attempts
- Commands that frequently failed
- Patterns in what made commands difficult
- Agent workarounds that succeeded

### 4. Recommendations
Target these files with specific, actionable recommendations:
- `skills/scripts/*.md` — New script design docs to create, or updates to existing ones
- Task skills that could benefit from better shell command guidance
- Common command patterns that should be documented as standard procedures
- Dockerfile changes to setup software required by all apps
