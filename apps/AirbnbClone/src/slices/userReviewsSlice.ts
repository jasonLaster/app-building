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

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

interface UserReviewsState {
  items: UserReview[]
  total: number
  page: number
  loading: boolean
  loadingMore: boolean
  error: string | null
}

const initialState: UserReviewsState = {
  items: [],
  total: 0,
  page: 0,
  loading: false,
  loadingMore: false,
  error: null,
}

export const fetchUserReviews = createAsyncThunk(
  'userReviews/fetchUserReviews',
  async ({ guestId, page = 1 }: { guestId: string; page?: number }, { rejectWithValue }) => {
    const response = await fetch(`/api/reviews?guest_id=${guestId}&page=${page}&pageSize=20`)
    const data = await response.json()
    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to fetch reviews')
    }
    return data as PaginatedResponse<UserReview>
  }
)

const userReviewsSlice = createSlice({
  name: 'userReviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserReviews.pending, (state, action) => {
        if (action.meta.arg.page === 1 || !action.meta.arg.page) {
          if (state.items.length === 0) {
            state.loading = true
          }
        } else {
          state.loadingMore = true
        }
        state.error = null
      })
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.loading = false
        state.loadingMore = false
        if (action.payload.page === 1) {
          state.items = action.payload.items
        } else {
          state.items = [...state.items, ...action.payload.items]
        }
        state.total = action.payload.total
        state.page = action.payload.page
      })
      .addCase(fetchUserReviews.rejected, (state, action) => {
        state.loading = false
        state.loadingMore = false
        state.error = action.payload as string
      })
  },
})

export default userReviewsSlice.reducer
