# Skill

During this stage you will polish the app to improve its quality, identifying and fixing
issues around the app's appearance, performance, code structure, and so on.

## Progress Tracking

Polish work is tracked in `docs/plan.md`. Each polish stage has a section in the file with
a checklist of completed work. Before unpacking subtasks, read `docs/plan.md` (create it
if it doesn't exist) and check which stages have already been completed.

The format is:

```markdown
## Polish

### Responsive UI
- [x] ClientsListPage
- [x] ClientDetailPage
- [ ] DealsListPage
```

When a polish stage is fully complete, mark it done:

```markdown
### Responsive UI ✓
```

A stage with `✓` in its heading is skipped during unpacking — no tasks are added for it.

## Unpack Subtasks

Read `docs/plan.md` and check which polish stages still need work. For each incomplete stage,
add the appropriate tasks as described below. After adding tasks, update `docs/plan.md` with
the planned items (unchecked). As each subtask completes, check off its entry.

### Responsive UI

If the `Responsive UI` section in `docs/plan.md` is missing or not marked `✓`, the app needs
responsive work. Read `docs/tests.md` to identify all pages, then add one task per page:

```
npx tsx /repo/scripts/add-task.ts --skill "skills/tasks/maintain/polishApp.md" --app "<AppName>" \
  --subtask "MakeResponsive<PageName>: Make <PageName> responsive"
```

Add or update the `Responsive UI` section in `docs/plan.md` with an unchecked entry for each page.

## Making a Page Responsive

When working on a `MakeResponsive` subtask, update the page and its components so the layout adapts
cleanly as the viewport shrinks from desktop down to mobile widths. The goal is that all content
remains usable and readable — no horizontal scrolling, no overlapping elements, no truncated
controls.

After completing the work, check off the page in `docs/plan.md`. If all pages are done, mark the
section heading with `✓`.

### Implementation approach

Use **Tailwind responsive utility classes** (max-width variants) as the primary tool. Only fall
back to raw CSS media queries in `index.css` when Tailwind utilities cannot express the rule
(e.g., hiding table columns rendered from mapped data, or switching `<tr>` display modes).

**Do not mix min-width and max-width variants.** Use `max-*:` variants consistently so styles
degrade from desktop down:
- `max-lg:` — max-width 1024px
- `max-md:` — max-width 768px
- `max-sm:` — max-width 640px

When raw CSS is needed (e.g., table column hiding via nth-child or tag selectors), use `@media
(max-width: ...)` at 1024px, 768px, and 480px. The 480px CSS breakpoint covers the gap below
Tailwind's 640px `max-sm:`.

Do not use JavaScript-based layout switching. Do not add a hamburger menu or mobile navigation
unless the app already has one — the sidebar stays fixed.

### Layout adjustments

Apply these patterns at the Tailwind breakpoints:

- **Page padding**: `p-6 max-sm:p-3` on the outermost page wrapper.
- **Multi-column grids** (detail page bodies, metadata grids): start with the desktop column
  count and collapse at each breakpoint.
  - Two-column body: `grid grid-cols-2 max-md:grid-cols-1 gap-4`
  - Four-column metadata: `grid grid-cols-4 max-md:grid-cols-2 max-sm:grid-cols-1 gap-4`
- **Section card padding**: `p-4 max-sm:p-3` or `px-5 max-sm:px-3`.
- **Form layouts** with side-by-side fields: `grid grid-cols-2 max-sm:grid-cols-1 gap-4`.
- **Typography scaling**: reduce heading sizes at `max-sm:`.
  - Page titles: `text-[24px] max-sm:text-[20px]`
  - Detail headings: `text-[18px] max-sm:text-[16px]`
- **Button text**: on narrow viewports, hide button labels and keep only icons:
  `<span className="max-sm:hidden">Label</span>`
- **Horizontal button rows** and action bars: use `flex-wrap` so they wrap naturally.
- **Modals and dialogs**: constrain with `max-sm:max-w-[calc(100%-24px)]` and ensure
  `overflow-y-auto` for tall content.

### Data density in lists and tables

Lists and tables are the most important thing to get right. On wide viewports they can show many
columns, but on narrow viewports they must progressively hide less-important columns.

- Identify which columns are essential (e.g., name, status) vs secondary (e.g., created date,
  assigned user, tags).
- **Column hiding**: Use Tailwind `max-lg:hidden` and `max-md:hidden` directly on `<th>`/`<td>`
  elements when the table is rendered with explicit column elements. When columns are generated
  from mapped data or use CSS Grid, define named classes in `index.css` with `@media` rules.
- **Card mode at narrowest viewport**: At 480px (via `@media` in `index.css`), hide the table
  header and switch rows to `display: flex; flex-wrap: wrap` so each row reads as a card with
  key fields only.
- Ensure sort/filter controls remain accessible — use `flex-wrap` on filter bars so controls
  wrap naturally on narrow viewports.

### Card-based lists

When the page uses cards instead of a table (e.g., task lists), adjust information density within
each card at breakpoints:

- At `max-lg:` hide secondary metadata (avatars, role text).
- At `max-md:` relocate metadata that was in a side column to an inline row below the title
  using `hidden max-md:flex`.
- At `max-sm:` consolidate remaining metadata into a single compact row using
  `hidden max-sm:flex`.
