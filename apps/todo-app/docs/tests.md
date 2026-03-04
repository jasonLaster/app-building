# Test Specification — Todo App

## Page: Main Todo List Page (`/`)

### Header

#### Test: Header displays app title
- **Component**: Header
- **Initial state**: Page loads with any number of todos in the database.
- **Action**: None (observe on load).
- **Expected**: The text "Todo App" is displayed at the top left of the page as the app title.

#### Test: Header shows count of incomplete todos when some are active
- **Component**: Header
- **Initial state**: Database has 5 todos total: 2 completed, 3 active (not completed).
- **Action**: None (observe on load).
- **Expected**: The header displays "3 items left".

#### Test: Header shows zero count when all todos are completed
- **Component**: Header
- **Initial state**: Database has 3 todos, all with `completed: true`.
- **Action**: None (observe on load).
- **Expected**: The header displays "0 items left".

#### Test: Header shows correct count with singular item
- **Component**: Header
- **Initial state**: Database has 2 todos: 1 completed, 1 active.
- **Action**: None (observe on load).
- **Expected**: The header displays "1 item left" (singular form).

#### Test: Header count updates when a todo is toggled complete
- **Component**: Header, TodoList
- **Initial state**: Database has 3 active todos. Header displays "3 items left".
- **Action**: Click the checkbox on one of the active todos to mark it complete.
- **Expected**: The header updates to display "2 items left" without a page refresh.

#### Test: Header count updates when a todo is toggled back to active
- **Component**: Header, TodoList
- **Initial state**: Database has 2 active todos and 1 completed todo. Header displays "2 items left".
- **Action**: Click the checkbox on the completed todo to mark it active.
- **Expected**: The header updates to display "3 items left".

#### Test: Header count updates when a new todo is added
- **Component**: Header, AddTodo
- **Initial state**: Database has 2 active todos. Header displays "2 items left".
- **Action**: Type "New task" in the add todo input and press Enter.
- **Expected**: The header updates to display "3 items left".

#### Test: Header count updates when a todo is deleted
- **Component**: Header, TodoList
- **Initial state**: Database has 3 active todos. Header displays "3 items left".
- **Action**: Hover over a todo and click the delete (trash icon) button, then confirm deletion.
- **Expected**: The header updates to display "2 items left".

### AddTodo

#### Test: Add todo input displays placeholder text
- **Component**: AddTodo
- **Initial state**: Page loads.
- **Action**: None (observe on load).
- **Expected**: A text input is visible at the top of the page with the placeholder text "What needs to be done?".

#### Test: Create a new todo by pressing Enter
- **Component**: AddTodo, TodoList, Header
- **Initial state**: Page loads with 1 existing active todo. Input field is empty.
- **Action**: Click on the input, type "Buy groceries", and press Enter.
- **Expected**: A new todo with text "Buy groceries" appears at the top of the todo list. The input field is cleared. The todo has status active (not completed), default priority "Medium", and no due date. The header count increments by 1. The todo is persisted to the database via POST to `/.netlify/functions/todos`.

#### Test: Pressing Enter with empty input does not create a todo
- **Component**: AddTodo
- **Initial state**: Page loads with 2 existing todos. Input field is empty.
- **Action**: Click on the input (it's empty) and press Enter.
- **Expected**: No new todo is created. The todo list and header count remain unchanged.

#### Test: Pressing Enter with whitespace-only input does not create a todo
- **Component**: AddTodo
- **Initial state**: Page loads. Input field is empty.
- **Action**: Type "   " (only spaces) in the input and press Enter.
- **Expected**: No new todo is created. The input may be cleared but no API call is made and no new todo appears in the list.

#### Test: Input clears after successfully creating a todo
- **Component**: AddTodo
- **Initial state**: Page loads. Input field is empty.
- **Action**: Type "Walk the dog" and press Enter.
- **Expected**: The input field is empty after the todo is created, ready for the next entry.

#### Test: New todo appears at the top of the list
- **Component**: AddTodo, TodoList
- **Initial state**: Database has todos "Old task 1" and "Old task 2".
- **Action**: Type "New task" in the input and press Enter.
- **Expected**: "New task" appears as the first item in the todo list, above "Old task 1" and "Old task 2".

### TodoList

#### Test: Todo item displays checkbox, text, priority badge, due date, and delete button
- **Component**: TodoList
- **Initial state**: Database has a todo with title "Review PR", priority "high", and due_date set to today's date.
- **Action**: None (observe on load).
- **Expected**: The todo item displays: a checkbox on the left (unchecked), the text "Review PR" in the center, a priority badge showing "High" as a colored tag, a due date showing "Today", and a delete button (trash icon) on the right that is visible on hover.

#### Test: Priority badge displays correct colors for each level
- **Component**: TodoList
- **Initial state**: Database has three todos with priorities "low", "medium", and "high" respectively.
- **Action**: None (observe on load).
- **Expected**: Each todo displays a colored priority badge: "Low" with its distinct color, "Medium" with its distinct color, and "High" with its distinct color. The badges are visually distinguishable from each other.

#### Test: Due date shows "Today" for todos due today
- **Component**: TodoList
- **Initial state**: Database has a todo with due_date set to today's date.
- **Action**: None (observe on load).
- **Expected**: The due date displays as "Today".

#### Test: Due date shows "Tomorrow" for todos due tomorrow
- **Component**: TodoList
- **Initial state**: Database has a todo with due_date set to tomorrow's date.
- **Action**: None (observe on load).
- **Expected**: The due date displays as "Tomorrow".

#### Test: Due date shows "Overdue" for todos past their due date
- **Component**: TodoList
- **Initial state**: Database has a todo with due_date set to yesterday's date and completed is false.
- **Action**: None (observe on load).
- **Expected**: The due date displays as "Overdue" with visual indication (e.g., red text or warning styling).

#### Test: Todo with no due date does not show a date label
- **Component**: TodoList
- **Initial state**: Database has a todo with due_date set to null.
- **Action**: None (observe on load).
- **Expected**: No due date label is shown for this todo item.

#### Test: Toggle todo completion via checkbox
- **Component**: TodoList, Header
- **Initial state**: Database has an active (not completed) todo "Buy milk".
- **Action**: Click the checkbox next to "Buy milk".
- **Expected**: The checkbox becomes checked. The todo text "Buy milk" gets strikethrough styling and reduced opacity. The change is persisted to the database via PUT to `/.netlify/functions/todos/:id` with `completed: true`. The header's incomplete count decreases by 1.

#### Test: Uncheck a completed todo to mark it active again
- **Component**: TodoList, Header
- **Initial state**: Database has a completed todo "Buy milk" (strikethrough, reduced opacity, checked).
- **Action**: Click the checkbox next to "Buy milk".
- **Expected**: The checkbox becomes unchecked. The strikethrough and reduced opacity are removed. The change is persisted to the database with `completed: false`. The header's incomplete count increases by 1.

#### Test: Completed todo has strikethrough text and reduced opacity
- **Component**: TodoList
- **Initial state**: Database has a todo with `completed: true`.
- **Action**: None (observe on load).
- **Expected**: The completed todo's text has strikethrough styling and the todo item has reduced opacity compared to active todos.

#### Test: Delete button appears on hover
- **Component**: TodoList
- **Initial state**: Database has a todo "Clean house".
- **Action**: Hover over the todo item "Clean house".
- **Expected**: A delete button with a trash icon appears on the right side of the todo item.

#### Test: Delete a todo with confirmation
- **Component**: TodoList, Header
- **Initial state**: Database has 3 active todos including "Clean house".
- **Action**: Hover over "Clean house", click the delete (trash icon) button.
- **Expected**: A confirmation prompt appears asking the user to confirm deletion. After confirming, the todo "Clean house" is removed from the list. The deletion is persisted via DELETE to `/.netlify/functions/todos/:id`. The header count decreases by 1.

#### Test: Cancel todo deletion via confirmation prompt
- **Component**: TodoList
- **Initial state**: Database has 3 active todos including "Clean house".
- **Action**: Hover over "Clean house", click the delete button, then cancel/dismiss the confirmation prompt.
- **Expected**: The todo "Clean house" remains in the list. No API call is made.

#### Test: Clicking todo text opens the Edit Todo Modal
- **Component**: TodoList, EditTodoModal
- **Initial state**: Database has a todo "Write report" with priority "high", due_date set to tomorrow, and notes "Include Q4 data".
- **Action**: Click on the text "Write report".
- **Expected**: The Edit Todo Modal opens with fields pre-filled: Title is "Write report", Priority is "High", Due Date is tomorrow's date, Notes is "Include Q4 data".

#### Test: Empty state when no todos exist
- **Component**: TodoList
- **Initial state**: Database has no todos.
- **Action**: None (observe on load).
- **Expected**: The todo list area is empty or displays a helpful message indicating no todos exist.

### FilterBar

#### Test: Filter bar displays All, Active, and Completed buttons
- **Component**: FilterBar
- **Initial state**: Page loads.
- **Action**: None (observe on load).
- **Expected**: A filter bar is visible below the add todo input with three buttons labeled "All", "Active", and "Completed". The "All" button is visually highlighted as the selected/active filter by default.

#### Test: "All" filter shows all todos
- **Component**: FilterBar, TodoList
- **Initial state**: Database has 3 active todos and 2 completed todos (5 total). "All" filter is selected.
- **Action**: None (observe on load) or click the "All" button.
- **Expected**: All 5 todos are visible in the list — both active and completed todos.

#### Test: "Active" filter shows only incomplete todos
- **Component**: FilterBar, TodoList
- **Initial state**: Database has 3 active todos and 2 completed todos. "All" filter is currently selected and all 5 todos are visible.
- **Action**: Click the "Active" filter button.
- **Expected**: Only the 3 active (not completed) todos are shown. The 2 completed todos are hidden. The "Active" button is now visually highlighted as the selected filter.

#### Test: "Completed" filter shows only completed todos
- **Component**: FilterBar, TodoList
- **Initial state**: Database has 3 active todos and 2 completed todos. "All" filter is currently selected.
- **Action**: Click the "Completed" filter button.
- **Expected**: Only the 2 completed todos are shown. The 3 active todos are hidden. The "Completed" button is now visually highlighted as the selected filter.

#### Test: Selected filter button is visually highlighted
- **Component**: FilterBar
- **Initial state**: Page loads with "All" filter active.
- **Action**: Click "Active" button, then click "Completed" button, then click "All" button.
- **Expected**: At each step, only the currently selected filter button has the highlighted/active visual style. The previously selected button reverts to its default style.

#### Test: Switching from Active filter back to All shows all todos again
- **Component**: FilterBar, TodoList
- **Initial state**: "Active" filter is selected, showing only active todos.
- **Action**: Click the "All" filter button.
- **Expected**: All todos (both active and completed) are visible again. The "All" button is highlighted.

#### Test: Clear Completed button removes all completed todos
- **Component**: FilterBar, TodoList, Header
- **Initial state**: Database has 3 active todos and 2 completed todos. "All" filter is selected, showing 5 todos.
- **Action**: Click the "Clear Completed" button on the right side of the filter bar.
- **Expected**: The 2 completed todos are removed from the list. Only the 3 active todos remain. The deletion is persisted via DELETE to `/.netlify/functions/todos?completed=true`. The header count remains unchanged (since only completed todos were removed).

#### Test: Clear Completed button is visible in the filter bar
- **Component**: FilterBar
- **Initial state**: Page loads with some completed todos.
- **Action**: None (observe on load).
- **Expected**: A "Clear Completed" button is visible on the right side of the filter bar.

#### Test: Filter persists when a todo is toggled
- **Component**: FilterBar, TodoList
- **Initial state**: "Active" filter is selected. 3 active todos are visible.
- **Action**: Click the checkbox on one of the active todos to mark it complete.
- **Expected**: The toggled todo disappears from the visible list (since it's now completed and the Active filter hides completed todos). 2 active todos remain visible.

#### Test: Completing a todo while Completed filter is active shows it in the list
- **Component**: FilterBar, TodoList
- **Initial state**: "All" filter is selected. Switch to "Completed" filter showing 1 completed todo.
- **Action**: Switch to "All" filter, check an active todo to complete it, then switch back to "Completed" filter.
- **Expected**: The "Completed" filter now shows 2 completed todos, including the newly completed one.

### SortDropdown

#### Test: Sort dropdown displays with default "Newest First" selected
- **Component**: SortDropdown
- **Initial state**: Page loads.
- **Action**: None (observe on load).
- **Expected**: A sort dropdown is visible with "Newest First" as the currently selected option.

#### Test: Sort dropdown shows all four sort options
- **Component**: SortDropdown
- **Initial state**: Page loads.
- **Action**: Click/open the sort dropdown.
- **Expected**: The dropdown displays four options: "Newest First", "Oldest First", "Priority", and "Due Date".

#### Test: Sort by "Newest First" orders todos by creation date descending
- **Component**: SortDropdown, TodoList
- **Initial state**: Database has 3 todos created at different times: "Task A" (oldest), "Task B" (middle), "Task C" (newest).
- **Action**: Select "Newest First" from the sort dropdown (or verify default).
- **Expected**: Todos appear in order: "Task C", "Task B", "Task A" (newest at top).

#### Test: Sort by "Oldest First" orders todos by creation date ascending
- **Component**: SortDropdown, TodoList
- **Initial state**: Database has 3 todos: "Task A" (oldest), "Task B" (middle), "Task C" (newest). Sort is set to "Newest First".
- **Action**: Select "Oldest First" from the sort dropdown.
- **Expected**: Todos reorder to: "Task A", "Task B", "Task C" (oldest at top).

#### Test: Sort by "Priority" orders todos by priority level
- **Component**: SortDropdown, TodoList
- **Initial state**: Database has 3 todos: "Low task" (priority: low), "High task" (priority: high), "Medium task" (priority: medium).
- **Action**: Select "Priority" from the sort dropdown.
- **Expected**: Todos reorder to: "High task", "Medium task", "Low task" (highest priority first).

#### Test: Sort by "Due Date" orders todos by due date
- **Component**: SortDropdown, TodoList
- **Initial state**: Database has 3 todos: "Task A" (due tomorrow), "Task B" (due today), "Task C" (no due date).
- **Action**: Select "Due Date" from the sort dropdown.
- **Expected**: Todos reorder to: "Task B" (today/soonest), "Task A" (tomorrow), "Task C" (no due date, last).

#### Test: Sorting works in combination with active filter
- **Component**: SortDropdown, FilterBar, TodoList
- **Initial state**: Database has 4 todos: 2 active (priorities high and low) and 2 completed. "Active" filter is selected.
- **Action**: Select "Priority" from the sort dropdown.
- **Expected**: Only the 2 active todos are shown, ordered by priority (high first, then low). Completed todos remain hidden.

#### Test: Sort selection persists when adding a new todo
- **Component**: SortDropdown, AddTodo, TodoList
- **Initial state**: Sort is set to "Priority". Database has a "Low task" (low priority) and "High task" (high priority), displayed as "High task" then "Low task".
- **Action**: Type "New task" in the input and press Enter (new todos default to medium priority).
- **Expected**: The new todo is inserted in the correct position based on the active sort. The sort order is maintained: "High task", "New task" (medium), "Low task".

---

## Page: Edit Todo Modal

### EditTodoModal

<!-- Tests for EditTodoModal component will be added by PlanComponentEditTodoModal -->
