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
      <div className="p-6 max-sm:p-3 max-w-2xl mx-auto" data-testid="write-review-page">
        <div className="text-center py-12 text-text-secondary">Loading booking details...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-sm:p-3 max-w-2xl mx-auto" data-testid="write-review-page">
        <div className="text-center py-12">
          <p data-testid="review-page-error" className="text-error text-lg font-medium mb-4">{error}</p>
          <Link
            to="/trips"
            className="text-primary hover:text-primary-dark font-medium underline"
          >
            Back to My Trips
          </Link>
        </div>
      </div>
    )
  }

  if (submitSuccess) {
    return (
      <div className="p-6 max-sm:p-3 max-w-2xl mx-auto" data-testid="write-review-page">
        <div className="text-center py-12">
          <p data-testid="review-success-message" className="text-success text-lg font-medium mb-4">
            Review submitted successfully
          </p>
          <Link
            to="/trips"
            className="text-primary hover:text-primary-dark font-medium underline"
          >
            Back to My Trips
          </Link>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="p-6 max-sm:p-3 max-w-2xl mx-auto" data-testid="write-review-page">
        <div className="text-center py-12 text-text-secondary">Booking not found</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-sm:p-3 max-w-2xl mx-auto" data-testid="write-review-page">
      <h1 className="text-2xl font-bold text-text mb-6">Write a Review</h1>
      <div className="mb-6">
        <PropertyBookingContext booking={booking} />
      </div>
      <ReviewForm booking={booking} />
    </div>
  )
}
