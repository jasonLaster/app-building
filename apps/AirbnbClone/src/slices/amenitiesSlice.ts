import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Amenity } from './propertiesSlice'

interface AmenitiesState {
  items: Amenity[]
  loading: boolean
}

const initialState: AmenitiesState = {
  items: [],
  loading: false,
}

export const fetchAmenities = createAsyncThunk(
  'amenities/fetchAmenities',
  async (_, { rejectWithValue }) => {
    const response = await fetch('/api/amenities')
    const data = await response.json()
    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to fetch amenities')
    }
    return data as Amenity[]
  }
)

const amenitiesSlice = createSlice({
  name: 'amenities',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAmenities.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true
        }
      })
      .addCase(fetchAmenities.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchAmenities.rejected, (state) => {
        state.loading = false
      })
  },
})

export default amenitiesSlice.reducer
