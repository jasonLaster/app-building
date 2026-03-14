import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'

export interface Airport {
  id: string
  iata_code: string
  name: string
  city: string
  country: string
  latitude?: number
  longitude?: number
}

export interface RecentSearch {
  id: string
  origin_code: string
  origin_name: string
  origin_city: string
  dest_code: string
  dest_name: string
  dest_city: string
  departure_date: string
  return_date: string | null
  passengers_adults: number
  passengers_children: number
  passengers_infants: number
  cabin_class: string
  trip_type: string
  searched_at: string
}

export interface PopularDestination {
  id: string
  iata_code: string
  city: string
  country: string
  gradient: string
  min_price: number | null
}

export type TripType = 'round_trip' | 'one_way' | 'multi_city'
export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first'

interface SearchState {
  tripType: TripType
  passengers: {
    adults: number
    children: number
    infants: number
  }
  cabinClass: CabinClass
  origin: Airport | null
  destination: Airport | null
  departureDate: string | null
  returnDate: string | null
  recentSearches: RecentSearch[]
  recentSearchesLoading: boolean
  popularDestinations: PopularDestination[]
  popularDestinationsLoading: boolean
  sessionToken: string
  validationErrors: Record<string, string>
}

function getOrCreateSessionToken(): string {
  const key = 'gf_session_token'
  let token = localStorage.getItem(key)
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem(key, token)
  }
  return token
}

const initialState: SearchState = {
  tripType: 'round_trip',
  passengers: { adults: 1, children: 0, infants: 0 },
  cabinClass: 'economy',
  origin: null,
  destination: null,
  departureDate: null,
  returnDate: null,
  recentSearches: [],
  recentSearchesLoading: false,
  popularDestinations: [],
  popularDestinationsLoading: false,
  sessionToken: typeof window !== 'undefined' ? getOrCreateSessionToken() : '',
  validationErrors: {},
}

export const fetchRecentSearches = createAsyncThunk(
  'search/fetchRecentSearches',
  async (sessionToken: string) => {
    const res = await fetch(`/api/recent-searches?session=${encodeURIComponent(sessionToken)}`)
    return res.json() as Promise<RecentSearch[]>
  }
)

export const saveRecentSearch = createAsyncThunk(
  'search/saveRecentSearch',
  async (params: {
    sessionToken: string
    originCode: string
    destCode: string
    departureDate: string
    returnDate: string | null
    adults: number
    children: number
    infants: number
    cabinClass: string
    tripType: string
  }) => {
    await fetch('/api/recent-searches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
  }
)

export const fetchPopularDestinations = createAsyncThunk(
  'search/fetchPopularDestinations',
  async () => {
    const res = await fetch('/api/popular-destinations')
    return res.json() as Promise<PopularDestination[]>
  }
)

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setTripType(state, action: PayloadAction<TripType>) {
      state.tripType = action.payload
      if (action.payload === 'one_way') {
        state.returnDate = null
      }
    },
    setPassengers(state, action: PayloadAction<{ adults: number; children: number; infants: number }>) {
      state.passengers = action.payload
    },
    setCabinClass(state, action: PayloadAction<CabinClass>) {
      state.cabinClass = action.payload
    },
    setOrigin(state, action: PayloadAction<Airport | null>) {
      state.origin = action.payload
      delete state.validationErrors['origin']
    },
    setDestination(state, action: PayloadAction<Airport | null>) {
      state.destination = action.payload
      delete state.validationErrors['destination']
    },
    swapAirports(state) {
      const temp = state.origin
      state.origin = state.destination
      state.destination = temp
    },
    setDepartureDate(state, action: PayloadAction<string | null>) {
      state.departureDate = action.payload
      delete state.validationErrors['departureDate']
    },
    setReturnDate(state, action: PayloadAction<string | null>) {
      state.returnDate = action.payload
      delete state.validationErrors['returnDate']
    },
    setValidationErrors(state, action: PayloadAction<Record<string, string>>) {
      state.validationErrors = action.payload
    },
    clearValidationErrors(state) {
      state.validationErrors = {}
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecentSearches.pending, (state) => {
        if (state.recentSearches.length === 0) {
          state.recentSearchesLoading = true
        }
      })
      .addCase(fetchRecentSearches.fulfilled, (state, action) => {
        state.recentSearches = action.payload
        state.recentSearchesLoading = false
      })
      .addCase(fetchRecentSearches.rejected, (state) => {
        state.recentSearchesLoading = false
      })
      .addCase(fetchPopularDestinations.pending, (state) => {
        if (state.popularDestinations.length === 0) {
          state.popularDestinationsLoading = true
        }
      })
      .addCase(fetchPopularDestinations.fulfilled, (state, action) => {
        state.popularDestinations = action.payload
        state.popularDestinationsLoading = false
      })
      .addCase(fetchPopularDestinations.rejected, (state) => {
        state.popularDestinationsLoading = false
      })
  },
})

export const {
  setTripType,
  setPassengers,
  setCabinClass,
  setOrigin,
  setDestination,
  swapAirports,
  setDepartureDate,
  setReturnDate,
  setValidationErrors,
  clearValidationErrors,
} = searchSlice.actions

export default searchSlice.reducer
