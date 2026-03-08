# Skill

You will be developing a document in the app at `docs/userJourneys.md` describing the personas
of the users who can interact with the app and the key journeys they can take while using it.

## Personas

The journeys file is split into sections, one for each user persona. At the top of each section,
describe common characteristics about the user, along with their motivations and goals when
using the app.

## Journeys

For each persona list the key journeys for the things that the user will want to do when using
the app. For each journey create a title, a short description, and a list of the actions the
user will expect to do in order to complete the journey. Keep actions concise.

## JourneyQA Page Inspection

When writing Playwright scripts for JourneyQA, always inspect the actual page structure
before writing selectors. Use a Screenshot or page snapshot to understand the DOM layout
(e.g., whether the page uses HTML tables vs div-based grids, custom dropdowns vs native
selects). Writing selectors based on assumptions about page structure is the primary cause
of JourneyQA test failures — incorrect assumptions about layout caused 3 out of 3 observed
JourneyQA failures in one session.
