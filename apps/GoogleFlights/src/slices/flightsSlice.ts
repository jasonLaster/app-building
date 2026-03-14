import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'

export interface FlightResult {
  id: string
  flight_number: string
  departure_time: string
  arrival_time: string
  duration_minutes: number
  aircraft_type: string
  has_wifi: boolean
  has_power: boolean
  has_entertainment: boolean
  co2_kg: number
  airline_name: string
  airline_code: string
  logo_color: string
  origin_code: string
  origin_name: string
  origin_city: string
  dest_code: string
  dest_name: string
  dest_city: string
  total_price_cents: number
  base_price_cents: number
  taxes_cents: number
  cabin_class: string
  available_seats: number
  num_legs: number
}

export interface FlightLeg {
  id: string
  leg_order: number
  departure_time: string
  arrival_time: string
  duration_minutes: number
  flight_number: string
  aircraft_type: string
  terminal_departure: string | null
  terminal_arrival: string | null
  origin_code: string
  origin_name: string
  origin_city: string
  dest_code: string
  dest_name: string
  dest_city: string
  airline_name: string | null
  airline_code: string | null
}

export type SortOption = 'best' | 'price' | 'duration' | 'departure' | 'arrival'

export interface StopsFilter {
  nonstop: boolean
  oneStop: boolean
  twoPlusStops: boolean
}

export interface TimeFilter {
  morning: boolean   // 6:00 - 12:00
  afternoon: boolean // 12:00 - 18:00
  evening: boolean   // 18:00 - 24:00
  night: boolean     // 0:00 - 6:00
}

interface FlightsState {
  flights: FlightResult[]
  loading: boolean
  total: number
  page: number
  totalPages: number
  loadingMore: boolean
  sortBy: SortOption
  stopsFilter: StopsFilter
  airlinesFilter: string[]
  priceRange: [number, number]
  priceRangeMax: [number, number]
  durationRange: [number, number]
  durationRangeMax: [number, number]
  departureTimeFilter: TimeFilter
  arrivalTimeFilter: TimeFilter
  expandedLegs: Record<string, FlightLeg[]>
  expandedLegsLoading: Record<string, boolean>
  isTracked: boolean
  isTrackedLoading: boolean
}

const initialState: FlightsState = {
  flights: [],
  loading: false,
  total: 0,
  page: 1,
  totalPages: 0,
  loadingMore: false,
  sortBy: 'best',
  stopsFilter: { nonstop: false, oneStop: false, twoPlusStops: false },
  airlinesFilter: [],
  priceRange: [0, 10000],
  priceRangeMax: [0, 10000],
  durationRange: [0, 2880],
  durationRangeMax: [0, 2880],
  departureTimeFilter: { morning: false, afternoon: false, evening: false, night: false },
  arrivalTimeFilter: { morning: false, afternoon: false, evening: false, night: false },
  expandedLegs: {},
  expandedLegsLoading: {},
  isTracked: false,
  isTrackedLoading: false,
}

export const searchFlights = createAsyncThunk(
  'flights/searchFlights',
  async (params: {
    origin: string
    destination: string
    departureDate: string
    cabinClass: string
    page?: number
  }) => {
    const qs = new URLSearchParams({
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      cabinClass: params.cabinClass,
      page: String(params.page || 1),
    })
    const res = await fetch(`/api/search-flights?${qs}`)
    return res.json() as Promise<{
      flights: FlightResult[]
      total: number
      page: number
      totalPages: number
    }>
  }
)

export const loadMoreFlights = createAsyncThunk(
  'flights/loadMoreFlights',
  async (params: {
    origin: string
    destination: string
    departureDate: string
    cabinClass: string
    page: number
  }) => {
    const qs = new URLSearchParams({
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      cabinClass: params.cabinClass,
      page: String(params.page),
    })
    const res = await fetch(`/api/search-flights?${qs}`)
    return res.json() as Promise<{
      flights: FlightResult[]
      total: number
      page: number
      totalPages: number
    }>
  }
)

export const fetchFlightLegs = createAsyncThunk(
  'flights/fetchFlightLegs',
  async (flightId: string) => {
    const res = await fetch(`/api/flight-legs?flightId=${encodeURIComponent(flightId)}`)
    const legs = await res.json() as FlightLeg[]
    return { flightId, legs }
  }
)

export const checkTrackedRoute = createAsyncThunk(
  'flights/checkTrackedRoute',
  async (params: { sessionToken: string; origin: string; destination: string }) => {
    const qs = new URLSearchParams({
      session: params.sessionToken,
      origin: params.origin,
      destination: params.destination,
    })
    const res = await fetch(`/api/tracked-routes?${qs}`)
    const data = await res.json() as { tracked: boolean }
    return data.tracked
  }
)

export const toggleTrackRoute = createAsyncThunk(
  'flights/toggleTrackRoute',
  async (params: {
    sessionToken: string
    originCode: string
    destCode: string
    departureDateStart?: string
    departureDateEnd?: string
    cabinClass?: string
    isCurrentlyTracked: boolean
  }) => {
    if (params.isCurrentlyTracked) {
      await fetch('/api/tracked-routes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken: params.sessionToken,
          originCode: params.originCode,
          destCode: params.destCode,
        }),
      })
      return false
    } else {
      await fetch('/api/tracked-routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken: params.sessionToken,
          originCode: params.originCode,
          destCode: params.destCode,
          departureDateStart: params.departureDateStart,
          departureDateEnd: params.departureDateEnd,
          cabinClass: params.cabinClass,
        }),
      })
      return true
    }
  }
)

const flightsSlice = createSlice({
  name: 'flights',
  initialState,
  reducers: {
    setSortBy(state, action: PayloadAction<SortOption>) {
      state.sortBy = action.payload
    },
    setStopsFilter(state, action: PayloadAction<StopsFilter>) {
      state.stopsFilter = action.payload
    },
    setAirlinesFilter(state, action: PayloadAction<string[]>) {
      state.airlinesFilter = action.payload
    },
    setPriceRange(state, action: PayloadAction<[number, number]>) {
      state.priceRange = action.payload
    },
    setDurationRange(state, action: PayloadAction<[number, number]>) {
      state.durationRange = action.payload
    },
    setDepartureTimeFilter(state, action: PayloadAction<TimeFilter>) {
      state.departureTimeFilter = action.payload
    },
    setArrivalTimeFilter(state, action: PayloadAction<TimeFilter>) {
      state.arrivalTimeFilter = action.payload
    },
    resetFilters(state) {
      state.stopsFilter = { nonstop: false, oneStop: false, twoPlusStops: false }
      state.airlinesFilter = []
      state.priceRange = state.priceRangeMax
      state.durationRange = state.durationRangeMax
      state.departureTimeFilter = { morning: false, afternoon: false, evening: false, night: false }
      state.arrivalTimeFilter = { morning: false, afternoon: false, evening: false, night: false }
      state.sortBy = 'best'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchFlights.pending, (state) => {
        state.loading = true
        state.flights = []
        state.expandedLegs = {}
        state.expandedLegsLoading = {}
      })
      .addCase(searchFlights.fulfilled, (state, action) => {
        state.flights = action.payload.flights
        state.total = action.payload.total
        state.page = action.payload.page
        state.totalPages = action.payload.totalPages
        state.loading = false

        // Calculate price and duration ranges
        if (action.payload.flights.length > 0) {
          const prices = action.payload.flights.map(f => f.total_price_cents)
          const durations = action.payload.flights.map(f => f.duration_minutes)
          const minPrice = Math.min(...prices)
          const maxPrice = Math.max(...prices)
          const minDuration = Math.min(...durations)
          const maxDuration = Math.max(...durations)
          state.priceRange = [minPrice, maxPrice]
          state.priceRangeMax = [minPrice, maxPrice]
          state.durationRange = [minDuration, maxDuration]
          state.durationRangeMax = [minDuration, maxDuration]
        }

        // Reset filters on new search
        state.stopsFilter = { nonstop: false, oneStop: false, twoPlusStops: false }
        state.airlinesFilter = []
        state.departureTimeFilter = { morning: false, afternoon: false, evening: false, night: false }
        state.arrivalTimeFilter = { morning: false, afternoon: false, evening: false, night: false }
        state.sortBy = 'best'
      })
      .addCase(searchFlights.rejected, (state) => {
        state.loading = false
      })
      .addCase(loadMoreFlights.pending, (state) => {
        state.loadingMore = true
      })
      .addCase(loadMoreFlights.fulfilled, (state, action) => {
        state.flights = [...state.flights, ...action.payload.flights]
        state.page = action.payload.page
        state.totalPages = action.payload.totalPages
        state.total = action.payload.total
        state.loadingMore = false

        // Update ranges with new data
        if (state.flights.length > 0) {
          const prices = state.flights.map(f => f.total_price_cents)
          const durations = state.flights.map(f => f.duration_minutes)
          state.priceRangeMax = [Math.min(...prices), Math.max(...prices)]
          state.durationRangeMax = [Math.min(...durations), Math.max(...durations)]
        }
      })
      .addCase(loadMoreFlights.rejected, (state) => {
        state.loadingMore = false
      })
      .addCase(fetchFlightLegs.pending, (state, action) => {
        state.expandedLegsLoading[action.meta.arg] = true
      })
      .addCase(fetchFlightLegs.fulfilled, (state, action) => {
        state.expandedLegs[action.payload.flightId] = action.payload.legs
        state.expandedLegsLoading[action.payload.flightId] = false
      })
      .addCase(fetchFlightLegs.rejected, (state, action) => {
        state.expandedLegsLoading[action.meta.arg] = false
      })
      .addCase(checkTrackedRoute.pending, (state) => {
        state.isTrackedLoading = true
      })
      .addCase(checkTrackedRoute.fulfilled, (state, action) => {
        state.isTracked = action.payload
        state.isTrackedLoading = false
      })
      .addCase(checkTrackedRoute.rejected, (state) => {
        state.isTrackedLoading = false
      })
      .addCase(toggleTrackRoute.fulfilled, (state, action) => {
        state.isTracked = action.payload
      })
  },
})

export const {
  setSortBy,
  setStopsFilter,
  setAirlinesFilter,
  setPriceRange,
  setDurationRange,
  setDepartureTimeFilter,
  setArrivalTimeFilter,
  resetFilters,
} = flightsSlice.actions

export default flightsSlice.reducer
