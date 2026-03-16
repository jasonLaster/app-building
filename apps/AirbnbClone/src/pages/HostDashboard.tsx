import { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState, AppDispatch } from '../store'
import {
  fetchHostStats,
  fetchHostListings,
  fetchHostBookings,
  deactivateProperty,
  activateProperty,
  updateHostBookingStatus,
} from '../slices/hostSlice'
import type { Property } from '../slices/propertiesSlice'
import StatsOverview from '../components/StatsOverview'
import ListingsTab from '../components/ListingsTab'
import BookingsTab from '../components/BookingsTab'
import AddListingForm from '../components/AddListingForm'

type Tab = 'listings' | 'bookings'

export default function HostDashboard() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const currentUser = useSelector((state: RootState) => state.auth.currentUser)
  const { stats, listings, bookings, statsLoading, listingsLoading, bookingsLoading } = useSelector(
    (state: RootState) => state.host
  )
  const [activeTab, setActiveTab] = useState<Tab>('listings')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
    }
  }, [currentUser, navigate])

  useEffect(() => {
    if (currentUser?.is_host) {
      dispatch(fetchHostStats(currentUser.id))
      dispatch(fetchHostListings(currentUser.id))
      dispatch(fetchHostBookings(currentUser.id))
    }
  }, [dispatch, currentUser])

  const handleDeactivate = useCallback(async (property: Property) => {
    await dispatch(deactivateProperty(property.id))
  }, [dispatch])

  const handleActivate = useCallback(async (property: Property) => {
    await dispatch(activateProperty(property.id))
  }, [dispatch])

  const handleConfirmBooking = useCallback(async (bookingId: string) => {
    await dispatch(updateHostBookingStatus({ bookingId, status: 'confirmed' }))
    if (currentUser) {
      dispatch(fetchHostStats(currentUser.id))
    }
  }, [dispatch, currentUser])

  const handleCancelBooking = useCallback(async (bookingId: string) => {
    await dispatch(updateHostBookingStatus({ bookingId, status: 'cancelled' }))
    if (currentUser) {
      dispatch(fetchHostStats(currentUser.id))
    }
  }, [dispatch, currentUser])

  const handleAddListingSuccess = useCallback(() => {
    setShowAddForm(false)
    if (currentUser) {
      dispatch(fetchHostStats(currentUser.id))
      dispatch(fetchHostListings(currentUser.id))
    }
  }, [dispatch, currentUser])

  if (!currentUser) {
    return null
  }

  if (!currentUser.is_host) {
    return (
      <main data-testid="host-dashboard" className="p-6 max-sm:p-3">
        <div className="max-w-lg mx-auto text-center py-16">
          <h1 className="text-2xl font-bold text-text mb-4">Become a Host</h1>
          <p className="text-text-secondary mb-6">
            You need to become a host to access this page. Visit your profile to get started.
          </p>
          <button
            data-testid="become-host-link"
            onClick={() => navigate('/profile')}
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Go to Profile
          </button>
        </div>
      </main>
    )
  }

  return (
    <main data-testid="host-dashboard" className="p-6 max-sm:p-3">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-text mb-6">Host Dashboard</h1>

        <StatsOverview stats={stats} loading={statsLoading} />

        <div className="mt-8 mb-6">
          <div className="flex border-b border-border" role="tablist" aria-label="Dashboard sections">
            <button
              data-testid="tab-listings"
              role="tab"
              aria-selected={activeTab === 'listings'}
              aria-controls="tabpanel-listings"
              id="tab-listings-btn"
              onClick={() => setActiveTab('listings')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'listings'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text'
              }`}
            >
              Listings
            </button>
            <button
              data-testid="tab-bookings"
              role="tab"
              aria-selected={activeTab === 'bookings'}
              aria-controls="tabpanel-bookings"
              id="tab-bookings-btn"
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'bookings'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:text-text'
              }`}
            >
              Bookings
            </button>
          </div>
        </div>

        {activeTab === 'listings' && (
          <div role="tabpanel" id="tabpanel-listings" aria-labelledby="tab-listings-btn">
            <ListingsTab
              listings={listings}
              loading={listingsLoading}
              onDeactivate={handleDeactivate}
              onActivate={handleActivate}
              onAddListing={() => setShowAddForm(true)}
            />
          </div>
        )}

        {activeTab === 'bookings' && (
          <div role="tabpanel" id="tabpanel-bookings" aria-labelledby="tab-bookings-btn">
            <BookingsTab
              bookings={bookings}
              loading={bookingsLoading}
              onConfirm={handleConfirmBooking}
              onCancel={handleCancelBooking}
            />
          </div>
        )}

        {showAddForm && (
          <AddListingForm
            hostId={currentUser.id}
            onClose={() => setShowAddForm(false)}
            onSuccess={handleAddListingSuccess}
          />
        )}
      </div>
    </main>
  )
}
