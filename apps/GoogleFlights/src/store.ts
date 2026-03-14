import { configureStore } from '@reduxjs/toolkit'
import searchReducer from './slices/searchSlice'
import flightsReducer from './slices/flightsSlice'

export const store = configureStore({
  reducer: {
    search: searchReducer,
    flights: flightsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
