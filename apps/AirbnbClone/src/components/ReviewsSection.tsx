import { useState } from 'react'
import { Star } from 'lucide-react'
import type { Review } from '../slices/propertiesSlice'

interface ReviewsSectionProps {
  reviews: Review[]
}

const INITIAL_SHOW = 6

const CATEGORIES: { key: keyof Review; label: string }[] = [
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'communication', label: 'Communication' },
  { key: 'location', label: 'Location' },
  { key: 'value', label: 'Value' },
]

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function avgRating(reviews: Review[], key: keyof Review): number {
  const sum = reviews.reduce((acc, r) => acc + Number(r[key]), 0)
  return sum / reviews.length
}

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const [showAll, setShowAll] = useState(false)

  if (reviews.length === 0) {
    return (
      <section id="reviews-section" data-testid="reviews-section" className="py-8 border-b border-border">
        <h2 className="text-[22px] font-semibold text-text mb-3">Reviews</h2>
        <p className="text-text-secondary">No reviews yet</p>
      </section>
    )
  }

  const overallAvg = reviews.reduce((acc, r) => acc + Number(r.rating), 0) / reviews.length
  const displayReviews = showAll ? reviews : reviews.slice(0, INITIAL_SHOW)

  return (
    <section id="reviews-section" data-testid="reviews-section" className="py-8 border-b border-border">
      <div className="flex items-center gap-2 mb-6">
        <Star size={22} className="fill-text text-text" aria-hidden="true" />
        <h2 className="text-[22px] font-semibold text-text">
          {overallAvg.toFixed(1)} · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-4 mb-8">
        {CATEGORIES.map(({ key, label }) => {
          const avg = avgRating(reviews, key)
          return (
            <div key={key} data-testid={`rating-category-${key}`} className="flex items-center justify-between text-sm">
              <span className="text-text">{label}</span>
              <div className="flex items-center gap-2">
                <div className="w-28 h-1 bg-border rounded-full overflow-hidden" role="meter" aria-label={`${label} rating`} aria-valuenow={avg} aria-valuemin={0} aria-valuemax={5}>
                  <div
                    className="h-full bg-text rounded-full"
                    style={{ width: `${(avg / 5) * 100}%` }}
                  />
                </div>
                <span className="font-medium text-text text-xs w-6 text-right">{avg.toFixed(1)}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        {displayReviews.map((review) => (
          <div key={review.id} data-testid={`review-card-${review.id}`} className="space-y-3">
            <div className="flex items-center gap-3">
              {review.guest_avatar ? (
                <img
                  src={review.guest_avatar}
                  alt={review.guest_name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-text flex items-center justify-center text-sm font-bold text-white">
                  {review.guest_name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold text-text text-sm">{review.guest_name}</p>
                <p className="text-text-secondary text-xs">{formatDate(review.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-0.5" role="img" aria-label={`${Number(review.rating)} out of 5 stars`}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  size={12}
                  aria-hidden="true"
                  className={i < Number(review.rating) ? 'fill-text text-text' : 'text-border'}
                />
              ))}
            </div>
            {review.comment && (
              <p className="text-text text-sm leading-relaxed">{review.comment}</p>
            )}
          </div>
        ))}
      </div>

      {reviews.length > INITIAL_SHOW && (
        <button
          data-testid="reviews-toggle"
          className="mt-8 px-6 py-3 rounded-lg border border-text text-sm font-semibold text-text hover:bg-bg-secondary transition-colors cursor-pointer"
          onClick={() => setShowAll(!showAll)}
          aria-expanded={showAll}
        >
          {showAll ? 'Show less' : `Show all ${reviews.length} reviews`}
        </button>
      )}
    </section>
  )
}
