import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export interface User {
  id: string
  email: string
  name: string
  avatar_url: string | null
  bio: string | null
  phone: string | null
  is_host: boolean
  created_at: string
}

interface AuthState {
  currentUser: User | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  currentUser: null,
  loading: false,
  error: null,
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (email: string, { rejectWithValue }) => {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await response.json()
    if (!response.ok) {
      return rejectWithValue(data.error || 'Login failed')
    }
    return data as User
  }
)

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ name, email }: { name: string; email: string }, { rejectWithValue }) => {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    })
    const data = await response.json()
    if (!response.ok) {
      return rejectWithValue(data.error || 'Registration failed')
    }
    return data as User
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.currentUser = null
      state.error = null
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.currentUser = action.payload
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.currentUser = action.payload
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
