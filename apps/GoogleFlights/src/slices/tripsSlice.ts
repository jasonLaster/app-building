import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'

export interface BookingTrip {
  id: string
  booking_reference: string
  cabin_class: string
  total_price_cents: number
  status: 'confirmed' | 'cancelled' | 'completed'
  created_at: string
  return_flight_id: string | null
  flight_number: string
  departure_time: string
  arrival_time: string
  duration_minutes: number
  airline_name: string
  airline_code: string
  logo_color: string
  origin_code: string
  origin_name: string
  origin_city: string
  dest_code: string
  dest_name: string
  dest_city: string
  return_departure_time: string | null
  return_arrival_time: string | null
}

export interface TrackedRoute {
  id: string
  departure_date_start: string | null
  departure_date_end: string | null
  cabin_class: string
  created_at: string
  origin_code: string
  origin_city: string
  dest_code: string
  dest_city: string
  lowest_price_cents: number | null
}

export type TripsTab = 'upcoming' | 'past' | 'tracked'

interface TripsState {
  bookings: BookingTrip[]
  trackedRoutes: TrackedRoute[]
  loading: boolean
  trackedLoading: boolean
  error: string | null
  activeTab: TripsTab
  cancellingBookingId: string | null
  cancelError: string | null
  untrackingRouteId: string | null
}

const initialState: TripsState = {
  bookings: [],
  trackedRoutes: [],
  loading: false,
  trackedLoading: false,
  error: null,
  activeTab: 'upcoming',
  cancellingBookingId: null,
  cancelError: null,
  untrackingRouteId: null,
}

export const fetchMyBookings = createAsyncThunk(
  'trips/fetchMyBookings',
  async (sessionToken: string) => {
    const res = await fetch(`/api/my-bookings?session=${encodeURIComponent(sessionToken)}`)
    if (!res.ok) throw new Error('Failed to fetch bookings')
    return res.json() as Promise<BookingTrip[]>
  }
)

export const fetchTrackedRoutes = createAsyncThunk(
  'trips/fetchTrackedRoutes',
  async (sessionToken: string) => {
    const res = await fetch(`/api/tracked-routes?session=${encodeURIComponent(sessionToken)}`)
    if (!res.ok) throw new Error('Failed to fetch tracked routes')
    return res.json() as Promise<TrackedRoute[]>
  }
)

export const cancelBooking = createAsyncThunk(
  'trips/cancelBooking',
  async (params: { bookingId: string; sessionToken: string }) => {
    const res = await fetch('/api/my-bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: params.bookingId,
        sessionToken: params.sessionToken,
        status: 'cancelled',
      }),
    })
    if (!res.ok) throw new Error('Failed to cancel booking')
    return params.bookingId
  }
)

export const untrackRoute = createAsyncThunk(
  'trips/untrackRoute',
  async (params: { routeId: string; sessionToken: string }) => {
    const res = await fetch('/api/tracked-routes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionToken: params.sessionToken,
        id: params.routeId,
      }),
    })
    if (!res.ok) throw new Error('Failed to untrack route')
    return params.routeId
  }
)

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<TripsTab>) {
      state.activeTab = action.payload
    },
    clearCancelError(state) {
      state.cancelError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyBookings.pending, (state) => {
        if (state.bookings.length === 0) {
          state.loading = true
        }
        state.error = null
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.bookings = action.payload
        state.loading = false
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to load bookings'
      })
      .addCase(fetchTrackedRoutes.pending, (state) => {
        if (state.trackedRoutes.length === 0) {
          state.trackedLoading = true
        }
      })
      .addCase(fetchTrackedRoutes.fulfilled, (state, action) => {
        state.trackedRoutes = action.payload
        state.trackedLoading = false
      })
      .addCase(fetchTrackedRoutes.rejected, (state) => {
        state.trackedLoading = false
      })
      .addCase(cancelBooking.pending, (state, action) => {
        state.cancellingBookingId = action.meta.arg.bookingId
        state.cancelError = null
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.cancellingBookingId = null
        const booking = state.bookings.find(b => b.id === action.payload)
        if (booking) {
          booking.status = 'cancelled'
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.cancellingBookingId = null
        state.cancelError = action.error.message || 'Failed to cancel booking. Please try again.'
      })
      .addCase(untrackRoute.pending, (state, action) => {
        state.untrackingRouteId = action.meta.arg.routeId
      })
      .addCase(untrackRoute.fulfilled, (state, action) => {
        state.untrackingRouteId = null
        state.trackedRoutes = state.trackedRoutes.filter(r => r.id !== action.payload)
      })
      .addCase(untrackRoute.rejected, (state) => {
        state.untrackingRouteId = null
      })
  },
})

export const { setActiveTab, clearCancelError } = tripsSlice.actions
export default tripsSlice.reducer
