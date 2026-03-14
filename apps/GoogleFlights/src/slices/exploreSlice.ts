import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { Airport } from './searchSlice'

export interface ExploreDestination {
  id: string
  iata_code: string
  city: string
  country: string
  latitude: number
  longitude: number
  lowest_price: number
  airline_name: string
}

export interface DatePrice {
  date: string
  price: number | null
}

export interface Deal {
  id: string
  destination_code: string
  destination_city: string
  destination_country: string
  departure_date: string
  return_date: string
  price: number
  average_price: number
  savings_percent: number
  gradient: string
}

export type DateRange = 'weekend' | '1week' | '2weeks'

interface ExploreState {
  origin: Airport | null
  destinations: ExploreDestination[]
  destinationsLoading: boolean
  datePrices: DatePrice[]
  datePricesLoading: boolean
  dateRange: DateRange
  deals: Deal[]
  dealsLoading: boolean
}

const initialState: ExploreState = {
  origin: null,
  destinations: [],
  destinationsLoading: false,
  datePrices: [],
  datePricesLoading: false,
  dateRange: 'weekend',
  deals: [],
  dealsLoading: false,
}

export const fetchExploreDestinations = createAsyncThunk(
  'explore/fetchDestinations',
  async (originCode: string) => {
    const res = await fetch(`/api/explore-destinations?origin=${encodeURIComponent(originCode)}`)
    return res.json() as Promise<ExploreDestination[]>
  }
)

export const fetchExploreDates = createAsyncThunk(
  'explore/fetchDates',
  async (params: { originCode: string; dateRange: DateRange }) => {
    const res = await fetch(
      `/api/explore-dates?origin=${encodeURIComponent(params.originCode)}&range=${params.dateRange}`
    )
    return res.json() as Promise<DatePrice[]>
  }
)

export const fetchExploreDeals = createAsyncThunk(
  'explore/fetchDeals',
  async (originCode: string) => {
    const res = await fetch(`/api/explore-deals?origin=${encodeURIComponent(originCode)}`)
    return res.json() as Promise<Deal[]>
  }
)

const exploreSlice = createSlice({
  name: 'explore',
  initialState,
  reducers: {
    setExploreOrigin(state, action: PayloadAction<Airport | null>) {
      state.origin = action.payload
    },
    setDateRange(state, action: PayloadAction<DateRange>) {
      state.dateRange = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExploreDestinations.pending, (state) => {
        state.destinationsLoading = true
      })
      .addCase(fetchExploreDestinations.fulfilled, (state, action) => {
        state.destinations = action.payload
        state.destinationsLoading = false
      })
      .addCase(fetchExploreDestinations.rejected, (state) => {
        state.destinationsLoading = false
      })
      .addCase(fetchExploreDates.pending, (state) => {
        state.datePricesLoading = true
      })
      .addCase(fetchExploreDates.fulfilled, (state, action) => {
        state.datePrices = action.payload
        state.datePricesLoading = false
      })
      .addCase(fetchExploreDates.rejected, (state) => {
        state.datePricesLoading = false
      })
      .addCase(fetchExploreDeals.pending, (state) => {
        state.dealsLoading = true
      })
      .addCase(fetchExploreDeals.fulfilled, (state, action) => {
        state.deals = action.payload
        state.dealsLoading = false
      })
      .addCase(fetchExploreDeals.rejected, (state) => {
        state.dealsLoading = false
      })
  },
})

export const { setExploreOrigin, setDateRange } = exploreSlice.actions
export default exploreSlice.reducer
