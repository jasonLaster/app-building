# Skill

After a problem has been submitted to the test failure benchmark, the repository state
is cleaned up to make sure the test failure is easy to reproduce.

You will create a new branch with a clean and isolated reproduction of a test failure
based on the information extracted earlier:

- failure branch where the failure was originally encountered
- failing changeset from the failure branch where the test originally failed
- the test file which is failing

Take the following steps:

1. Clone the failure branch into /tmp/test-app and check out the failing changeset from the repository.
   Avoid doing a full repo clone for efficiency.

2. Add a shell script at the project root `reproduce_failure` which reproduces the failure from a bare repository.
   - Creates a new Neon project.
   - Runs `npm install` in the app's directory.
   - Sets up the project's main branch for use by the test.
   - Runs `npm run test <testFile>` in the app's directory.
   - Writes out the error message from playwright and the Replay recordings of the failures to a file in logs/.
   - Writes the name of the result file to stderr along with a PASSED or FAILED marker.
   - Deletes the new Neon project.

3. Run the script and iterate to make sure it behaves as expected:
   - On the base repository it must fail (for reasons other than a misconfigured database state).
   - It must produce the playwright error message and Replay recordings.

4. Once the script is working, run it again to make sure it fails in the same way again.

5. Commit and push to the cleaned branch name you were given.
