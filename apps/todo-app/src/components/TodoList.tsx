import { useAppSelector } from '../store/hooks'
import { TodoItem } from './TodoItem'
import type { Todo, FilterType, SortType } from '../types'

interface TodoListProps {
  onEditTodo: (todo: Todo) => void
}

function filterTodos(todos: Todo[], filter: FilterType): Todo[] {
  switch (filter) {
    case 'active':
      return todos.filter((t) => !t.completed)
    case 'completed':
      return todos.filter((t) => t.completed)
    default:
      return todos
  }
}

function sortTodos(todos: Todo[], sort: SortType): Todo[] {
  const sorted = [...todos]
  switch (sort) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    case 'priority': {
      const order: Record<string, number> = { high: 0, medium: 1, low: 2 }
      return sorted.sort((a, b) => (order[a.priority] ?? 1) - (order[b.priority] ?? 1))
    }
    case 'due_date':
      return sorted.sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      })
    default:
      return sorted
  }
}

export function TodoList({ onEditTodo }: TodoListProps) {
  const items = useAppSelector((state) => state.todos.items)
  const filter = useAppSelector((state) => state.todos.filter)
  const sort = useAppSelector((state) => state.todos.sort)
  const loading = useAppSelector((state) => state.todos.loading)

  if (loading) {
    return (
      <div data-testid="todo-list" className="flex items-center justify-center py-12 text-text-muted">
        Loading...
      </div>
    )
  }

  const filtered = filterTodos(items, filter)
  const sorted = sortTodos(filtered, sort)

  if (sorted.length === 0) {
    return (
      <div data-testid="todo-list" className="flex items-center justify-center py-12 text-text-muted">
        {items.length === 0 ? 'No todos yet. Add one above!' : 'No todos match the current filter.'}
      </div>
    )
  }

  return (
    <div data-testid="todo-list" className="flex flex-col gap-2">
      {sorted.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onEdit={onEditTodo} />
      ))}
    </div>
  )
}
