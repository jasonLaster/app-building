import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { submitReview } from '../slices/reviewFormSlice'
import RatingSliders from './RatingSliders'
import type { Ratings } from './RatingSliders'
import type { BookingDetail } from '../slices/reviewFormSlice'

interface ReviewFormProps {
  booking: BookingDetail
}

const DEFAULT_RATINGS: Ratings = {
  rating: 3,
  cleanliness: 3,
  accuracy: 3,
  communication: 3,
  location: 3,
  value: 3,
}

export default function ReviewForm({ booking }: ReviewFormProps) {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { submitting, error } = useSelector((state: RootState) => state.reviewForm)
  const { currentUser } = useSelector((state: RootState) => state.auth)

  const [ratings, setRatings] = useState<Ratings>(DEFAULT_RATINGS)
  const [comment, setComment] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!currentUser) return

    setValidationError(null)

    const result = await dispatch(
      submitReview({
        booking_id: booking.id,
        property_id: booking.property_id,
        guest_id: currentUser.id,
        rating: ratings.rating,
        cleanliness: ratings.cleanliness,
        accuracy: ratings.accuracy,
        communication: ratings.communication,
        location: ratings.location,
        value: ratings.value,
        comment: comment.trim() || undefined,
      })
    )

    if (submitReview.fulfilled.match(result)) {
      navigate('/trips')
    }
  }

  return (
    <div data-testid="review-form" className="space-y-6">
      <RatingSliders ratings={ratings} onChange={setRatings} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-text" htmlFor="review-comment">
          Your review
        </label>
        <textarea
          id="review-comment"
          data-testid="review-comment-textarea"
          placeholder="Tell others about your experience"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text placeholder:text-text-secondary focus:outline-none focus:border-primary resize-y"
        />
      </div>

      {(error || validationError) && (
        <p data-testid="review-form-error" className="text-sm text-error">
          {validationError || error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          data-testid="submit-review-button"
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
        <button
          data-testid="cancel-review-button"
          onClick={() => navigate('/trips')}
          className="px-6 py-2.5 rounded-lg border border-border text-text font-medium text-sm hover:bg-bg-secondary transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
