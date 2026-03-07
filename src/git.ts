import { execFileSync } from "child_process";
import { readdirSync, rmSync } from "fs";
import type { Logger } from "./log";

const REPO_DIR = "/repo";

// =============================================================================
// Git workflow requirements
// =============================================================================
//
// 1. Startup: Clone repo, check out base branch. If the target branch differs
//    from the clone branch, call checkoutTargetBranch to fetch and check out
//    the existing remote target branch (or create a new local branch).
//
// 2. After each worker iteration: Commit changes and run the PushTarget
//    workflow via commitAndPushTarget.
//
// 3. On stop signal: Stop Claude, commit changes, and run the PushTarget
//    workflow. Pass shouldStop = () => true so no conflict resolution task
//    is queued during stop.
//
// 4. PushTarget workflow (pushTarget):
//    a. Fetch from origin and merge the target branch. If there are
//       conflicts, leave markers in the tree, commit, and push.
//    b. Push to the target branch. On failure, retry up to 3 times
//       (re-fetch + re-merge each time). If all retries fail, log an error
//       and exit the process.
//    c. If conflicts occurred and !shouldStop(), add a task to resolve them.
// =============================================================================

/**
 * Convert a git remote URL to HTTPS with an embedded token.
 * Handles SSH (git@github.com:org/repo.git) and plain HTTPS URLs.
 * If no token is provided, returns the URL unchanged.
 */
export function toTokenUrl(url: string, token?: string): string {
  if (!token) return url;

  // SSH format: git@github.com:org/repo.git -> https://TOKEN@github.com/org/repo.git
  const sshMatch = url.match(/^git@([^:]+):(.+)$/);
  if (sshMatch) {
    return `https://${token}@${sshMatch[1]}/${sshMatch[2]}`;
  }

  // HTTPS without token: https://github.com/org/repo.git -> https://TOKEN@github.com/org/repo.git
  const httpsMatch = url.match(/^https:\/\/([^@]+@)?(.+)$/);
  if (httpsMatch) {
    return `https://${token}@${httpsMatch[2]}`;
  }

  return url;
}

/** Get the remote URL of the current repo (defaults to "origin"). */
export function getLocalRemoteUrl(cwd: string = "."): string {
  return execFileSync("git", ["remote", "get-url", "origin"], {
    cwd,
    encoding: "utf-8",
    timeout: 5000,
  }).trim();
}

/** Get the current branch name. */
export function getLocalBranch(cwd: string = "."): string {
  return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    cwd,
    encoding: "utf-8",
    timeout: 5000,
  }).trim();
}

/**
 * Ensure the repo is on the expected branch. If a task switched branches,
 * this checks out back to the target branch so task-file and commit
 * operations happen on the correct branch.
 */
export function ensureBranch(branch: string, log: Logger, dir: string = REPO_DIR): void {
  const current = getLocalBranch(dir);
  if (current !== branch) {
    log(`Branch drifted to "${current}", checking out "${branch}"`);
    execFileSync("git", ["checkout", branch], {
      cwd: dir,
      encoding: "utf-8",
      timeout: 10000,
      stdio: "pipe",
    });
  }
}

export function cloneRepo(url: string, branch: string, dir: string = REPO_DIR): void {
  // Volume mounts may contain lost+found; clear the directory before cloning
  try {
    for (const entry of readdirSync(dir)) {
      rmSync(`${dir}/${entry}`, { recursive: true, force: true });
    }
  } catch {
    // Directory may not exist yet — that's fine
  }
  const args = ["clone", "--branch", branch, "--single-branch", url, dir];
  execFileSync("git", args, { encoding: "utf-8", timeout: 120000, stdio: "pipe" });
}

/**
 * Called at startup when targetBranch !== cloneBranch.
 * Fetches origin targetBranch into a local tracking branch and checks it out.
 * If the remote branch doesn't exist yet, creates a new local branch.
 */
export function checkoutTargetBranch(targetBranch: string, log: Logger, dir: string = REPO_DIR): void {
  try {
    execFileSync("git", ["fetch", "origin", `${targetBranch}:refs/remotes/origin/${targetBranch}`], {
      cwd: dir,
      encoding: "utf-8",
      timeout: 60000,
      stdio: "pipe",
    });
    // Remote branch exists — check it out as a tracking branch
    execFileSync("git", ["checkout", "-b", targetBranch, `origin/${targetBranch}`], {
      cwd: dir,
      encoding: "utf-8",
      timeout: 10000,
      stdio: "pipe",
    });
    log(`Checked out existing remote branch: ${targetBranch}`);
  } catch {
    // Remote branch doesn't exist — create a new local branch
    try {
      execFileSync("git", ["checkout", "-b", targetBranch], {
        cwd: dir,
        encoding: "utf-8",
        timeout: 10000,
        stdio: "pipe",
      });
      log(`Created new local branch: ${targetBranch}`);
    } catch (e: any) {
      log(`Warning: failed to create branch ${targetBranch}: ${e.message}`);
    }
  }
}

/**
 * PushTarget workflow:
 * 1. git fetch origin targetBranch
 * 2. git merge origin/targetBranch --no-edit
 *    - If merge conflicts: leave conflict markers, add all files, commit
 * 3. git push origin HEAD:targetBranch
 *    - On failure: retry up to 3 times (re-fetch + re-merge each time)
 *    - If all retries fail: log error and exit process
 * 4. If conflicts occurred and !shouldStop(): add conflict resolution task
 */
export function pushTarget(
  targetBranch: string,
  log: Logger,
  shouldStop: () => boolean,
  dir: string = REPO_DIR,
): void {
  let hadConflicts = false;
  const maxAttempts = 4; // 1 initial + 3 retries

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    hadConflicts = false;

    // Step 1: Fetch (explicit refspec needed because --single-branch clone
    // only tracks the clone branch, so a plain fetch won't create origin/<target>)
    let remoteExists = false;
    try {
      execFileSync("git", ["fetch", "origin", `${targetBranch}:refs/remotes/origin/${targetBranch}`], {
        cwd: dir,
        encoding: "utf-8",
        timeout: 60000,
        stdio: "pipe",
      });
      remoteExists = true;
    } catch {
      // Branch doesn't exist remotely yet — push will create it
    }

    // Step 2: Merge (only if remote branch exists)
    if (remoteExists) {
      try {
        execFileSync("git", ["merge", `origin/${targetBranch}`, "--no-edit"], {
          cwd: dir,
          encoding: "utf-8",
          timeout: 30000,
          stdio: "pipe",
        });
      } catch {
        // Merge conflict — leave conflict markers in the tree
        hadConflicts = true;
        try {
          execFileSync("git", ["add", "-A"], {
            cwd: dir,
            encoding: "utf-8",
            timeout: 30000,
          });
          execFileSync("git", ["commit", "-m", "Merge with conflicts (markers left in tree)"], {
            cwd: dir,
            encoding: "utf-8",
            timeout: 30000,
          });
          log("Merged with conflict markers left in tree");
        } catch (e: any) {
          log(`Warning: merge commit failed: ${e.message}`);
        }
      }
    }

    // Step 3: Push
    try {
      execFileSync("git", ["push", "origin", `HEAD:${targetBranch}`], {
        cwd: dir,
        encoding: "utf-8",
        timeout: 120000,
        stdio: "pipe",
      });
      const rev = getRevision(dir).slice(0, 10);
      log(`Pushed ${rev} to ${targetBranch}${hadConflicts ? " (with conflicts)" : ""}`);

      // Step 4: Queue conflict resolution task if needed
      if (hadConflicts && !shouldStop()) {
        try {
          execFileSync(
            "npx",
            [
              "tsx",
              "/repo/scripts/add-task.ts",
              "--skill",
              "skills/tasks/resolveConflicts.md",
              "--subtask",
              "Resolve merge conflicts from auto-resolution with --theirs and verify the codebase is correct",
            ],
            { cwd: dir, encoding: "utf-8", timeout: 30000 },
          );
          log("Queued conflict resolution task");
        } catch (e: any) {
          log(`Warning: failed to queue conflict resolution task: ${e.message}`);
        }
      }

      return; // Success
    } catch (e: any) {
      if (attempt < maxAttempts) {
        log(`Push attempt ${attempt} failed, retrying... (${e.message})`);
      } else {
        log(`Fatal: push failed after ${maxAttempts} attempts: ${e.message}`);
        process.exit(1);
      }
    }
  }

}

/**
 * Commit all changes and push to the target branch via the PushTarget workflow.
 * 1. git add -A && git commit -m label
 * 2. pushTarget(targetBranch, log, shouldStop, dir)
 */
export function commitAndPushTarget(
  label: string,
  targetBranch: string,
  log: Logger,
  shouldStop: () => boolean,
  dir: string = REPO_DIR,
): void {
  try {
    execFileSync("git", ["add", "-A"], { cwd: dir, encoding: "utf-8", timeout: 30000 });
    execFileSync("git", ["commit", "-m", label, "--allow-empty"], {
      cwd: dir,
      encoding: "utf-8",
      timeout: 30000,
    });
  } catch (e: any) {
    log(`Warning: git commit failed: ${e.message}${e.stderr ? `\nstderr: ${e.stderr}` : ""}`);
    return;
  }

  const summary = lastCommitSummary(dir);
  log(`Committed: ${label}${summary ? `\n${summary}` : ""}`);

  pushTarget(targetBranch, log, shouldStop, dir);
}

/** Return per-file +/- summary of the last commit. */
function lastCommitSummary(dir: string): string {
  try {
    // --numstat gives "added\tremoved\tfile" per line
    const raw = execFileSync("git", ["diff", "--numstat", "HEAD~1", "HEAD"], {
      cwd: dir,
      encoding: "utf-8",
      timeout: 10000,
      stdio: "pipe",
    }).trim();
    if (!raw) return "";
    return raw.split("\n").map((line) => {
      const [added, removed, file] = line.split("\t");
      return `  ${file} +${added}/-${removed}`;
    }).join("\n");
  } catch {
    return "";
  }
}

export function getRevision(dir: string = REPO_DIR): string {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: dir,
      encoding: "utf-8",
      timeout: 10000,
    }).trim();
  } catch {
    return "(unknown)";
  }
}
