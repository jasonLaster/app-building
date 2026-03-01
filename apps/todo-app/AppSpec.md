# Todo App

A simple, clean todo list application that lets users create, manage, and organize their tasks.

## Pages

### Todo List (Home Page) — `/`

The main (and only) page of the application. Displays all todos and provides controls for managing them.

#### Components

**Header**
- App title: "Todo App"
- Input field to add a new todo (placeholder: "What needs to be done?")
- Button to submit the new todo

**Todo List**
- Displays all todos in a vertical list
- Each todo item shows:
  - A checkbox to toggle completion status
  - The todo text (with strikethrough styling when completed)
  - A delete button (trash icon) that appears on hover
- Empty state message when no todos exist: "No todos yet. Add one above!"

**Filters**
- Filter buttons to show: "All", "Active", "Completed"
- Active filter is visually highlighted
- Count of remaining active todos displayed (e.g., "3 items left")
- "Clear completed" button to remove all completed todos (only visible when completed todos exist)

## Data Model

### Todos Table

| Column      | Type         | Description                          |
|-------------|--------------|--------------------------------------|
| id          | UUID         | Primary key, auto-generated          |
| text        | TEXT         | The todo item text (required)        |
| completed   | BOOLEAN      | Whether the todo is done (default: false) |
| created_at  | TIMESTAMPTZ  | When the todo was created            |

## API Endpoints (Netlify Functions)

### `todos`
- **GET** `/` — List all todos, ordered by `created_at` descending
- **POST** `/` — Create a new todo. Body: `{ "text": "string" }`
- **PUT** `/:id` — Update a todo. Body: `{ "text?": "string", "completed?": boolean }`
- **DELETE** `/:id` — Delete a todo by ID
- **DELETE** `/completed` — Delete all completed todos

## Behavior

- Adding a todo: User types text in the input field and presses Enter or clicks the add button. The input clears after successful addition. Empty todos cannot be added.
- Toggling completion: Clicking the checkbox toggles the todo's completed status immediately.
- Deleting a todo: Clicking the delete button removes the todo immediately.
- Filtering: Clicking a filter button updates the displayed list. The filter is client-side only (all todos are always fetched).
- Clear completed: Removes all completed todos from the database.
- Todos persist across page reloads via the database.
