import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Todo, FilterType, SortType } from '../types'

const API_BASE = '/.netlify/functions/todos'

interface TodosState {
  items: Todo[]
  loading: boolean
  error: string | null
  filter: FilterType
  sort: SortType
}

const initialState: TodosState = {
  items: [],
  loading: false,
  error: null,
  filter: 'all',
  sort: 'newest',
}

export const fetchTodos = createAsyncThunk('todos/fetchTodos', async () => {
  const res = await fetch(API_BASE)
  if (!res.ok) throw new Error('Failed to fetch todos')
  return (await res.json()) as Todo[]
})

export const addTodo = createAsyncThunk('todos/addTodo', async (title: string) => {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  if (!res.ok) throw new Error('Failed to add todo')
  return (await res.json()) as Todo
})

export const toggleTodo = createAsyncThunk(
  'todos/toggleTodo',
  async ({ id, completed }: { id: string; completed: boolean }) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    })
    if (!res.ok) throw new Error('Failed to toggle todo')
    return (await res.json()) as Todo
  }
)

export const updateTodo = createAsyncThunk(
  'todos/updateTodo',
  async ({ id, updates }: { id: string; updates: Partial<Omit<Todo, 'id' | 'created_at' | 'updated_at'>> }) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) throw new Error('Failed to update todo')
    return (await res.json()) as Todo
  }
)

export const deleteTodo = createAsyncThunk('todos/deleteTodo', async (id: string) => {
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete todo')
  return id
})

export const clearCompleted = createAsyncThunk('todos/clearCompleted', async () => {
  const res = await fetch(`${API_BASE}?completed=true`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to clear completed')
  return (await res.json()) as Todo[]
})

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    setFilter(state, action) {
      state.filter = action.payload
    },
    setSort(state, action) {
      state.sort = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true
        }
        state.error = null
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch todos'
      })
      .addCase(addTodo.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(toggleTodo.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updateTodo.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(deleteTodo.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload)
      })
      .addCase(clearCompleted.fulfilled, (state) => {
        state.items = state.items.filter((t) => !t.completed)
      })
  },
})

export const { setFilter, setSort } = todosSlice.actions
export default todosSlice.reducer
