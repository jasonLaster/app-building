import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

interface FavoritesState {
  propertyIds: string[]
  loading: boolean
}

const initialState: FavoritesState = {
  propertyIds: [],
  loading: false,
}

export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (userId: string, { rejectWithValue }) => {
    const response = await fetch(`/api/favorites?user_id=${userId}`)
    const data = await response.json()
    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to fetch favorites')
    }
    return (data as { property_id: string }[]).map((f) => f.property_id)
  }
)

export const addFavorite = createAsyncThunk(
  'favorites/addFavorite',
  async ({ userId, propertyId }: { userId: string; propertyId: string }, { rejectWithValue }) => {
    const response = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, property_id: propertyId }),
    })
    if (!response.ok) {
      const data = await response.json()
      return rejectWithValue(data.error || 'Failed to add favorite')
    }
    return propertyId
  }
)

export const removeFavorite = createAsyncThunk(
  'favorites/removeFavorite',
  async ({ userId, propertyId }: { userId: string; propertyId: string }, { rejectWithValue }) => {
    const response = await fetch(`/api/favorites/${propertyId}?user_id=${userId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const data = await response.json()
      return rejectWithValue(data.error || 'Failed to remove favorite')
    }
    return propertyId
  }
)

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false
        state.propertyIds = action.payload
      })
      .addCase(fetchFavorites.rejected, (state) => {
        state.loading = false
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        if (!state.propertyIds.includes(action.payload)) {
          state.propertyIds.push(action.payload)
        }
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.propertyIds = state.propertyIds.filter((id) => id !== action.payload)
      })
  },
})

export default favoritesSlice.reducer
