import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { FlightLeg } from './flightsSlice'

export interface PassengerInfo {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  email: string
  phone: string
  passengerType: 'adult' | 'child' | 'infant'
}

export interface BookingFlightDetail {
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
  base_price_cents: number
  taxes_cents: number
  total_price_cents: number
  cabin_class: string
  available_seats: number
}

interface BookingState {
  flight: BookingFlightDetail | null
  legs: FlightLeg[]
  returnFlight: BookingFlightDetail | null
  returnLegs: FlightLeg[]
  loading: boolean
  error: string | null
  passengers: PassengerInfo[]
  validationErrors: Record<string, string>
  bookingInProgress: boolean
  bookingComplete: boolean
  bookingReference: string | null
  bookingError: string | null
}

const initialState: BookingState = {
  flight: null,
  legs: [],
  returnFlight: null,
  returnLegs: [],
  loading: false,
  error: null,
  passengers: [],
  validationErrors: {},
  bookingInProgress: false,
  bookingComplete: false,
  bookingReference: null,
  bookingError: null,
}

export const fetchFlightForBooking = createAsyncThunk(
  'booking/fetchFlightForBooking',
  async (params: { flightId: string; cabinClass: string }) => {
    const qs = new URLSearchParams({
      flightId: params.flightId,
      cabinClass: params.cabinClass,
    })
    const res = await fetch(`/api/bookings?${qs}`)
    if (!res.ok) {
      throw new Error('Failed to fetch flight details')
    }
    return res.json() as Promise<{ flight: BookingFlightDetail; legs: FlightLeg[] }>
  }
)

export const fetchReturnFlightForBooking = createAsyncThunk(
  'booking/fetchReturnFlightForBooking',
  async (params: { flightId: string; cabinClass: string }) => {
    const qs = new URLSearchParams({
      flightId: params.flightId,
      cabinClass: params.cabinClass,
    })
    const res = await fetch(`/api/bookings?${qs}`)
    if (!res.ok) {
      throw new Error('Failed to fetch return flight details')
    }
    return res.json() as Promise<{ flight: BookingFlightDetail; legs: FlightLeg[] }>
  }
)

export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (params: {
    sessionToken: string
    flightId: string
    returnFlightId?: string
    cabinClass: string
    totalPriceCents: number
    passengers: Array<{
      firstName: string
      lastName: string
      dateOfBirth: string
      gender: string
      email?: string
      phone?: string
      passengerType: string
    }>
  }) => {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    if (!res.ok) {
      throw new Error('Booking failed. Please try again.')
    }
    return res.json() as Promise<{
      id: string
      bookingReference: string
      status: string
      createdAt: string
    }>
  }
)

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    initializePassengers(state, action: PayloadAction<{ adults: number; children: number; infants: number }>) {
      const passengers: PassengerInfo[] = []
      for (let i = 0; i < action.payload.adults; i++) {
        passengers.push({
          firstName: '', lastName: '', dateOfBirth: '', gender: '',
          email: '', phone: '', passengerType: 'adult',
        })
      }
      for (let i = 0; i < action.payload.children; i++) {
        passengers.push({
          firstName: '', lastName: '', dateOfBirth: '', gender: '',
          email: '', phone: '', passengerType: 'child',
        })
      }
      for (let i = 0; i < action.payload.infants; i++) {
        passengers.push({
          firstName: '', lastName: '', dateOfBirth: '', gender: '',
          email: '', phone: '', passengerType: 'infant',
        })
      }
      state.passengers = passengers
      state.validationErrors = {}
      state.bookingComplete = false
      state.bookingReference = null
      state.bookingError = null
    },
    updatePassenger(state, action: PayloadAction<{ index: number; field: keyof PassengerInfo; value: string }>) {
      const p = state.passengers[action.payload.index]
      if (p) {
        ;(p[action.payload.field] as string) = action.payload.value
      }
      // Clear validation error for this field
      delete state.validationErrors[`${action.payload.index}-${action.payload.field}`]
    },
    setValidationErrors(state, action: PayloadAction<Record<string, string>>) {
      state.validationErrors = action.payload
    },
    resetBooking(state) {
      state.flight = null
      state.legs = []
      state.returnFlight = null
      state.returnLegs = []
      state.loading = false
      state.error = null
      state.passengers = []
      state.validationErrors = {}
      state.bookingInProgress = false
      state.bookingComplete = false
      state.bookingReference = null
      state.bookingError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFlightForBooking.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFlightForBooking.fulfilled, (state, action) => {
        state.flight = action.payload.flight
        state.legs = action.payload.legs
        state.loading = false
      })
      .addCase(fetchFlightForBooking.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to load flight details'
      })
      .addCase(fetchReturnFlightForBooking.fulfilled, (state, action) => {
        state.returnFlight = action.payload.flight
        state.returnLegs = action.payload.legs
      })
      .addCase(fetchReturnFlightForBooking.rejected, (state) => {
        state.returnFlight = null
        state.returnLegs = []
      })
      .addCase(createBooking.pending, (state) => {
        state.bookingInProgress = true
        state.bookingError = null
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.bookingInProgress = false
        state.bookingComplete = true
        state.bookingReference = action.payload.bookingReference
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.bookingInProgress = false
        state.bookingError = action.error.message || 'Booking failed. Please try again.'
      })
  },
})

export const {
  initializePassengers,
  updatePassenger,
  setValidationErrors,
  resetBooking,
} = bookingSlice.actions

export default bookingSlice.reducer
