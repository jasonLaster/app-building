import { configureStore } from '@reduxjs/toolkit'
import searchReducer from './slices/searchSlice'
import flightsReducer from './slices/flightsSlice'
import bookingReducer from './slices/bookingSlice'

export const store = configureStore({
  reducer: {
    search: searchReducer,
    flights: flightsReducer,
    booking: bookingReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
