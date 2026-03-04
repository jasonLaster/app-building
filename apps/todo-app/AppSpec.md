# Todo App

A clean, modern task management application that lets users create, organize, and track their todos.

## Pages

### 1. Main Todo List Page (`/`)

The primary page of the app. Shows all todos with filtering and creation capabilities.

#### Header
- App title "Todo App" displayed at the top left
- A count of incomplete todos shown (e.g., "3 items left")

#### Add Todo
- A text input at the top with placeholder "What needs to be done?"
- Pressing Enter with non-empty text creates a new todo and clears the input
- New todos are added to the top of the list with status "active" (not completed)

#### Todo List
- Each todo item displays:
  - A checkbox on the left to toggle completion
  - The todo text in the center
  - A priority badge (Low, Medium, High) shown as a colored tag
  - A due date (if set), displayed relative to today (e.g., "Today", "Tomorrow", "Overdue")
  - A delete button (trash icon) on the right, visible on hover
- Completed todos have strikethrough text styling and reduced opacity
- Clicking the todo text opens the Edit Todo Modal
- Checking/unchecking the checkbox toggles the completed status and persists to the database
- Clicking the delete button removes the todo after a confirmation prompt

#### Filters
- Filter bar below the input with buttons: "All", "Active", "Completed"
- The currently selected filter is visually highlighted
- "All" shows all todos (default)
- "Active" shows only incomplete todos
- "Completed" shows only completed todos
- A "Clear Completed" button on the right side removes all completed todos

#### Sorting
- A dropdown to sort by: "Newest First" (default), "Oldest First", "Priority", "Due Date"

### 2. Edit Todo Modal

A modal dialog that opens when clicking a todo item's text.

#### Fields
- **Title**: Text input, pre-filled with current todo text (required)
- **Priority**: Dropdown selector with options: Low, Medium, High (default: Medium)
- **Due Date**: Date picker input (optional)
- **Notes**: Multiline textarea for additional details (optional)

#### Actions
- "Save" button: Saves changes and closes the modal
- "Cancel" button: Discards changes and closes the modal
- Clicking outside the modal also closes it (discarding changes)

## Data Model

### Todo
| Field       | Type      | Description                          |
|-------------|-----------|--------------------------------------|
| id          | UUID      | Primary key                          |
| title       | TEXT      | The todo item text (required)        |
| completed   | BOOLEAN   | Whether the todo is done             |
| priority    | TEXT      | "low", "medium", or "high"           |
| due_date    | DATE      | Optional due date                    |
| notes       | TEXT      | Optional additional notes            |
| created_at  | TIMESTAMP | When the todo was created            |
| updated_at  | TIMESTAMP | When the todo was last modified      |

## API Endpoints

### `GET /.netlify/functions/todos`
Returns all todos, sorted by `created_at` descending.

### `POST /.netlify/functions/todos`
Creates a new todo. Body: `{ title, priority?, due_date?, notes? }`

### `PUT /.netlify/functions/todos/:id`
Updates an existing todo. Body: partial todo fields.

### `DELETE /.netlify/functions/todos/:id`
Deletes a todo by ID.

### `DELETE /.netlify/functions/todos?completed=true`
Deletes all completed todos ("Clear Completed" action).
