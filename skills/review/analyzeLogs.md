# Skill

Analyze log files and produce per-log analysis files for a report.

## Reading Logs

**You MUST use `npm run read-log /path/to/log` from the repo root to read any log file.**
Do NOT use the Read tool, cat, head, tail, or grep on raw log files. The raw content is
either too large (exceeding the 256KB read limit) or full of ANSI escape codes that make
it unreadable. The `read-log` script parses the raw JSON events and terminal recordings
into a readable conversation showing assistant text, tool calls, and results.

**Do NOT pipe read-log output through grep or other filters.** The read-log script already
formats the output into a readable summary. Read the full output to understand the log.

## Subtask Types

### Unpack

Subtask format: `Unpack: <report-name> <report-file>`

1. List all log files in `/repo/logs/`.

2. Create the analysis directory: `report-data/<report-name>-analysis/`

3. Break the log list into groups of ~10 logs each.

4. Queue an AnalyzeGroup subtask for each group at the FRONT of the queue:

```
npx tsx /repo/scripts/add-task.ts --skill "skills/review/analyzeLogs.md" \
  --subtask "AnalyzeGroup: <report-name> <report-file> <log1> <log2> ... <log10>"
```

Each AnalyzeGroup subtask contains the report name, report file path, and the list of
log file paths separated by spaces.

### AnalyzeGroup

Subtask format: `AnalyzeGroup: <report-name> <report-file> <log1> <log2> ...`

1. Parse the report name, report file path, and log file list from the subtask description.

2. Ensure npm dependencies are installed: check that `node_modules/` exists at the repo root.
   If it does not, run `npm install` from the repo root before proceeding.

3. Read the report file (e.g. `skills/review/reportTestFailures.md`) to get the per-log
   analysis template.

4. For each log file in the list:
   a. Run `npm run read-log <log-path>` from the repo root.
   b. Read the full output to understand what happened in the log.
   c. Write an analysis file to `report-data/<report-name>-analysis/<log-filename>.md`
      following the report file's per-log analysis template.
   d. Use the log's base filename (without directory path) as the analysis filename.
      If multiple logs share a filename, prefix with the parent directory name.

5. After processing all logs in the group, signal completion.
