import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { fetchBookingForReview, resetReviewForm } from '../slices/reviewFormSlice'
import PropertyBookingContext from '../components/PropertyBookingContext'
import ReviewForm from '../components/ReviewForm'

export default function WriteReview() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { currentUser } = useSelector((state: RootState) => state.auth)
  const { booking, loading, error, submitSuccess } = useSelector((state: RootState) => state.reviewForm)

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    if (bookingId) {
      dispatch(fetchBookingForReview({ bookingId, guestId: currentUser.id }))
    }
    return () => {
      dispatch(resetReviewForm())
    }
  }, [currentUser, bookingId, dispatch, navigate])

  if (!currentUser) {
    return null
  }

  if (loading) {
    return (
      <main className="max-w-[1120px] mx-auto px-6 max-sm:px-3 py-8" data-testid="write-review-page">
        <div className="text-center py-12 text-text-secondary" aria-live="polite">Loading booking details...</div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="max-w-[1120px] mx-auto px-6 max-sm:px-3 py-8" data-testid="write-review-page">
        <div className="text-center py-12">
          <p data-testid="review-page-error" role="alert" className="text-error text-lg font-medium mb-4">{error}</p>
          <Link
            to="/trips"
            className="text-primary hover:text-primary-dark font-semibold underline"
          >
            Back to My Trips
          </Link>
        </div>
      </main>
    )
  }

  if (submitSuccess) {
    return (
      <main className="max-w-[1120px] mx-auto px-6 max-sm:px-3 py-8" data-testid="write-review-page">
        <div className="text-center py-12" aria-live="polite">
          <p data-testid="review-success-message" className="text-success text-lg font-semibold mb-4">
            Review submitted successfully
          </p>
          <Link
            to="/trips"
            className="text-primary hover:text-primary-dark font-semibold underline"
          >
            Back to My Trips
          </Link>
        </div>
      </main>
    )
  }

  if (!booking) {
    return (
      <main className="max-w-[1120px] mx-auto px-6 max-sm:px-3 py-8" data-testid="write-review-page">
        <div className="text-center py-12 text-text-secondary">Booking not found</div>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-6 max-sm:px-3 py-8" data-testid="write-review-page">
      <h1 className="text-[24px] max-sm:text-[20px] font-semibold text-text mb-6">Write a Review</h1>
      <section className="mb-8 rounded-xl border border-border p-5 max-sm:p-3" aria-label="Booking details">
        <PropertyBookingContext booking={booking} />
      </section>
      <ReviewForm booking={booking} />
    </main>
  )
}
