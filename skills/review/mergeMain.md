# Skill

Prepare a clean branch with skill changes and the report for PR to main.

## Subtask Format

`MergeSkills: <report-name>`

## Procedure

### 1. Identify the merge base

```bash
MERGE_BASE=$(git merge-base origin/main HEAD)
```

### 2. Determine which paths to include

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

### 3. Create a clean merge branch from main

```bash
git checkout -b <report-name>-merge origin/main
```

### 4. Apply changes from the source branch

For each included path, check out the version from the source branch:

```bash
SOURCE_BRANCH=<the branch you were on before step 3>
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

### 5. Delete excluded paths

```bash
git rm -rf apps/ logs/ docs/ report-data/ 2>/dev/null || true
git ls-files '*.txt' | grep -v '/' | xargs git rm -f 2>/dev/null || true
```

Skip any that don't exist. If none exist, move on.

### 6. Verify no excluded content remains

```bash
git ls-files | grep -E '^(apps/|logs/|docs/|report-data/)' && echo "ERROR: excluded content remains" || echo "Clean"
```

### 7. Commit

```bash
git commit -m "Report: <report-name> — skill updates and report"
```

### 8. Test the merge

Verify the branch merges cleanly into main:

```bash
git checkout main
git merge --no-commit --no-ff <report-name>-merge
git diff --stat
git merge --abort
git checkout <report-name>-merge
```

If there are conflicts, resolve them on the merge branch, favoring the source
branch's version.

### 9. Final state

The `<report-name>-merge` branch is ready for PR. It contains skill/script
updates and the report file, but no apps, logs, report data, or docs.

## Notes

- If `package-lock.json` has conflicts, regenerate it: delete it, run `npm install`,
  and commit the result.
- The report file (`reports/<report-name>.md`) IS included — it documents what
  changed and why. The analysis directory (`report-data/<report-name>-analysis/`) is NOT
  included — it's working data.
