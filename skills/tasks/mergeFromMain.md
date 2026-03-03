# Skill

Merge the latest `main` branch into the current working branch to pick up new skills,
scripts, and infrastructure changes.

## Process

```bash
git fetch origin main
git merge FETCH_HEAD --no-edit
```

If there are merge conflicts, resolve them, then `git add` the resolved files and
`git commit --no-edit`.

## Notes

- This should be the first task in a maintenance round, before any bug fixes or other work.
- Only `main` is merged in — never push to or checkout `main` from this task.
- If the merge is a no-op (already up to date), that's fine — mark the task as done.
