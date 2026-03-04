import { useEffect, useState } from 'react'
import { useAppDispatch } from '../store/hooks'
import { fetchTodos } from '../store/todosSlice'
import { Header } from '../components/Header'
import { AddTodo } from '../components/AddTodo'
import { TodoList } from '../components/TodoList'
import { FilterBar } from '../components/FilterBar'
import { SortDropdown } from '../components/SortDropdown'
import { EditTodoModal } from '../components/EditTodoModal'
import type { Todo } from '../types'

export function MainTodoList() {
  const dispatch = useAppDispatch()
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  useEffect(() => {
    dispatch(fetchTodos())
  }, [dispatch])

  return (
    <div className="mx-auto min-h-screen max-w-2xl p-6 max-sm:p-3">
      <div className="flex flex-col gap-5">
        <Header />
        <AddTodo />
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <FilterBar />
          </div>
          <SortDropdown />
        </div>
        <TodoList onEditTodo={setEditingTodo} />
      </div>

      {editingTodo && (
        <EditTodoModal key={editingTodo.id} todo={editingTodo} onClose={() => setEditingTodo(null)} />
      )}
    </div>
  )
}
