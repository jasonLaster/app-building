import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setFilter, clearCompleted } from '../store/todosSlice'
import type { FilterType } from '../types'

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

export function FilterBar() {
  const dispatch = useAppDispatch()
  const currentFilter = useAppSelector((state) => state.todos.filter)
  const hasCompleted = useAppSelector((state) => state.todos.items.some((t) => t.completed))

  return (
    <div data-testid="filter-bar" className="flex items-center justify-between">
      <div className="flex gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            data-testid={`filter-${f.value}`}
            onClick={() => dispatch(setFilter(f.value))}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              currentFilter === f.value
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-surface-hover'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {hasCompleted && (
        <button
          data-testid="clear-completed"
          onClick={() => dispatch(clearCompleted())}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
        >
          Clear Completed
        </button>
      )}
    </div>
  )
}
