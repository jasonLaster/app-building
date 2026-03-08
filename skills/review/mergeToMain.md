# Skill

Merge skill changes and the report into main via a squash-merge PR.

It is ULTRA IMPORTANT that when merging to main you do not revert other changes that have been made on the main branch.
ONLY merge skill changes made since the merge base along with the new reports.

## Subtask Format

`MergeToMain: <report-name>`

## Procedure

### 1. Save the current branch

```bash
SOURCE_BRANCH=$(git branch --show-current)
```

### 2. Identify the merge base

```bash
MERGE_BASE=$(git merge-base origin/main HEAD)
```

### 3. Determine which paths to include

Include these paths:

```
skills/
scripts/
reports/<report-name>.md
AGENTS.md
CLAUDE.md
Dockerfile
.dockerignore
.gitignore
.rgignore
.env.example
package.json
package-lock.json
tsconfig.json
README.md
```

Delete these paths:

```
apps/
logs/
docs/
report-data/
*.txt (at root level)
```

### 4. Create a clean merge branch from main

```bash
git checkout -b <report-name>-merge origin/main
```

### 5. Apply changes from the source branch

For each included path, check out the version from the source branch:

```bash
git checkout $SOURCE_BRANCH -- skills/ scripts/ AGENTS.md CLAUDE.md \
  Dockerfile .dockerignore .gitignore .rgignore .env.example \
  package.json package-lock.json tsconfig.json README.md
git checkout $SOURCE_BRANCH -- "reports/<report-name>.md"
```

If a file was deleted on the source branch, remove it on this branch too.
Use the diff to identify deletions:

```bash
git diff --name-status $MERGE_BASE $SOURCE_BRANCH -- skills/ scripts/
```

Files with status `D` should be `git rm`'d.

### 6. Verify no main-only changes were reverted

**This step is critical.** Step 5 checks out entire directories from the source branch,
which can overwrite changes that were made directly to main after the branch diverged.

Compare what you are about to commit against current main:

```bash
git diff origin/main -- skills/ scripts/ AGENTS.md CLAUDE.md Dockerfile \
  .dockerignore .gitignore .rgignore .env.example package.json tsconfig.json README.md
```

For every removed line (`-`), verify it was actually removed by a commit on the source
branch (between `$MERGE_BASE` and `$SOURCE_BRANCH`). If a removed line does NOT appear
in the source branch's diff from the merge base, it was a main-only change being reverted
and **must be restored**:

```bash
# Show only what the source branch changed relative to the merge base:
git diff $MERGE_BASE $SOURCE_BRANCH -- skills/ scripts/
```

Any deletion in the Step 5 output that is NOT present in this diff is a revert of a
main-only change. Restore those lines by selectively checking out from `origin/main`:

```bash
# For each file where main-only changes were reverted:
git checkout origin/main -- <file>
# Then re-apply only the source branch's changes to that file:
git diff $MERGE_BASE $SOURCE_BRANCH -- <file> | git apply --3way
```

Repeat until `git diff origin/main` shows only additions and modifications that came
from the source branch, with no unexpected deletions.

### 7. Delete excluded paths

```bash
git rm -rf apps/ logs/ docs/ report-data/ 2>/dev/null || true
git ls-files '*.txt' | grep -v '/' | xargs git rm -f 2>/dev/null || true
```

Skip any that don't exist. If none exist, move on.

### 8. Verify no excluded content remains

```bash
git ls-files | grep -E '^(apps/|logs/|docs/|report-data/)' && echo "ERROR: excluded content remains" || echo "Clean"
```

### 9. Commit and push

```bash
git add -A
git commit -m "Report: <report-name> — skill updates and report"
git push -u origin <report-name>-merge
```

### 10. Create PR and squash-merge

```bash
gh pr create --base main --title "Report: <report-name>" \
  --body "Skill updates and report from $SOURCE_BRANCH"
gh pr merge --squash --auto
```

Wait for the merge to complete:

```bash
gh pr view --json state -q '.state'
```

If the state is not `MERGED` after a reasonable wait, check for merge conflicts
and resolve them.

### 11. Return to the source branch

```bash
git checkout $SOURCE_BRANCH
```

Pull the merged main so future merges are clean:

```bash
git fetch origin main
```

### 12. Clean up the merge branch

```bash
git branch -d <report-name>-merge
```

## Notes

- If `package-lock.json` has conflicts, regenerate it: delete it, run `npm install`,
  and commit the result.
- The report file (`reports/<report-name>.md`) IS included — it documents what
  changed and why. The analysis directory (`report-data/<report-name>-analysis/`) is NOT
  included — it's working data.
