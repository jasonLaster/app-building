import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  created_at: string;
}

interface TodosState {
  items: Todo[];
  loading: boolean;
  error: string | null;
}

const initialState: TodosState = {
  items: [],
  loading: false,
  error: null,
};

const API_BASE = '/.netlify/functions/todos';

export const fetchTodos = createAsyncThunk('todos/fetchTodos', async () => {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Failed to fetch todos');
  return (await res.json()) as Todo[];
});

export const addTodo = createAsyncThunk('todos/addTodo', async (text: string) => {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error('Failed to add todo');
  return (await res.json()) as Todo;
});

export const toggleTodo = createAsyncThunk(
  'todos/toggleTodo',
  async ({ id, completed }: { id: string; completed: boolean }) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    if (!res.ok) throw new Error('Failed to toggle todo');
    return (await res.json()) as Todo;
  }
);

export const deleteTodo = createAsyncThunk('todos/deleteTodo', async (id: string) => {
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete todo');
  return id;
});

export const clearCompleted = createAsyncThunk('todos/clearCompleted', async () => {
  const res = await fetch(`${API_BASE}/completed`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to clear completed');
});

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch';
      })
      .addCase(addTodo.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(toggleTodo.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteTodo.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      })
      .addCase(clearCompleted.fulfilled, (state) => {
        state.items = state.items.filter((t) => !t.completed);
      });
  },
});

export default todosSlice.reducer;
