import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export interface PropertyImage {
  id: string
  property_id: string
  url: string
  caption: string | null
  display_order: number
}

export interface Amenity {
  id: string
  name: string
  icon: string | null
  category: string
}

export interface Review {
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
  guest_name: string
  guest_avatar: string | null
}

export interface Property {
  id: string
  host_id: string
  title: string
  description: string
  property_type: string
  price_per_night: number
  cleaning_fee: number
  max_guests: number
  bedrooms: number
  beds: number
  bathrooms: number
  address: string
  city: string
  state: string | null
  country: string
  latitude: number | null
  longitude: number | null
  check_in_time: string
  check_out_time: string
  is_active: boolean
  created_at: string
  updated_at: string
  main_image?: string | null
  avg_rating?: number
  review_count?: number
  // Detail fields
  host_name?: string
  host_avatar?: string | null
  host_bio?: string | null
  host_since?: string
  host_listing_count?: number
  images?: PropertyImage[]
  amenities?: Amenity[]
  reviews?: Review[]
  reviews_total?: number
}

export interface SearchFilters {
  city: string
  checkIn: string
  checkOut: string
  guests: number
  propertyType: string
  minPrice: number
  maxPrice: number
  minBedrooms: number
  minBeds: number
  minBathrooms: number
  amenityIds: string[]
  page: number
}

interface PropertiesState {
  items: Property[]
  total: number
  totalPages: number
  page: number
  loading: boolean
  error: string | null
  filters: SearchFilters
}

const initialFilters: SearchFilters = {
  city: '',
  checkIn: '',
  checkOut: '',
  guests: 0,
  propertyType: '',
  minPrice: 0,
  maxPrice: 0,
  minBedrooms: 0,
  minBeds: 0,
  minBathrooms: 0,
  amenityIds: [],
  page: 1,
}

const initialState: PropertiesState = {
  items: [],
  total: 0,
  totalPages: 0,
  page: 1,
  loading: false,
  error: null,
  filters: initialFilters,
}

export const fetchProperties = createAsyncThunk(
  'properties/fetchProperties',
  async (filters: SearchFilters, { rejectWithValue }) => {
    const params = new URLSearchParams()
    if (filters.city) params.set('city', filters.city)
    if (filters.checkIn) params.set('check_in', filters.checkIn)
    if (filters.checkOut) params.set('check_out', filters.checkOut)
    if (filters.guests > 0) params.set('guests', String(filters.guests))
    if (filters.propertyType) params.set('property_type', filters.propertyType)
    if (filters.minPrice > 0) params.set('min_price', String(filters.minPrice))
    if (filters.maxPrice > 0) params.set('max_price', String(filters.maxPrice))
    if (filters.minBedrooms > 0) params.set('min_bedrooms', String(filters.minBedrooms))
    if (filters.minBeds > 0) params.set('min_beds', String(filters.minBeds))
    if (filters.minBathrooms > 0) params.set('min_bathrooms', String(filters.minBathrooms))
    if (filters.amenityIds.length > 0) params.set('amenities', filters.amenityIds.join(','))
    params.set('page', String(filters.page))
    params.set('limit', '12')

    const response = await fetch(`/api/properties?${params.toString()}`)
    const data = await response.json()
    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to fetch properties')
    }
    return data as { properties: Property[]; total: number; page: number; totalPages: number }
  }
)

const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    setFilters(state, action: { payload: Partial<SearchFilters> }) {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters(state) {
      state.filters = initialFilters
    },
    setPage(state, action: { payload: number }) {
      state.filters.page = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => {
        if (state.items.length === 0) {
          state.loading = true
        }
        state.error = null
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.properties
        state.total = action.payload.total
        state.totalPages = action.payload.totalPages
        state.page = action.payload.page
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { setFilters, resetFilters, setPage } = propertiesSlice.actions
export default propertiesSlice.reducer
