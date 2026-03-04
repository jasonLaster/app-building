import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setSort } from '../store/todosSlice'
import type { SortType } from '../types'

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'priority', label: 'Priority' },
  { value: 'due_date', label: 'Due Date' },
]

export function SortDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()
  const currentSort = useAppSelector((state) => state.todos.sort)

  const currentLabel = SORT_OPTIONS.find((o) => o.value === currentSort)?.label ?? 'Newest First'

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div data-testid="sort-dropdown" className="relative z-10" ref={ref}>
      <button
        data-testid="sort-dropdown-trigger"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover"
      >
        Sort: {currentLabel}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          data-testid="sort-dropdown-menu"
          className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-border bg-surface py-1 shadow-lg"
        >
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              data-testid={`sort-option-${option.value}`}
              onClick={() => {
                dispatch(setSort(option.value))
                setOpen(false)
              }}
              className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-surface-hover ${
                currentSort === option.value ? 'font-medium text-primary' : 'text-text'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
