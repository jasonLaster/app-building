import { useNavigate } from 'react-router-dom'
import { Star, MessageSquare } from 'lucide-react'
import type { UserReview } from '../slices/userReviewsSlice'

interface UserReviewsListProps {
  reviews: UserReview[]
  loading: boolean
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr.split('T')[0] + 'T12:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" data-testid="star-rating" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          aria-hidden="true"
          className={star <= rating ? 'text-primary fill-primary' : 'text-border'}
          fill={star <= rating ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  )
}

export default function UserReviewsList({ reviews, loading }: UserReviewsListProps) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div data-testid="reviews-loading" aria-live="polite" className="text-center py-8 text-text-secondary">
        Loading reviews...
      </div>
    )
  }

  return (
    <section data-testid="user-reviews-list" aria-labelledby="my-reviews-heading">
      <h2 id="my-reviews-heading" className="text-xl max-sm:text-lg font-semibold text-text mb-4 flex items-center gap-2">
        <MessageSquare size={20} aria-hidden="true" />
        My Reviews
      </h2>

      {reviews.length === 0 ? (
        <div data-testid="reviews-empty-state" className="text-center py-8 text-text-secondary border border-border rounded-xl">
          You haven't written any reviews yet
        </div>
      ) : (
        <ul className="space-y-3 list-none p-0 m-0">
          {reviews.map((review) => (
            <li
              key={review.id}
              data-testid={`review-card-${review.id}`}
              className="rounded-xl border border-border p-4 max-sm:p-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2 mb-2 max-sm:flex-col">
                <button
                  data-testid={`review-property-link-${review.id}`}
                  onClick={() => navigate(`/properties/${review.property_id}`)}
                  className="text-primary font-semibold hover:underline text-left"
                >
                  {review.property_title}
                </button>
                <span className="text-xs text-text-secondary whitespace-nowrap">
                  {formatDate(review.created_at)}
                </span>
              </div>

              <StarRating rating={review.rating} />

              {review.comment && (
                <p className="text-sm text-text mt-2">{review.comment}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
