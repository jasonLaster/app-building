# Skill

Merge skill changes and the report into main via a squash-merge PR.

## Subtask Format

`MergeToMain`

## Archiving Logs

The `ArchiveLogs` subtask might appear first. Move all worker logs from logs/ to logs/archive/,
then commit and push.

## Procedure

### 1. Save the current branch

```bash
SOURCE_BRANCH=$(git branch --show-current)
```

### 2. Identify the merge base

```bash
MERGE_BASE=$(git merge-base origin/main HEAD)
```

### 3. Delete unwanted files

Delete files from these directories, which are not wanted in the main branch:

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

### 6. Delete excluded paths

```bash
git rm -rf apps/ logs/ docs/ report-data/ 2>/dev/null || true
git ls-files '*.txt' | grep -v '/' | xargs git rm -f 2>/dev/null || true
```

Skip any that don't exist. If none exist, move on.

### 7. Verify no excluded content remains

```bash
git ls-files | grep -E '^(apps/|logs/|docs/|report-data/)' && echo "ERROR: excluded content remains" || echo "Clean"
```

### 8. Commit and push

```bash
git add -A
git commit -m "Report: <report-name> — skill updates and report"
git push -u origin <report-name>-merge
```

### 9. Create PR and squash-merge

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

### 10. Return to the source branch

```bash
git checkout $SOURCE_BRANCH
```

Pull the merged main so future merges are clean:

```bash
git fetch origin main
```

### 11. Clean up the merge branch

```bash
git branch -d <report-name>-merge
```

## Notes

- If `package-lock.json` has conflicts, regenerate it: delete it, run `npm install`,
  and commit the result.
- The report file (`reports/<report-name>.md`) IS included — it documents what
  changed and why. The analysis directory (`report-data/<report-name>-analysis/`) is NOT
  included — it's working data.
