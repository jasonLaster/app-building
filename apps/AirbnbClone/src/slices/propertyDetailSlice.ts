import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Property } from './propertiesSlice'

interface PropertyDetailState {
  property: Property | null
  loading: boolean
  error: string | null
}

const initialState: PropertyDetailState = {
  property: null,
  loading: false,
  error: null,
}

export const fetchPropertyDetail = createAsyncThunk(
  'propertyDetail/fetchPropertyDetail',
  async (propertyId: string, { rejectWithValue }) => {
    const response = await fetch(`/api/properties/${propertyId}`)
    const data = await response.json()
    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to fetch property')
    }
    return data as Property
  }
)

const propertyDetailSlice = createSlice({
  name: 'propertyDetail',
  initialState,
  reducers: {
    clearPropertyDetail(state) {
      state.property = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPropertyDetail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPropertyDetail.fulfilled, (state, action) => {
        state.loading = false
        state.property = action.payload
      })
      .addCase(fetchPropertyDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearPropertyDetail } = propertyDetailSlice.actions
export default propertyDetailSlice.reducer
