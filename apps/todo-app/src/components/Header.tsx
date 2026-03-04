import { useAppSelector } from '../store/hooks'

export function Header() {
  const items = useAppSelector((state) => state.todos.items)
  const incompleteCount = items.filter((t) => !t.completed).length

  return (
    <div data-testid="header" className="flex items-center justify-between">
      <h1 data-testid="app-title" className="text-2xl font-bold text-text">
        Todo App
      </h1>
      <span data-testid="todo-count" className="text-sm text-text-secondary">
        {incompleteCount} {incompleteCount === 1 ? 'item' : 'items'} left
      </span>
    </div>
  )
}
