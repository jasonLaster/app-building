import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import propertiesReducer from './slices/propertiesSlice'
import favoritesReducer from './slices/favoritesSlice'
import amenitiesReducer from './slices/amenitiesSlice'
import propertyDetailReducer from './slices/propertyDetailSlice'
import bookingsReducer from './slices/bookingsSlice'
import hostReducer from './slices/hostSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertiesReducer,
    favorites: favoritesReducer,
    amenities: amenitiesReducer,
    propertyDetail: propertyDetailReducer,
    bookings: bookingsReducer,
    host: hostReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
