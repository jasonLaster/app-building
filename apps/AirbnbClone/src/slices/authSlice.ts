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

function loadUserFromStorage(): User | null {
  try {
    const stored = localStorage.getItem('currentUser')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function saveUserToStorage(user: User | null) {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user))
  } else {
    localStorage.removeItem('currentUser')
  }
}

const initialState: AuthState = {
  currentUser: loadUserFromStorage(),
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

export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async (
    { id, ...fields }: { id: string; name?: string; bio?: string | null; phone?: string | null; avatar_url?: string | null },
    { rejectWithValue }
  ) => {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    })
    const data = await response.json()
    if (!response.ok) {
      return rejectWithValue(data.error || 'Update failed')
    }
    return data as User
  }
)

export const becomeHost = createAsyncThunk(
  'auth/becomeHost',
  async (userId: string, { rejectWithValue }) => {
    const response = await fetch(`/api/users/${userId}/become-host`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await response.json()
    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to become host')
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
      saveUserToStorage(null)
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
        saveUserToStorage(action.payload)
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
        saveUserToStorage(action.payload)
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.currentUser = action.payload
        saveUserToStorage(action.payload)
      })
      .addCase(becomeHost.fulfilled, (state, action) => {
        state.currentUser = action.payload
        saveUserToStorage(action.payload)
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
