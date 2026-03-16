import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { fetchUserBookings, cancelBooking } from '../slices/bookingsSlice'
import type { Booking } from '../slices/bookingsSlice'
import TripsTabs from '../components/TripsTabs'
import CancelBookingDialog from '../components/CancelBookingDialog'

export default function MyTrips() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { currentUser } = useSelector((state: RootState) => state.auth)
  const { items: bookings, loading, loadingMore, total, page } = useSelector((state: RootState) => state.bookings)
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null)

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    dispatch(fetchUserBookings({ guestId: currentUser.id, page: 1 }))
  }, [currentUser, dispatch, navigate])

  if (!currentUser) {
    return null
  }

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return
    await dispatch(cancelBooking(cancelTarget.id))
    setCancelTarget(null)
  }

  const hasMore = bookings.length < total

  const handleLoadMore = () => {
    if (currentUser && hasMore) {
      dispatch(fetchUserBookings({ guestId: currentUser.id, page: page + 1 }))
    }
  }

  return (
    <main className="max-w-[1120px] mx-auto px-6 max-sm:px-3 py-8" data-testid="my-trips-page">
      <h1 className="text-[32px] max-sm:text-[24px] font-bold text-text mb-8 max-sm:mb-5">Trips</h1>

      <div aria-live="polite">
        {loading ? (
          <div className="text-center py-12 text-text-secondary" role="status">Loading trips...</div>
        ) : (
          <TripsTabs
            bookings={bookings}
            onCancelBooking={(booking) => setCancelTarget(booking)}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={handleLoadMore}
          />
        )}
      </div>

      {cancelTarget && (
        <CancelBookingDialog
          booking={cancelTarget}
          onConfirm={handleCancelConfirm}
          onDismiss={() => setCancelTarget(null)}
        />
      )}
    </main>
  )
}
