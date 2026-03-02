# Skill

You are writing the database and code for the app to match the specs in AppSpec.md and docs/tests.md, and to match an optional style guide. If `AppRevisions.md` exists, it describes new functionality and spec changes organized by topic section, and must also be followed.

## Unpack Subtasks

Unpack the initial write app task into subtasks using `add-task`:

First, add a setup task:
```
npx tsx /repo/scripts/add-task.ts --skill "skills/tasks/build/writeApp.md" --app "<AppName>" \
  --subtask "SetupApp: Setup the app" \
  --subtask "DesignDatabase: Design the database"
```

Then add one task per page, containing all components and the page itself:
```
npx tsx /repo/scripts/add-task.ts --skill "skills/tasks/build/writeApp.md" --app "<AppName>" \
  --subtask "WriteComponent<Component1>: Write the <Component1> component" \
  --subtask "WriteComponent<Component2>: Write the <Component2> component" \
  --subtask "WritePage<Name>: Write the page itself"
```

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

- Netlify functions must not import `@neondatabase/serverless` directly. Instead, each app must
  have a shared `netlify/functions/db.ts` module that all functions import:

  ```typescript
  import { neon } from '@neondatabase/serverless'
  import { PGlite } from '@electric-sql/pglite'

  let pglite: PGlite | null = null

  export function getSql() {
    if (process.env.PGLITE_DATA_DIR) {
      if (!pglite) pglite = new PGlite(process.env.PGLITE_DATA_DIR)
      return pglite.sql.bind(pglite)
    }
    return neon(process.env.DATABASE_URL!)
  }
  ```

  - **Production / deployment**: Uses Neon via `DATABASE_URL`.
  - **Testing**: Uses PGlite via `PGLITE_DATA_DIR` — an embedded Postgres that runs in-process
    with no network or cloud dependency. Each test worker gets its own PGlite instance for isolation.
  - Both `@neondatabase/serverless` and `@electric-sql/pglite` must be listed in the app's
    `package.json` dependencies.

- When using the sql function from `db.ts`, ONLY use tagged template literal
  syntax for queries: `` sql`SELECT * FROM table WHERE id = ${id}` ``. NEVER use `sql(queryString, paramsArray)`.
  For dynamic WHERE clauses, build composable query fragments and conditionally include them in the tagged template.

- For database columns with DATE, TIMESTAMP, or UUID types, always convert empty strings to null
  before inserting or updating. Use `value || null` instead of `value ?? null`, because the nullish
  coalescing operator (`??`) does not convert empty strings.

- Netlify Functions accessed at `/.netlify/functions/<name>/<resourceId>` have the function name at
  path index 2 and the resource ID at index 3 (after splitting on `/` and filtering empty segments).
  Common off-by-one error: using index 2 for the resource ID when it contains the function name.

- When building modals that reference other entities (e.g., adding a relationship to a person), use a
  searchable select/dropdown component, not a plain text input for IDs.

- Navigation sidebars and menus must not contain duplicate links pointing to the same URL. Each
  navigation item must have a unique route. Remove or consolidate any entries that would navigate
  to the same destination.

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

- Prefer using the Glob and Grep tools over shell `find`, `ls`, and `grep` commands for file
  exploration and content searching. The dedicated tools provide better structured output and
  avoid unnecessary shell command overhead.

- When downloading mockup images for visual reference, use `curl -L -o /tmp/<filename> <url>`.
  This pattern works well for fetching mockups from UploadThing or other image hosts.

- Do not use `overflow: hidden` on containers that have children with absolutely-positioned elements
  (e.g., dropdown menus, popovers, tooltips). The overflow clipping will cut off content that extends
  beyond the container boundary. Additionally, elements that render floating/overlapping UI (such as
  action menu wrappers) must establish their own stacking context with `position: relative` and an
  explicit `z-index` so they appear above sibling elements.
