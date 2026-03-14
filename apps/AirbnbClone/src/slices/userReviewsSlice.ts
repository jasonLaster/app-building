import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export interface UserReview {
  id: string
  booking_id: string
  property_id: string
  guest_id: string
  rating: number
  cleanliness: number
  accuracy: number
  communication: number
  location: number
  value: number
  comment: string | null
  created_at: string
  property_title: string
}

interface UserReviewsState {
  items: UserReview[]
  loading: boolean
  error: string | null
}

const initialState: UserReviewsState = {
  items: [],
  loading: false,
  error: null,
}

export const fetchUserReviews = createAsyncThunk(
  'userReviews/fetchUserReviews',
  async (guestId: string, { rejectWithValue }) => {
    const response = await fetch(`/api/reviews?guest_id=${guestId}`)
    const data = await response.json()
    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to fetch reviews')
    }
    return data as UserReview[]
  }
)

const userReviewsSlice = createSlice({
  name: 'userReviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserReviews.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true
        }
        state.error = null
      })
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchUserReviews.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default userReviewsSlice.reducer
