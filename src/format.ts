export const RESET = "";
export const DIM = "";
export const BOLD = "";
export const CYAN = "";
export const GREEN = "";
export const YELLOW = "";
export const RED = "";
const MAGENTA = "";

/** Strip the [ISO timestamp] prefix from a log line. */
export function stripTimestamp(rawLine: string): string {
  const tsMatch = rawLine.match(/^\[\d{4}-\d{2}-\d{2}T[\d:.]+Z\]\s*(.*)/);
  return tsMatch ? tsMatch[1] : rawLine;
}

/**
 * Format a single raw log line (timestamp already stripped) for display.
 * Returns null if the line should be hidden.
 */
export function formatLogLine(line: string): string | null {
  if (!line.trim()) return null;

  if (line.startsWith("=== Iteration")) {
    return `\n${BOLD}${CYAN}${line}${RESET}`;
  }
  if (line.startsWith("Initial revision:") || line.startsWith("Final revision:")) {
    return `${BOLD}${line}${RESET}`;
  }
  if (
    line.startsWith("Container:") ||
    line.startsWith("Target:") ||
    line.startsWith("Skill:") ||
    line.startsWith("Skills:") ||
    line.startsWith("Max iterations:") ||
    line.startsWith("Log file:")
  ) {
    return `${DIM}${line}${RESET}`;
  }
  if (line.startsWith("Running Claude")) {
    return `${DIM}${line}${RESET}`;
  }
  if (line.startsWith("Completed in")) {
    return `${GREEN}${line}${RESET}`;
  }
  if (line.startsWith("Cost:")) {
    return `${YELLOW}${line}${RESET}`;
  }
  if (line.startsWith("Turns:")) {
    return `${DIM}${line}${RESET}`;
  }
  if (line.startsWith("Committed iteration")) {
    return `${DIM}${line}${RESET}`;
  }
  if (
    line.startsWith("Reached max iterations") ||
    line.startsWith("Finished after") ||
    line.includes("Agent signaled <DONE/>")
  ) {
    return `${BOLD}${GREEN}${line}${RESET}`;
  }
  if (line.startsWith("Error running") || line.startsWith("Warning:") || line.startsWith("[claude:err]")) {
    return `${RED}${line}${RESET}`;
  }
  if (line === "--- Prompt ---" || line === "--- End prompt ---") {
    return null;
  }

  // Strip ANSI escape codes before trying JSON parse
  const stripped = line.replace(/\x1b\[[0-9;]*m/g, "");

  // Try parsing as JSON stream event
  try {
    const event = JSON.parse(stripped);
    return formatEvent(event);
  } catch {
    return truncLine(stripped);
  }
}

const MAX_LINE_LEN = 1000;

function truncLine(s: string): string {
  if (s.length <= MAX_LINE_LEN) return s;
  return s.slice(0, MAX_LINE_LEN) + `${DIM}... (truncated)${RESET}`;
}

function truncLines(s: string): string {
  return s.split("\n").map(truncLine).join("\n");
}

export function formatEvent(event: any): string | null {
  if (event.type === "system" && event.subtype === "init") {
    return `${DIM}Session: ${event.session_id} | Model: ${event.model}${RESET}`;
  }

  if (event.type === "assistant") {
    const content = event.message?.content;
    if (!Array.isArray(content)) return null;

    const parts: string[] = [];
    for (const block of content) {
      if (block.type === "text" && block.text) {
        parts.push(truncLines(block.text));
      } else if (block.type === "tool_use") {
        const input = block.input;
        if (block.name === "Bash" && input?.command) {
          parts.push(`${MAGENTA}$ ${truncLine(input.command)}${RESET}`);
        } else if (block.name === "Edit" && input?.file_path) {
          parts.push(`${MAGENTA}[edit] ${input.file_path}${RESET}`);
        } else if (block.name === "Write" && input?.file_path) {
          parts.push(`${MAGENTA}[write] ${input.file_path}${RESET}`);
        } else if (block.name === "Read" && input?.file_path) {
          parts.push(`${MAGENTA}[read] ${input.file_path}${RESET}`);
        } else if (block.name === "Glob" && input?.pattern) {
          parts.push(`${MAGENTA}[glob] ${input.pattern}${RESET}`);
        } else if (block.name === "Grep" && input?.pattern) {
          parts.push(`${MAGENTA}[grep] ${input.pattern}${RESET}`);
        } else {
          parts.push(`${MAGENTA}[${block.name}]${RESET}`);
        }
      }
    }
    return parts.length > 0 ? parts.join("\n") : null;
  }

  if (event.type === "user" && event.tool_use_result) {
    const result = event.tool_use_result;
    const stdout = result.stdout ?? "";
    const stderr = result.stderr ?? "";
    const parts: string[] = [];
    if (stdout) {
      parts.push(`${DIM}${truncLines(stdout)}${RESET}`);
    }
    if (stderr) {
      parts.push(`${RED}${truncLines(stderr)}${RESET}`);
    }
    return parts.length > 0 ? parts.join("\n") : null;
  }

  if (event.type === "user") {
    // User messages with raw content (e.g. tool_result arrays) — skip the raw JSON
    return null;
  }

  if (event.type === "result") {
    return `\n${BOLD}${GREEN}--- Result ---${RESET}\n${DIM}Duration: ${event.duration_ms}ms | Turns: ${event.num_turns} | Cost: $${event.total_cost_usd?.toFixed(4)}${RESET}`;
  }

  return null;
}
