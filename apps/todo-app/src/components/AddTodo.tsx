import { useState } from 'react'
import { useAppDispatch } from '../store/hooks'
import { addTodo } from '../store/todosSlice'

export function AddTodo() {
  const [text, setText] = useState('')
  const dispatch = useAppDispatch()

  const handleSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    const trimmed = text.trim()
    if (!trimmed) return
    dispatch(addTodo(trimmed))
    setText('')
  }

  return (
    <div data-testid="add-todo">
      <input
        data-testid="add-todo-input"
        type="text"
        placeholder="What needs to be done?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleSubmit}
        className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-text placeholder:text-text-muted outline-none transition-colors focus:border-border-focus focus:ring-2 focus:ring-primary/20"
      />
    </div>
  )
}
