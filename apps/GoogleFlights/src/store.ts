import { configureStore } from '@reduxjs/toolkit'
import searchReducer from './slices/searchSlice'
import flightsReducer from './slices/flightsSlice'
import bookingReducer from './slices/bookingSlice'
import tripsReducer from './slices/tripsSlice'
import exploreReducer from './slices/exploreSlice'

export const store = configureStore({
  reducer: {
    search: searchReducer,
    flights: flightsReducer,
    booking: bookingReducer,
    trips: tripsReducer,
    explore: exploreReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
