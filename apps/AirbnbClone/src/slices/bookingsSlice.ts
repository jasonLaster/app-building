import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export interface Booking {
  id: string
  property_id: string
  guest_id: string
  check_in: string
  check_out: string
  num_guests: number
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  special_requests: string | null
  created_at: string
  property_title?: string
  property_city?: string
  property_country?: string
  property_image?: string | null
}

interface BookingsState {
  items: Booking[]
  loading: boolean
  error: string | null
}

const initialState: BookingsState = {
  items: [],
  loading: false,
  error: null,
}

export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (
    data: {
      property_id: string
      guest_id: string
      check_in: string
      check_out: string
      num_guests: number
      total_price: number
    },
    { rejectWithValue }
  ) => {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await response.json()
    if (!response.ok) {
      return rejectWithValue(result.error || 'Failed to create booking')
    }
    return result as Booking
  }
)

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearBookingError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false
        state.items.push(action.payload)
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearBookingError } = bookingsSlice.actions
export default bookingsSlice.reducer
