import { Star } from 'lucide-react'
import type { Property } from '../slices/propertiesSlice'

interface PropertyHeaderProps {
  property: Property
}

export default function PropertyHeader({ property }: PropertyHeaderProps) {
  const rating = Number(property.avg_rating) || 0
  const reviewCount = property.review_count || 0

  const scrollToReviews = () => {
    const el = document.getElementById('reviews-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const hostingSince = property.host_since ? new Date(property.host_since) : null
  const yearsHosting = hostingSince
    ? Math.max(1, Math.floor((Date.now() - hostingSince.getTime()) / (365.25 * 24 * 60 * 60 * 1000)))
    : null

  return (
    <div data-testid="property-header" className="pb-6 border-b border-border">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-[22px] font-semibold text-text">
            {property.property_type} in {property.city}, {property.country}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {property.max_guests} {property.max_guests === 1 ? 'guest' : 'guests'} · {property.bedrooms} {property.bedrooms === 1 ? 'bedroom' : 'bedrooms'} · {property.beds} {property.beds === 1 ? 'bed' : 'beds'} · {property.bathrooms} {property.bathrooms === 1 ? 'bath' : 'baths'}
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-sm">
            {reviewCount > 0 ? (
              <button
                data-testid="review-count-link"
                className="flex items-center gap-1 hover:underline cursor-pointer"
                onClick={scrollToReviews}
              >
                <Star size={14} className="fill-text text-text" />
                <span className="font-semibold text-text">{rating.toFixed(2)}</span>
                <span className="text-text-secondary">·</span>
                <span className="text-text-secondary underline">{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</span>
              </button>
            ) : (
              <span className="text-text-secondary">New</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border">
        <button data-testid="host-info" className="flex items-center gap-3 cursor-pointer" onClick={() => {
          const el = document.getElementById('host-info-card')
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }}>
          {property.host_avatar ? (
            <img
              data-testid="host-avatar"
              src={property.host_avatar}
              alt={property.host_name || 'Host'}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div data-testid="host-avatar" className="w-10 h-10 rounded-full bg-text flex items-center justify-center text-sm font-semibold text-white">
              {property.host_name?.charAt(0) || 'H'}
            </div>
          )}
          <div className="text-left">
            <p className="text-sm font-semibold text-text">Hosted by {property.host_name}</p>
            {yearsHosting && (
              <p className="text-xs text-text-secondary">{yearsHosting} {yearsHosting === 1 ? 'year' : 'years'} hosting</p>
            )}
          </div>
        </button>
      </div>
    </div>
  )
}
