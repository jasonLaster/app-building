# Test Specification — Todo App

## Page: Todo List (Home Page) — `/`

The main and only page. Displays all todos with controls for adding, completing, deleting, and filtering tasks.

**Components on this page:**
- Header
- Todo List
- Filters

---

### Component: Header

#### Test: App title is displayed
- **Initial state:** Page loads at `/`.
- **Action:** None (observation).
- **Expected:** The header displays the title text "Todo App".

#### Test: Add todo input field is visible with placeholder
- **Initial state:** Page loads at `/`.
- **Action:** None (observation).
- **Expected:** An input field is visible with placeholder text "What needs to be done?".

#### Test: Submit button is visible
- **Initial state:** Page loads at `/`.
- **Action:** None (observation).
- **Expected:** A submit/add button is visible next to the input field, allowing the user to add a todo by clicking it.

#### Test: Add todo via submit button
- **Initial state:** Page loads at `/` with no todos.
- **Action:** User types "Buy groceries" into the input field and clicks the add/submit button.
- **Expected:** A new todo "Buy groceries" appears in the todo list. The input field is cleared.

#### Test: Add todo by pressing Enter
- **Initial state:** Page loads at `/` with no todos.
- **Action:** User types "Walk the dog" into the input field and presses the Enter key.
- **Expected:** A new todo "Walk the dog" appears in the todo list. The input field is cleared.

#### Test: Cannot add empty todo
- **Initial state:** Page loads at `/`. The input field is empty.
- **Action:** User clicks the add/submit button (or presses Enter) without typing any text.
- **Expected:** No todo is added to the list. The input field remains empty.

#### Test: Cannot add whitespace-only todo
- **Initial state:** Page loads at `/`. The input field is empty.
- **Action:** User types "   " (spaces only) into the input field and clicks the add/submit button.
- **Expected:** No todo is added to the list.

#### Test: Added todo persists after page reload
- **Initial state:** Page loads at `/` with no todos.
- **Action:** User types "Persistent task" and clicks the add button. Then user reloads the page.
- **Expected:** After reload, "Persistent task" still appears in the todo list.

---

### Component: Todo List

#### Test: Empty state message when no todos exist
- **Initial state:** Page loads at `/` with no todos in the database.
- **Action:** None (observation).
- **Expected:** The message "No todos yet. Add one above!" is displayed in the todo list area.

#### Test: Todos displayed in a vertical list
- **Initial state:** Page loads at `/` with three existing todos: "Task A", "Task B", "Task C".
- **Action:** None (observation).
- **Expected:** All three todos are displayed in a vertical list, ordered by creation date (newest first).

#### Test: Each todo shows checkbox, text, and delete button on hover
- **Initial state:** Page loads at `/` with one existing todo "Review code".
- **Action:** User hovers over the todo item.
- **Expected:** The todo displays a checkbox (unchecked), the text "Review code", and a delete button with a trash icon appears on hover.

#### Test: Delete button is hidden when not hovering
- **Initial state:** Page loads at `/` with one existing todo "Some task".
- **Action:** The mouse is not hovering over the todo item (observation).
- **Expected:** The delete button (trash icon) is not visible on the todo item.

#### Test: Toggle todo completion via checkbox
- **Initial state:** Page loads at `/` with one uncompleted todo "Clean house".
- **Action:** User clicks the checkbox next to "Clean house".
- **Expected:** The checkbox becomes checked. The todo text "Clean house" is displayed with strikethrough styling, indicating it is completed.

#### Test: Untoggle completed todo via checkbox
- **Initial state:** Page loads at `/` with one completed todo "Clean house" (strikethrough, checked).
- **Action:** User clicks the checkbox next to "Clean house".
- **Expected:** The checkbox becomes unchecked. The strikethrough styling is removed from "Clean house", indicating it is active again.

#### Test: Toggle completion persists after page reload
- **Initial state:** Page loads at `/` with one uncompleted todo "Finish report".
- **Action:** User clicks the checkbox to complete "Finish report", then reloads the page.
- **Expected:** After reload, "Finish report" is still shown as completed (checked, strikethrough).

#### Test: Delete a todo via delete button
- **Initial state:** Page loads at `/` with two todos: "Keep me" and "Delete me".
- **Action:** User hovers over "Delete me" and clicks the trash icon delete button.
- **Expected:** "Delete me" is removed from the list immediately. "Keep me" remains.

#### Test: Deleted todo does not reappear after page reload
- **Initial state:** Page loads at `/` with one todo "Temporary task".
- **Action:** User hovers over "Temporary task" and clicks the delete button. Then user reloads the page.
- **Expected:** After reload, "Temporary task" does not appear in the list.

#### Test: Completed todo displays strikethrough styling
- **Initial state:** Page loads at `/` with one completed todo "Done task".
- **Action:** None (observation).
- **Expected:** "Done task" is displayed with strikethrough text styling and its checkbox is checked.

#### Test: Active todo displays normal styling
- **Initial state:** Page loads at `/` with one uncompleted todo "Active task".
- **Action:** None (observation).
- **Expected:** "Active task" is displayed with normal text (no strikethrough) and its checkbox is unchecked.

---

### Component: Filters

#### Test: Filter buttons "All", "Active", "Completed" are displayed
- **Initial state:** Page loads at `/`.
- **Action:** None (observation).
- **Expected:** Three filter buttons are visible: "All", "Active", and "Completed".

#### Test: "All" filter is active by default
- **Initial state:** Page loads at `/` with a mix of completed and active todos.
- **Action:** None (observation).
- **Expected:** The "All" filter button is visually highlighted as the active filter. Both completed and active todos are shown.

#### Test: Filter by "Active" shows only uncompleted todos
- **Initial state:** Page loads at `/` with two active todos ("Task A", "Task B") and one completed todo ("Task C").
- **Action:** User clicks the "Active" filter button.
- **Expected:** Only "Task A" and "Task B" are displayed. "Task C" (completed) is hidden. The "Active" button is visually highlighted.

#### Test: Filter by "Completed" shows only completed todos
- **Initial state:** Page loads at `/` with two active todos ("Task A", "Task B") and one completed todo ("Task C").
- **Action:** User clicks the "Completed" filter button.
- **Expected:** Only "Task C" is displayed. "Task A" and "Task B" (active) are hidden. The "Completed" button is visually highlighted.

#### Test: Filter by "All" shows all todos
- **Initial state:** Page loads at `/` with active and completed todos. The "Completed" filter is currently selected.
- **Action:** User clicks the "All" filter button.
- **Expected:** All todos (both active and completed) are displayed. The "All" button is visually highlighted.

#### Test: Active filter is visually highlighted
- **Initial state:** Page loads at `/`.
- **Action:** User clicks "Active" filter, then "Completed" filter, then "All" filter.
- **Expected:** At each step, only the clicked filter button is visually highlighted (e.g., different background color or border), and the previously selected filter is no longer highlighted.

#### Test: Remaining active items count is displayed
- **Initial state:** Page loads at `/` with 3 active todos and 2 completed todos.
- **Action:** None (observation).
- **Expected:** The text "3 items left" is displayed in the filters area.

#### Test: Singular item count displays "1 item left"
- **Initial state:** Page loads at `/` with 1 active todo and 0 completed todos.
- **Action:** None (observation).
- **Expected:** The text "1 item left" (singular) is displayed, not "1 items left".

#### Test: Zero items count displays "0 items left"
- **Initial state:** Page loads at `/` with 0 active todos and 1 completed todo.
- **Action:** None (observation).
- **Expected:** The text "0 items left" is displayed.

#### Test: Active items count updates when todo is completed
- **Initial state:** Page loads at `/` with 3 active todos ("A", "B", "C") and 0 completed todos. Count shows "3 items left".
- **Action:** User clicks the checkbox on todo "A" to mark it completed.
- **Expected:** The count updates to "2 items left".

#### Test: Active items count updates when todo is added
- **Initial state:** Page loads at `/` with 2 active todos. Count shows "2 items left".
- **Action:** User adds a new todo "New task" via the header input.
- **Expected:** The count updates to "3 items left".

#### Test: Active items count updates when todo is deleted
- **Initial state:** Page loads at `/` with 3 active todos. Count shows "3 items left".
- **Action:** User deletes one active todo via its trash icon.
- **Expected:** The count updates to "2 items left".

#### Test: Completing a todo while "Active" filter is selected hides it
- **Initial state:** Page loads at `/` with 2 active todos ("Task A", "Task B"). User clicks "Active" filter.
- **Action:** User clicks the checkbox on "Task A" to mark it completed.
- **Expected:** "Task A" disappears from the filtered view (since it is now completed and the "Active" filter is selected). Only "Task B" remains visible.

#### Test: Uncompleting a todo while "Completed" filter is selected hides it
- **Initial state:** Page loads at `/` with 2 completed todos ("Task A", "Task B"). User clicks "Completed" filter.
- **Action:** User clicks the checkbox on "Task A" to mark it active.
- **Expected:** "Task A" disappears from the filtered view (since it is now active and the "Completed" filter is selected). Only "Task B" remains visible.

#### Test: "Clear completed" button visible when completed todos exist
- **Initial state:** Page loads at `/` with 1 active todo and 1 completed todo.
- **Action:** None (observation).
- **Expected:** A "Clear completed" button is visible in the filters area.

#### Test: "Clear completed" button hidden when no completed todos exist
- **Initial state:** Page loads at `/` with 2 active todos and 0 completed todos.
- **Action:** None (observation).
- **Expected:** The "Clear completed" button is not visible.

#### Test: "Clear completed" removes all completed todos
- **Initial state:** Page loads at `/` with 2 active todos ("A", "B") and 2 completed todos ("C", "D").
- **Action:** User clicks the "Clear completed" button.
- **Expected:** Completed todos "C" and "D" are removed from the list. Active todos "A" and "B" remain. The "Clear completed" button disappears (no more completed todos).

#### Test: "Clear completed" persists after page reload
- **Initial state:** Page loads at `/` with 1 active todo ("A") and 2 completed todos ("B", "C").
- **Action:** User clicks "Clear completed", then reloads the page.
- **Expected:** After reload, only "A" is in the list. "B" and "C" are gone.

#### Test: Filtering is client-side only
- **Initial state:** Page loads at `/` with active and completed todos. User switches between "All", "Active", and "Completed" filters.
- **Action:** User clicks each filter button in sequence.
- **Expected:** The list updates immediately without additional network requests to fetch todos. All todos were already loaded on page load.
