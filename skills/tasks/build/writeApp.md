# Skill

You are writing the database and code for the app to match the specs in AppSpec.md and docs/tests.md, and to match an optional style guide. If `AppRevisions.md` exists, it describes new functionality and spec changes organized by topic section, and must also be followed.

## Unpack Subtasks

Unpack the initial write app task into subtasks using `add-task`:

First, add a setup task. The SetupApp subtask must complete ALL scaffolding, dependency
installation, configuration (vite, tsconfig, netlify.toml, playwright config), and run
`npm run check` successfully before any component writing begins. Do not leave infrastructure
setup for component-writing tasks to discover and fix:

```bash
npx tsx /repo/scripts/add-task.ts <<'EOF'
[{ "skill": "skills/tasks/build/writeApp.md", "app": "<AppName>", "subtasks": ["SetupApp: Setup the app", "DesignDatabase: Design the database"] }]
EOF
```

Then add ALL page tasks in a single `add-task` call. Write out every page and component
explicitly — do not use a loop or script:
```bash
npx tsx /repo/scripts/add-task.ts <<'EOF'
[
  { "skill": "skills/tasks/build/writeApp.md", "app": "<AppName>", "subtasks": [
    "WriteComponent<Component1>: Write the <Component1> component",
    "WriteComponent<Component2>: Write the <Component2> component",
    "WritePage<Page1>: Write the page itself"
  ]},
  { "skill": "skills/tasks/build/writeApp.md", "app": "<AppName>", "subtasks": [
    "WriteComponent<Component3>: Write the <Component3> component",
    "WritePage<Page2>: Write the page itself"
  ]}
]
EOF
```

## SetupApp Guidance

During the SetupApp subtask, the app directory is mostly empty. Do not waste time searching
for files that don't exist yet — create them. In particular:

- **`store.ts`**: The Redux store file does not exist yet during setup. Create it at
  `src/store.ts` rather than searching for it.
- **Install Playwright and Replay as dev dependencies** during setup so they are available
  when test-writing begins. Run `npm install --save-dev @playwright/test @replayio/playwright`
  and `npx replayio install` during SetupApp, not later when tests are first run.
- **Standard directory structure**: Create these directories up front:
  - `src/pages/` — page components
  - `src/components/` — shared UI components
  - `src/slices/` — Redux slices
  - `netlify/functions/` — backend serverless functions
  - `scripts/` — build/db scripts (schema.ts, seed-db.ts, check.ts, test.ts)
  - `tests/` — Playwright test files

## Database Provisioning

For Neon database setup during app creation, follow `skills/scripts/neon-setup.md`. Key points:

- `NEON_API_KEY` is available as a container-level environment variable.
- Use `$NEON_API_KEY` directly in curl headers (shell expansion). Do not use `printenv` in a subshell.
- **If authentication fails**, the variable may contain a trailing newline. Capture it via
  `printf` first: `NEON_KEY=$(printf '%s' "$NEON_API_KEY")` then use `$NEON_KEY` in curl headers.
- After creating a project, save the `NEON_PROJECT_ID` and `DATABASE_URL` to `.env`.
- See `skills/scripts/env-setup.md` for the full list of required environment variables.

## Required Configuration Files

The SetupApp subtask must create all of the following configuration files. Do NOT explore
git history to discover these — create them directly using the patterns below:

- **`package.json`** — Dependencies, scripts (`check`, `test`, `deploy`), type: module
- **`tsconfig.json`** — Strict mode, JSX react-jsx, ES2020 target, path aliases
- **`vite.config.ts`** — React plugin, sourcemap: true, minify: false, process.env.NODE_ENV define
- **`netlify.toml`** — `base` set to app subdirectory, redirects for `/api/*` and SPA catch-all
- **`playwright.config.ts`** — Replay browser, reporter, timeouts, webServer with `--functions`
- **`index.html`** — Vite entry point
- **`src/main.tsx`** — React root with Provider and Router
- **`src/App.tsx`** — Router outlet / layout
- **`src/store.ts`** — Redux store
- **`src/index.css`** — Global styles and CSS variables
- **`scripts/check.ts`** — Typecheck + lint quality gate
- **`scripts/test.ts`** — Test runner with Neon branch management
- **`scripts/schema.ts`** — `initSchema` function (single source of truth for DB schema)
- **`scripts/seed-db.ts`** — Seed data with `truncateAndSeed`
- **`scripts/deploy.ts`** — Production deployment script
- **`.eslintrc.cjs`** or **`eslint.config.*`** — ESLint configuration
- **`netlify/functions/db.ts`** — Shared `getSql()` database helper

## Reference Apps

When scaffolding a new app, check for existing reference apps that can inform your setup.
Look for completed apps under `apps/` first — if any exist, read their configuration files
directly (e.g., `vite.config.ts`, `tsconfig.json`, `netlify.toml`, `playwright.config.ts`).
If no apps exist locally, use `git log --all --oneline` to find previous app builds in git
history, then use `git show <commit>:<path>` to read their configuration files. Prefer
reading existing local apps over git history exploration to avoid excessive shell commands.

## Guidelines

- Write clean, working code. No TODOs, placeholder implementations, or mock data. All features must be real and fully functional end-to-end, backed by the database.
- All JSX rendered on a page must be abstracted into other React components with their own files.
- Check for style guides at both `apps/AppStyle.md` (shared across all apps) and `apps/<AppName>/AppStyle.md` (app-specific). Read both if they exist and use them to style the pages and components appropriately. The app-specific style guide takes precedence when they conflict. Prefer using CSS files with style variables instead of hardcoded styles.
- Check for reusable library and component code in `apps/shared` and use these when appropriate. Set up the app build system so it can use code from this directory.

## Database Schema

The app MUST have a reusable `initSchema` function exported from a shared module (e.g.,
`scripts/schema.ts`). This is the single source of truth for the database schema, used by
the test and deploy scripts (see `skills/scripts/test.md` and `skills/scripts/deploy.md`).

**Requirements for `initSchema`**:

- Exported function that accepts a database URL string and returns a Promise. It must NOT read
  `DATABASE_URL` from the environment or `.env` — the caller passes the URL.
- Must use `CREATE TABLE IF NOT EXISTS` for all tables, making it idempotent and safe to re-run.
- Must create all tables, indices, and constraints needed by the app.
- When a new table or column is added to the app, it MUST be added to `initSchema`. There must be
  exactly one place where the schema is defined.

The app should also have migration logic for `ALTER TABLE` changes (new columns, new indices)
that `CREATE TABLE IF NOT EXISTS` cannot detect. Migrations run after `initSchema` in all
contexts (testing, deployment).

## Directives

- Always run `npm run check` from the **app directory** (`cd /repo/apps/AppName && npm run check`),
  not standalone `npx tsc --noEmit` at the repo root. The app directory has the correct `tsconfig.json`
  and ESLint config. See `skills/scripts/check.md`.

- When working on a component, identify the test entries in the spec relevant to that component, and make sure that the entry requirements are satisfied by the app code.

- Match the visual appearance of elements to the mockup: button variants, icon presence, badge/tag styling, section layouts (horizontal vs vertical), and field sets. Do not simplify the visual design.

- All components must include `data-testid` attributes on interactive elements, containers, list items,
  and anything that E2E tests will need to target. Add testids during initial component development,
  not retroactively. Reference docs/tests.md to identify which elements need testids.

- In a monorepo where the app is in a subdirectory (e.g., `apps/SalesCRM`), add `base = "apps/SalesCRM"`
  to `netlify.toml` so that Netlify CLI resolves the functions directory relative to the app root,
  not the git repository root. IMPORTANT: even with `base` set, `netlify dev` may still resolve the
  functions directory incorrectly. The Playwright config's `webServer` must pass `--functions ./netlify/functions`
  explicitly. When curling endpoints manually, start the server the same way:
  `npx netlify dev --port 8888 --functions ./netlify/functions`.

- All frontend code must use the `/api/` prefix for calling Netlify Functions (e.g.,
  `fetch('/api/my-function')`). Do NOT use `/.netlify/functions/` — this path returns 404
  with Netlify Functions v2. The `/api/` prefix is the standard for all function calls in
  both development and production.

- **Ensure `netlify.toml` or `_redirects` correctly routes `/api/*` to Netlify Functions.**
  Without explicit routing rules, the SPA catch-all redirect (`/* /index.html 200`) will
  serve HTML for API endpoint requests instead of routing them to functions. This is the most
  common cause of `curl` returning HTML instead of JSON when testing deployed API endpoints.
  Place API redirects before the SPA catch-all:
  ```toml
  [[redirects]]
    from = "/api/*"
    to = "/.netlify/functions/:splat"
    status = 200

  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
  ```

- Netlify functions must not import `@neondatabase/serverless` directly. Instead, each app must
  have a shared `netlify/functions/db.ts` module that all functions import:

  ```typescript
  import { neon } from '@neondatabase/serverless'

  export function getSql() {
    return neon(process.env.DATABASE_URL!)
  }
  ```

  - `DATABASE_URL` points to the production Neon database in deployment, and to an ephemeral
    Neon branch during testing. The test script manages branch creation and cleanup.

- When using the sql function from `db.ts`, ONLY use tagged template literal
  syntax for queries: `` sql`SELECT * FROM table WHERE id = ${id}` ``. NEVER use `sql(queryString, paramsArray)`.
  For dynamic WHERE clauses, build composable query fragments and conditionally include them in the tagged template.

- **Handle `noUncheckedIndexedAccess` with Neon query results.** When `tsconfig.json` enables
  `noUncheckedIndexedAccess` (included in strict mode), accessing array elements by index (e.g.,
  `rows[0]`) returns `T | undefined`. For Neon query results, always check for undefined before
  accessing properties: `const row = rows[0]; if (!row) return notFound();`. Do NOT use non-null
  assertions (`rows[0]!`) to silence the error — handle the undefined case properly. This is the
  most common TypeScript error during app development with Neon, requiring multiple `npm run check`
  iterations to resolve.

- For database columns with DATE, TIMESTAMP, or UUID types, always convert empty strings to null
  before inserting or updating. Use `value || null` instead of `value ?? null`, because the nullish
  coalescing operator (`??`) does not convert empty strings.

- When formatting date values received from the API/database for display or for use as
  `<input type="date">` values, always normalize the string to `YYYY-MM-DD` first (e.g.,
  `value.split('T')[0]`). PostgreSQL serializes DATE columns as full ISO timestamps (e.g.,
  `1985-03-15T00:00:00.000Z`), not plain `YYYY-MM-DD` strings. HTML date inputs reject any
  format other than `YYYY-MM-DD`, rendering the field empty. Likewise, passing an ISO timestamp
  to `new Date()` with an appended timezone anchor produces an invalid date.

- When a backend handler deletes and re-inserts related records (e.g., delete-then-reinsert
  pattern for updating child rows), it must first delete any rows in other tables that have
  foreign key references to the rows being deleted. Walk the FK dependency chain from leaf
  tables inward before deleting the target rows.

- Netlify Functions accessed at `/.netlify/functions/<name>/<resourceId>` have the function name at
  path index 2 and the resource ID at index 3 (after splitting on `/` and filtering empty segments).
  Common off-by-one error: using index 2 for the resource ID when it contains the function name.

- Detail/record pages should use inline editing (click-to-edit fields, inline selectors, inline
  dropdowns, etc.) for editing properties of the record rather than opening an edit modal. Inline
  editing keeps the user in context and is simpler to implement and test. Only use modals for
  complex multi-step workflows or confirmations (e.g. delete confirmation).

- When building modals that reference other entities (e.g., adding a relationship to a person), use a
  searchable select/dropdown component, not a plain text input for IDs.

- When a `useEffect` derives local state from a URL parameter or route param (e.g., setting a
  `viewingItemId` from a URL's `:id` segment), it must handle both the truthy case (param present →
  set state) and the falsy case (param absent → clear state). Omitting the `else` branch causes
  stale state to persist when navigating away from a parameterized route back to the base route.

- Gate dependent API calls on prerequisite data being loaded. When a component fetches data
  that depends on another piece of state (e.g., fetching dashboard stats requires `currentUser`
  to be loaded first), add a guard condition to the `useEffect` or thunk that checks for the
  prerequisite before dispatching. Without this, race conditions cause fetches to fire before
  prerequisite data is available, resulting in empty or wrong responses that break tests.

- When writing SQL queries for lookup/autocomplete endpoints that return distinct entities, use
  `DISTINCT ON (<primary_identifier>)` (PostgreSQL) rather than `SELECT DISTINCT` across multiple
  columns. `SELECT DISTINCT col1, col2` deduplicates on the combination of all listed columns, so
  rows with the same primary identifier but different secondary values (e.g., same code with
  different descriptions) will appear as separate results, causing duplicate entries in dropdowns.

- Multi-page apps must include a navigation sidebar or menu component that provides links to all
  top-level pages. The navigation must be present on every page via the app's root layout. Do not
  rely on users manually entering URLs to navigate between pages.

- Navigation sidebars and menus must not contain duplicate links pointing to the same URL. Each
  navigation item must have a unique route. Remove or consolidate any entries that would navigate
  to the same destination.

- SQL queries in backend functions must only reference tables and columns that are defined in the
  app's schema (`scripts/schema.ts`). Before writing a query that references a table, verify it
  exists in `initSchema`. Referencing non-existent tables causes runtime "relation does not exist"
  errors that silently break entire endpoints.

- Do not use `type="number"` on input fields that display formatted values requiring trailing zeros
  (e.g., currency amounts like "$175.00"). HTML number inputs normalize their value, stripping
  trailing zeros. Use `type="text"` with `inputMode="decimal"` and format the displayed value
  explicitly (e.g., `toFixed(2)` for currency).

- Navigation sidebars must be collapsible. Include a toggle button that switches between expanded
  (full labels) and collapsed (icons only) states. When collapsed, show icon-only items at a narrow
  width with title tooltips for accessibility.

- Never use native HTML `<select>` elements for filter controls or dropdowns when the app has a
  custom design system or style guide. Native form elements cannot be fully styled and will revert
  to browser defaults on interaction. Always use custom dropdown components with React state.

- Attachment displays should show file-type-specific icons or thumbnails (e.g., image preview for
  images, document icon for PDFs, spreadsheet icon for CSVs). Do not use a single generic file
  icon for all attachment types.

- Attachment functionality must support actual file uploads. Any UI that allows adding attachments
  must include a working file upload mechanism (e.g., file picker, drag-and-drop), not just link entry.

- Every page component must include consistent padding on its root element (`p-6 max-sm:p-3`)
  so content is never flush against the screen edges. This applies to all pages including
  centered layouts (auth forms, error pages) — add padding alongside centering utilities.

## Tips

- Production builds must use `sourcemap: true`, `minify: false`, and the React development build in
  `vite.config.ts` so that Replay recordings show readable source code with full React component names
  and developer warnings. Configure this with:
  ```ts
  build: {
    sourcemap: true,
    minify: false,
  },
  define: {
    'process.env.NODE_ENV': '"development"',
  },
  ```
  The `define` setting forces React to use its development bundle in production builds, which preserves
  component display names and enables React DevTools support in Replay recordings. Never remove these settings.
- When scaffolding a new Vite project, the target directory must be empty. Scaffold in a temp directory
  (`/tmp/<name>`) and copy the needed files to the app directory.
- Plan the complete data flow before writing code: what the backend endpoint returns, what the Redux
  slice state shape looks like, and what props each component needs. Write backend → Redux → sections → modals → page.
- When significantly modifying an existing file (>50% of lines), use Write to replace the entire file
  rather than multiple sequential Edits. Avoid chains of 4-5 Edits to the same file.
- When a React component uses `useState` with a prop as the initial value, the state will NOT update
  when the prop changes. Add a `useEffect` to sync local state with prop changes, or use the prop
  directly for display and only use local state during editing.
- For Redux slices, avoid setting `loading = true` during refetches when data already exists. Only show
  loading indicators on initial load (`state.items.length === 0`). This prevents "Loading..." flashes
  that cause tests to see empty content during refetches.
- When an async operation (like saving) should visually complete before closing edit mode, make the
  `onUpdate`/`onSave` callback return a Promise, and await it before calling `setEditing(false)`.
- If the backend supports DELETE operations for a resource, the UI must include delete buttons/actions.
  Check all backend endpoints and ensure the frontend exposes every CRUD operation.
- When adding domain-specific colors (e.g., status badge colors), always define them as CSS variables
  in `index.css` under the `@theme` block rather than hardcoding `rgba()`/`rgb()` values in component
  files. This keeps all colors centralized and easy to theme.
- Components should be layout-agnostic: do NOT include outer padding (`px-*`) or margin in component
  root elements. Let the parent page/layout control spacing. When components embed their own padding,
  composing them in flex rows causes double-padding conflicts that require rework.

- **`jq` is not available in the container.** When you need to parse JSON from shell commands
  (e.g., Neon API responses, Netlify CLI output), use `python3 -c` or `node -e` instead of
  `jq`. Example: `curl -s ... | python3 -c "import sys,json; print(json.load(sys.stdin)['key'])"`
  or `curl -s ... | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).key))"`.

- Prefer using the Glob and Grep tools over shell `find`, `ls`, and `grep` commands for file
  exploration and content searching. The dedicated tools provide better structured output and
  avoid unnecessary shell command overhead.

- Run `npm install` once with all required packages rather than running it multiple times with
  the same or overlapping packages. Batch all dependency additions into a single install command.

- When downloading mockup images for visual reference, use `curl -L -o /tmp/<filename> <url>`.
  This pattern works well for fetching mockups from UploadThing or other image hosts.

- Do not use `overflow: hidden` on containers that have children with absolutely-positioned elements
  (e.g., dropdown menus, popovers, tooltips). The overflow clipping will cut off content that extends
  beyond the container boundary. Additionally, elements that render floating/overlapping UI (such as
  action menu wrappers) must establish their own stacking context with `position: relative` and an
  explicit `z-index` so they appear above sibling elements.
