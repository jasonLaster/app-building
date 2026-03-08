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

Do not use JavaScript-based layout switching except for sidebar collapse (see below).

### Sidebar collapse on mobile

The sidebar is the single biggest source of mobile layout problems. On narrow viewports it can
consume 35-45% of the screen, leaving the main content area unusable. The sidebar **must**
auto-collapse on mobile:

- Add a React state (`sidebarOpen`) that defaults based on viewport width. On viewports ≤768px,
  the sidebar should default to collapsed.
- Use a `useEffect` with a `matchMedia` listener for `(max-width: 768px)` to auto-collapse
  when the viewport shrinks and auto-expand when it grows.
- When collapsed on mobile, the sidebar should be fully hidden (not just icon-only) and a
  hamburger/menu button should appear in a top bar to toggle it open as an overlay.
- When the sidebar is open on mobile, it should overlay the content (using absolute/fixed
  positioning + z-index) rather than pushing the content into a narrow column.
- Clicking a nav link on mobile should auto-close the sidebar.
- Ensure the toggle button has a minimum 44x44px touch target.

### Areas of focus

These are the most common mobile problems observed in practice. Pay special attention to each:

1. **Tables and data lists**: Tables that work at desktop width become unreadable on mobile.
   Columns get clipped or hidden behind the sidebar. Always verify tables are usable at 375px
   viewport width with the sidebar collapsed.
2. **Chart and graph labels**: Bar chart / pie chart category labels frequently overflow their
   containers on narrow viewports. Labels should wrap, rotate, or truncate with tooltips rather
   than being clipped.
3. **Dashboard stat cards**: Multi-column stat grids (e.g., 3-4 KPI cards in a row) must
   collapse to fewer columns on mobile. Verify that stat values and labels remain fully visible.
4. **Touch target sizing**: All interactive elements (buttons, links, icons) must have at least
   44x44px touch targets. Small icon-only buttons need extra padding on mobile.
5. **Content behind sidebar**: After collapsing the sidebar, verify that no content is still
   hidden or clipped on the left edge. Full-width content should use the entire viewport.
