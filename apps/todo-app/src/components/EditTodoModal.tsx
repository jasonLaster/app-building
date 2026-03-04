import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useAppDispatch } from '../store/hooks'
import { updateTodo } from '../store/todosSlice'
import type { Todo } from '../types'

interface EditTodoModalProps {
  todo: Todo
  onClose: () => void
}

export function EditTodoModal({ todo, onClose }: EditTodoModalProps) {
  const [title, setTitle] = useState(todo.title)
  const [priority, setPriority] = useState(todo.priority)
  const [dueDate, setDueDate] = useState(todo.due_date ? todo.due_date.split('T')[0] : '')
  const [notes, setNotes] = useState(todo.notes ?? '')
  const [titleError, setTitleError] = useState('')
  const [priorityOpen, setPriorityOpen] = useState(false)
  const dispatch = useAppDispatch()
  const backdropRef = useRef<HTMLDivElement>(null)
  const priorityRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (priorityRef.current && !priorityRef.current.contains(e.target as Node)) {
        setPriorityOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) {
      onClose()
    }
  }

  const handleSave = async () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setTitleError('Title is required')
      return
    }
    setTitleError('')

    await dispatch(
      updateTodo({
        id: todo.id,
        updates: {
          title: trimmedTitle,
          priority,
          due_date: dueDate || null,
          notes: notes || null,
        },
      })
    )
    onClose()
  }

  const priorityLabels: Record<string, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  }

  return (
    <div
      data-testid="edit-modal-backdrop"
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-modal-backdrop"
    >
      <div
        data-testid="edit-modal"
        className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Edit Todo</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="edit-title" className="mb-1 block text-sm font-medium text-text-secondary">
              Title *
            </label>
            <input
              id="edit-title"
              data-testid="edit-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (titleError) setTitleError('')
              }}
              className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors focus:ring-2 focus:ring-primary/20 ${
                titleError ? 'border-danger' : 'border-border focus:border-border-focus'
              }`}
            />
            {titleError && (
              <p data-testid="title-error" className="mt-1 text-xs text-danger">
                {titleError}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">Priority</label>
            <div className="relative" ref={priorityRef}>
              <button
                data-testid="edit-priority"
                type="button"
                onClick={() => setPriorityOpen(!priorityOpen)}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm text-text transition-colors hover:bg-surface-hover"
              >
                {priorityLabels[priority]}
                <ChevronIcon open={priorityOpen} />
              </button>
              {priorityOpen && (
                <div
                  data-testid="priority-dropdown-menu"
                  className="absolute left-0 top-full z-10 mt-1 w-full rounded-lg border border-border bg-surface py-1 shadow-lg"
                >
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      data-testid={`priority-option-${p}`}
                      onClick={() => {
                        setPriority(p)
                        setPriorityOpen(false)
                      }}
                      className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-surface-hover ${
                        priority === p ? 'font-medium text-primary' : 'text-text'
                      }`}
                    >
                      {priorityLabels[p]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="edit-due-date" className="mb-1 block text-sm font-medium text-text-secondary">
              Due Date
            </label>
            <input
              id="edit-due-date"
              data-testid="edit-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors focus:border-border-focus focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label htmlFor="edit-notes" className="mb-1 block text-sm font-medium text-text-secondary">
              Notes
            </label>
            <textarea
              id="edit-notes"
              data-testid="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors focus:border-border-focus focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            data-testid="edit-cancel"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-hover"
          >
            Cancel
          </button>
          <button
            data-testid="edit-save"
            onClick={handleSave}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform ${open ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
