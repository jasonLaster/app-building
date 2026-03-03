# Skill

Synthesize per-log analysis files into a final report.

## Subtask Format

`Synthesize: <report-name> <report-file>`

## Procedure

1. Parse the report name and report file path from the subtask description.

2. Read the report file (e.g. `skills/review/reportTestFailures.md`) to get the
   synthesis instructions.

3. List and read all analysis files from `report-data/<report-name>-analysis/`.

4. Following the report file's "Report Synthesis" section, compile the analysis files
   into a single report.

5. Write the final report to `reports/<report-name>.md`.

6. The report should be self-contained — a reader should be able to understand the
   findings without reading individual analysis files.
