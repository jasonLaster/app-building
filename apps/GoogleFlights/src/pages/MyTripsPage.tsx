import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import {
  fetchMyBookings,
  fetchTrackedRoutes,
  cancelBooking,
  untrackRoute,
  clearCancelError,
  type BookingTrip,
} from '../slices/tripsSlice'
import TripsTabs from '../components/TripsTabs'
import TripCard from '../components/TripCard'
import TrackedRouteCard from '../components/TrackedRouteCard'
import CancelBookingModal from '../components/CancelBookingModal'
import './MyTripsPage.css'

function getSessionToken(): string {
  let token = localStorage.getItem('session_token')
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem('session_token', token)
  }
  return token
}

function MyTripsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const {
    bookings,
    trackedRoutes,
    loading,
    trackedLoading,
    activeTab,
    cancellingBookingId,
    cancelError,
    untrackingRouteId,
  } = useSelector((state: RootState) => state.trips)

  const [cancelTarget, setCancelTarget] = useState<BookingTrip | null>(null)

  const sessionToken = getSessionToken()

  useEffect(() => {
    dispatch(fetchMyBookings(sessionToken))
    dispatch(fetchTrackedRoutes(sessionToken))
  }, [dispatch, sessionToken])

  const now = new Date()

  const upcomingBookings = bookings
    .filter(b => new Date(b.departure_time) >= now)
    .sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime())

  const pastBookings = bookings
    .filter(b => new Date(b.departure_time) < now)
    .sort((a, b) => new Date(b.departure_time).getTime() - new Date(a.departure_time).getTime())

  const handleCancelClick = useCallback((booking: BookingTrip) => {
    dispatch(clearCancelError())
    setCancelTarget(booking)
  }, [dispatch])

  const handleConfirmCancel = useCallback(async () => {
    if (!cancelTarget) return
    const result = await dispatch(cancelBooking({ bookingId: cancelTarget.id, sessionToken }))
    if (cancelBooking.fulfilled.match(result)) {
      setCancelTarget(null)
    }
  }, [dispatch, cancelTarget, sessionToken])

  const handleDismissCancel = useCallback(() => {
    setCancelTarget(null)
    dispatch(clearCancelError())
  }, [dispatch])

  const handleUntrack = useCallback((routeId: string) => {
    dispatch(untrackRoute({ routeId, sessionToken }))
  }, [dispatch, sessionToken])

  const renderContent = () => {
    if (activeTab === 'upcoming') {
      if (loading) {
        return <div className="my-trips__loading" data-testid="trips-loading">Loading...</div>
      }
      if (upcomingBookings.length === 0) {
        return (
          <div className="my-trips__empty" data-testid="trips-empty-upcoming">
            <div className="my-trips__empty-icon">✈</div>
            <p className="my-trips__empty-text">No upcoming trips</p>
            <p className="my-trips__empty-subtext">Search for flights to plan your next trip!</p>
          </div>
        )
      }
      return (
        <div className="my-trips__list" data-testid="trips-upcoming-list">
          {upcomingBookings.map(booking => (
            <TripCard
              key={booking.id}
              booking={booking}
              showCancelButton={true}
              onCancel={handleCancelClick}
            />
          ))}
        </div>
      )
    }

    if (activeTab === 'past') {
      if (loading) {
        return <div className="my-trips__loading" data-testid="trips-loading">Loading...</div>
      }
      if (pastBookings.length === 0) {
        return (
          <div className="my-trips__empty" data-testid="trips-empty-past">
            <div className="my-trips__empty-icon">📋</div>
            <p className="my-trips__empty-text">No past trips yet</p>
            <p className="my-trips__empty-subtext">Your completed trips will appear here.</p>
          </div>
        )
      }
      return (
        <div className="my-trips__list" data-testid="trips-past-list">
          {pastBookings.map(booking => (
            <TripCard
              key={booking.id}
              booking={booking}
              showCancelButton={false}
            />
          ))}
        </div>
      )
    }

    if (activeTab === 'tracked') {
      if (trackedLoading) {
        return <div className="my-trips__loading" data-testid="trips-loading">Loading...</div>
      }
      if (trackedRoutes.length === 0) {
        return (
          <div className="my-trips__empty" data-testid="trips-empty-tracked">
            <div className="my-trips__empty-icon">📍</div>
            <p className="my-trips__empty-text">No tracked routes</p>
            <p className="my-trips__empty-subtext">
              Use the &quot;Track prices&quot; button on search results to start tracking.
            </p>
          </div>
        )
      }
      return (
        <div className="my-trips__list" data-testid="trips-tracked-list">
          {trackedRoutes.map(route => (
            <TrackedRouteCard
              key={route.id}
              route={route}
              onUntrack={handleUntrack}
              isUntracking={untrackingRouteId === route.id}
            />
          ))}
        </div>
      )
    }

    return null
  }

  return (
    <div className="my-trips-page" data-testid="my-trips-page">
      <h1 className="my-trips__title">My Trips</h1>
      <TripsTabs />
      {renderContent()}

      {cancelTarget && (
        <CancelBookingModal
          booking={cancelTarget}
          onConfirm={handleConfirmCancel}
          onDismiss={handleDismissCancel}
          isCancelling={cancellingBookingId === cancelTarget.id}
          error={cancelError}
        />
      )}
    </div>
  )
}

export default MyTripsPage
