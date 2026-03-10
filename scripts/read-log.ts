import { readFileSync } from "fs";
import { resolve } from "path";
import { Command } from "commander";
import { formatLogLine, stripTimestamp } from "../src/format";

const program = new Command();
program
  .argument("<logfile>", "path to an iteration log file")
  .parse();

const logFile = resolve(program.args[0]);
const content = readFileSync(logFile, "utf-8");

for (const rawLine of content.split("\n")) {
  if (!rawLine.trim()) continue;
  const formatted = formatLogLine(stripTimestamp(rawLine));
  if (formatted) console.log(formatted);
}
