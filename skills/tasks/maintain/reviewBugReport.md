# Skill

After being fixed, bug reports from users in `docs/bugReports.md` go into an "Unreviewed" section.
These are then reviewed for improvements that can be made to the app building process.

## Unpack Subtasks

If there are any unreviewed bug reports in bugReports.md, add one task per bug
using `add-task`:

1. ClassifyBug: Classify the app building stage to improve to prevent similar bugs.
2. UpdateDirectives: Update the directives to avoid the buggy behavior.
3. FinishBug: Mark the bug as reviewed.

Example:
```
npx tsx /repo/scripts/add-task.ts --skill "skills/tasks/maintain/reviewBugReport.md" --app "<AppName>" \
  --subtask "ClassifyBug: Classify <BugName>" \
  --subtask "UpdateDirectives: Update directives for <BugName>" \
  --subtask "FinishBug: Mark <BugName> as reviewed"
```

## Classifying bugs

Read about the stages of the structured app building process in `skills/messages/buildInitialApp.md`.
You'll be identifying any problem stage whose instructions need improvements to prevent similar bugs.
Some bugs do not have problem stages.

Also review `AppRevisions.md` to verify it was updated appropriately during the bug fix.
If the fix changed the app's behavior but the relevant section wasn't updated (or created), do so now.

Follow these steps to figure out the problem stage (if any). Once you do, update bugReports.md
to refer to it and move onto the next subtask.

1. Read the bug report to understand the problem and any associated analysis explaining the bug.
2. Determine whether the bug is a problem with the app's style or UI. Styling and details of UI behavior
   are not captured by test specifications. For these bugs the problem stage is `writeApp.md`
   (`skills/tasks/build/`), which has guidelines for writing the app.
3. Otherwise the bug is a functional problem. All functionality in the app must be covered by a test entry
   in `docs/tests.md`. Read this file at the point before the bug was fixed, using the git revision info
   in bugReports.md.
4. If the old test entries specify the buggy behavior, this bug is a change in app requirements and
   there is no problem stage.
5. If the old test entries specify the correct behavior, the tests aren't covering it properly.
   The problem stage is `writeTests.md` (`skills/tasks/build/`) which covers writing playwright tests for the entries.
6. Otherwise the test entries say nothing about this behavior. If the bug is asking for new functionality,
   there isn't a problem stage. If the bug is about existing functionality, the test entries are
   underspecified and the problem stage is `testSpec.md` (`skills/tasks/build/`) which covers generation of the spec.

## Updating directives

If no problem stage was identified for the bug report, skip this subtask.

Read the skill file for the stage which breaks down how to perform the stage into
increasingly small and well defined subtasks. These skill files have directives for things to watch
for when performing a subtask, which are reviewed afterwards and while maintaining the app to make sure
they are all being followed.

Check to see if the directives already prohibit the bad behavior. If so, add a note on the entry in
bugReports.md but make no other changes.

If there is no directive against the bad behavior, add one or update any similar / conflicting directive.
Add a note on the entry in bugReports.md about the update made.

Directives should be general purpose and not include details or examples specific to the app being built.

## Finishing bugs

Update `docs/bugReports.md` to move the report from the "Unreviewed" section to the "Finished" section,
creating it at the end if necessary.

Move the report from "Unreviewed" to "Finished" in `docs/bugReports.md`.
