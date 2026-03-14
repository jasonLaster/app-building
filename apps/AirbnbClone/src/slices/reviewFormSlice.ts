import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export interface BookingDetail {
  id: string
  property_id: string
  guest_id: string
  check_in: string
  check_out: string
  num_guests: number
  total_price: number
  status: string
  property_title: string
  property_city: string
  property_country: string
  property_image: string | null
  has_review: boolean
}

interface ReviewFormState {
  booking: BookingDetail | null
  loading: boolean
  error: string | null
  submitting: boolean
  submitSuccess: boolean
}

const initialState: ReviewFormState = {
  booking: null,
  loading: false,
  error: null,
  submitting: false,
  submitSuccess: false,
}

export const fetchBookingForReview = createAsyncThunk(
  'reviewForm/fetchBookingForReview',
  async ({ bookingId, guestId }: { bookingId: string; guestId: string }, { rejectWithValue }) => {
    const response = await fetch(`/api/bookings?guest_id=${encodeURIComponent(guestId)}`)
    const data = await response.json()
    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to fetch bookings')
    }
    const bookings = data as BookingDetail[]
    const booking = bookings.find((b) => b.id === bookingId)
    if (!booking) {
      return rejectWithValue('Booking not found')
    }
    if (booking.guest_id !== guestId) {
      return rejectWithValue('You cannot review this booking')
    }
    if (booking.status !== 'completed') {
      return rejectWithValue('You can only review completed bookings')
    }
    if (booking.has_review) {
      return rejectWithValue('You have already reviewed this booking')
    }
    return booking
  }
)

export const submitReview = createAsyncThunk(
  'reviewForm/submitReview',
  async (
    data: {
      booking_id: string
      property_id: string
      guest_id: string
      rating: number
      cleanliness: number
      accuracy: number
      communication: number
      location: number
      value: number
      comment?: string
    },
    { rejectWithValue }
  ) => {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await response.json()
    if (!response.ok) {
      return rejectWithValue(result.error || 'Failed to submit review')
    }
    return result
  }
)

const reviewFormSlice = createSlice({
  name: 'reviewForm',
  initialState,
  reducers: {
    resetReviewForm(state) {
      state.booking = null
      state.loading = false
      state.error = null
      state.submitting = false
      state.submitSuccess = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookingForReview.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBookingForReview.fulfilled, (state, action) => {
        state.loading = false
        state.booking = action.payload
      })
      .addCase(fetchBookingForReview.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(submitReview.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(submitReview.fulfilled, (state) => {
        state.submitting = false
        state.submitSuccess = true
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload as string
      })
  },
})

export const { resetReviewForm } = reviewFormSlice.actions
export default reviewFormSlice.reducer
