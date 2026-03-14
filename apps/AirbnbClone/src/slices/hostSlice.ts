import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Property } from './propertiesSlice'

export interface HostBooking {
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
  guest_name?: string
  guest_email?: string
}

export interface HostStats {
  totalListings: number
  activeBookings: number
  totalEarnings: number
  avgRating: number
  reviewCount: number
}

interface HostState {
  stats: HostStats
  listings: Property[]
  bookings: HostBooking[]
  statsLoading: boolean
  listingsLoading: boolean
  bookingsLoading: boolean
  error: string | null
}

const initialState: HostState = {
  stats: {
    totalListings: 0,
    activeBookings: 0,
    totalEarnings: 0,
    avgRating: 0,
    reviewCount: 0,
  },
  listings: [],
  bookings: [],
  statsLoading: false,
  listingsLoading: false,
  bookingsLoading: false,
  error: null,
}

export const fetchHostStats = createAsyncThunk(
  'host/fetchHostStats',
  async (hostId: string, { rejectWithValue }) => {
    const response = await fetch(`/api/host-stats?host_id=${encodeURIComponent(hostId)}`)
    const data = await response.json()
    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to fetch host stats')
    }
    return data as HostStats
  }
)

export const fetchHostListings = createAsyncThunk(
  'host/fetchHostListings',
  async (hostId: string, { rejectWithValue }) => {
    const response = await fetch(`/api/host-listings?host_id=${encodeURIComponent(hostId)}`)
    const data = await response.json()
    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to fetch host listings')
    }
    return data as Property[]
  }
)

export const fetchHostBookings = createAsyncThunk(
  'host/fetchHostBookings',
  async (hostId: string, { rejectWithValue }) => {
    const response = await fetch(`/api/host-bookings?host_id=${encodeURIComponent(hostId)}`)
    const data = await response.json()
    if (!response.ok) {
      return rejectWithValue(data.error || 'Failed to fetch host bookings')
    }
    return data as HostBooking[]
  }
)

export const createProperty = createAsyncThunk(
  'host/createProperty',
  async (data: {
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
    amenity_ids?: string[]
  }, { rejectWithValue }) => {
    const response = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await response.json()
    if (!response.ok) {
      return rejectWithValue(result.error || 'Failed to create property')
    }
    return result as Property
  }
)

export const deactivateProperty = createAsyncThunk(
  'host/deactivateProperty',
  async (propertyId: string, { rejectWithValue }) => {
    const response = await fetch(`/api/properties/${propertyId}`, {
      method: 'DELETE',
    })
    const result = await response.json()
    if (!response.ok) {
      return rejectWithValue(result.error || 'Failed to deactivate property')
    }
    return result as Property
  }
)

export const activateProperty = createAsyncThunk(
  'host/activateProperty',
  async (propertyId: string, { rejectWithValue }) => {
    const response = await fetch(`/api/properties/${propertyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: true }),
    })
    const result = await response.json()
    if (!response.ok) {
      return rejectWithValue(result.error || 'Failed to activate property')
    }
    return result as Property
  }
)

export const updateHostBookingStatus = createAsyncThunk(
  'host/updateBookingStatus',
  async ({ bookingId, status }: { bookingId: string; status: string }, { rejectWithValue }) => {
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const result = await response.json()
    if (!response.ok) {
      return rejectWithValue(result.error || 'Failed to update booking')
    }
    return result as HostBooking
  }
)

const hostSlice = createSlice({
  name: 'host',
  initialState,
  reducers: {
    clearHostError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHostStats.pending, (state) => {
        state.statsLoading = true
        state.error = null
      })
      .addCase(fetchHostStats.fulfilled, (state, action) => {
        state.statsLoading = false
        state.stats = action.payload
      })
      .addCase(fetchHostStats.rejected, (state, action) => {
        state.statsLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchHostListings.pending, (state) => {
        if (state.listings.length === 0) {
          state.listingsLoading = true
        }
        state.error = null
      })
      .addCase(fetchHostListings.fulfilled, (state, action) => {
        state.listingsLoading = false
        state.listings = action.payload
      })
      .addCase(fetchHostListings.rejected, (state, action) => {
        state.listingsLoading = false
        state.error = action.payload as string
      })
      .addCase(fetchHostBookings.pending, (state) => {
        if (state.bookings.length === 0) {
          state.bookingsLoading = true
        }
        state.error = null
      })
      .addCase(fetchHostBookings.fulfilled, (state, action) => {
        state.bookingsLoading = false
        state.bookings = action.payload
      })
      .addCase(fetchHostBookings.rejected, (state, action) => {
        state.bookingsLoading = false
        state.error = action.payload as string
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.listings.unshift(action.payload)
        state.stats.totalListings += 1
      })
      .addCase(deactivateProperty.fulfilled, (state, action) => {
        const index = state.listings.findIndex((p) => p.id === action.payload.id)
        if (index !== -1) {
          const existing = state.listings[index]
          if (existing) {
            state.listings[index] = { ...existing, ...action.payload, is_active: false }
          }
        }
        state.stats.totalListings = Math.max(0, state.stats.totalListings - 1)
      })
      .addCase(activateProperty.fulfilled, (state, action) => {
        const index = state.listings.findIndex((p) => p.id === action.payload.id)
        if (index !== -1) {
          const existing = state.listings[index]
          if (existing) {
            state.listings[index] = { ...existing, ...action.payload, is_active: true }
          }
        }
        state.stats.totalListings += 1
      })
      .addCase(updateHostBookingStatus.fulfilled, (state, action) => {
        const index = state.bookings.findIndex((b) => b.id === action.payload.id)
        if (index !== -1) {
          const existing = state.bookings[index]
          if (existing) {
            const oldStatus = existing.status
            const newStatus = action.payload.status
            state.bookings[index] = { ...existing, ...action.payload }
            if (['pending', 'confirmed'].includes(oldStatus) && !['pending', 'confirmed'].includes(newStatus)) {
              state.stats.activeBookings = Math.max(0, state.stats.activeBookings - 1)
            } else if (!['pending', 'confirmed'].includes(oldStatus) && ['pending', 'confirmed'].includes(newStatus)) {
              state.stats.activeBookings += 1
            }
          }
        }
      })
  },
})

export const { clearHostError } = hostSlice.actions
export default hostSlice.reducer
