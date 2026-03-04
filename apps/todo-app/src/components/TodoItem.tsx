import { Check, Trash2 } from 'lucide-react'
import { useAppDispatch } from '../store/hooks'
import { toggleTodo, deleteTodo } from '../store/todosSlice'
import type { Todo } from '../types'

interface TodoItemProps {
  todo: Todo
  onEdit: (todo: Todo) => void
}

function formatDueDate(dueDateStr: string | null): { label: string; className: string } | null {
  if (!dueDateStr) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueDate = new Date(dueDateStr + 'T00:00:00')
  dueDate.setHours(0, 0, 0, 0)

  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { label: 'Overdue', className: 'text-overdue font-medium' }
  if (diffDays === 0) return { label: 'Today', className: 'text-today font-medium' }
  if (diffDays === 1) return { label: 'Tomorrow', className: 'text-tomorrow font-medium' }
  return { label: dueDate.toLocaleDateString(), className: 'text-text-secondary' }
}

function priorityStyles(priority: string) {
  switch (priority) {
    case 'high':
      return 'bg-priority-high-bg text-priority-high'
    case 'medium':
      return 'bg-priority-medium-bg text-priority-medium'
    case 'low':
      return 'bg-priority-low-bg text-priority-low'
    default:
      return 'bg-priority-medium-bg text-priority-medium'
  }
}

export function TodoItem({ todo, onEdit }: TodoItemProps) {
  const dispatch = useAppDispatch()
  const dueInfo = formatDueDate(todo.due_date)

  const handleToggle = () => {
    dispatch(toggleTodo({ id: todo.id, completed: !todo.completed }))
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      dispatch(deleteTodo(todo.id))
    }
  }

  return (
    <div
      data-testid="todo-item"
      className={`group flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:bg-surface-hover ${
        todo.completed ? 'opacity-60' : ''
      }`}
    >
      <button
        data-testid="todo-checkbox"
        onClick={handleToggle}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
          todo.completed
            ? 'border-primary bg-primary text-white'
            : 'border-border hover:border-primary'
        }`}
        aria-label={todo.completed ? 'Mark as active' : 'Mark as complete'}
      >
        {todo.completed && <Check size={12} strokeWidth={3} />}
      </button>

      <button
        data-testid="todo-text"
        onClick={() => onEdit(todo)}
        className={`min-w-0 flex-1 cursor-pointer text-left text-base transition-colors hover:text-primary ${
          todo.completed ? 'line-through text-text-muted' : 'text-text'
        }`}
      >
        {todo.title}
      </button>

      <span
        data-testid="priority-badge"
        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityStyles(todo.priority)}`}
      >
        {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
      </span>

      {dueInfo && (
        <span data-testid="due-date" className={`shrink-0 text-xs ${dueInfo.className}`}>
          {dueInfo.label}
        </span>
      )}

      <button
        data-testid="delete-button"
        onClick={handleDelete}
        className="shrink-0 rounded p-1 text-text-muted opacity-0 transition-all hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
        aria-label="Delete todo"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}
