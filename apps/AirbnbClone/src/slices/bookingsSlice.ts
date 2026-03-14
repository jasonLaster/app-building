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
  has_review?: boolean
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

export const fetchUserBookings = createAsyncThunk(
  'bookings/fetchUserBookings',
  async (guestId: string, { rejectWithValue }) => {
    const response = await fetch(`/api/bookings?guest_id=${encodeURIComponent(guestId)}`)
    const result = await response.json()
    if (!response.ok) {
      return rejectWithValue(result.error || 'Failed to fetch bookings')
    }
    return result as Booking[]
  }
)

export const cancelBooking = createAsyncThunk(
  'bookings/cancelBooking',
  async (bookingId: string, { rejectWithValue }) => {
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    })
    const result = await response.json()
    if (!response.ok) {
      return rejectWithValue(result.error || 'Failed to cancel booking')
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
      .addCase(fetchUserBookings.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true
        }
        state.error = null
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const index = state.items.findIndex((b) => b.id === action.payload.id)
        if (index !== -1) {
          const existing = state.items[index]
          if (existing) {
            state.items[index] = { ...existing, ...action.payload }
          }
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { clearBookingError } = bookingsSlice.actions
export default bookingsSlice.reducer
