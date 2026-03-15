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

  return (
    <div data-testid="property-header" className="pb-6 border-b border-border">
      <h2 className="text-[22px] font-semibold text-text">
        {property.property_type} in {property.city}, {property.country}
      </h2>
      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-sm">
        <span className="text-text-secondary">
          {property.max_guests} {property.max_guests === 1 ? 'guest' : 'guests'} · {property.bedrooms} {property.bedrooms === 1 ? 'bedroom' : 'bedrooms'} · {property.beds} {property.beds === 1 ? 'bed' : 'beds'} · {property.bathrooms} {property.bathrooms === 1 ? 'bath' : 'baths'}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mt-2 text-sm">
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

        <span className="text-text-secondary mx-1">·</span>
        <button data-testid="host-info" className="flex items-center gap-2 cursor-pointer" onClick={() => {
          const el = document.getElementById('host-info-card')
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }}>
          <span className="text-text-secondary">Hosted by <span className="font-semibold text-text">{property.host_name}</span></span>
          {property.host_avatar ? (
            <img
              data-testid="host-avatar"
              src={property.host_avatar}
              alt={property.host_name || 'Host'}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div data-testid="host-avatar" className="w-6 h-6 rounded-full bg-text flex items-center justify-center text-xs font-semibold text-white">
              {property.host_name?.charAt(0) || 'H'}
            </div>
          )}
        </button>
      </div>
    </div>
  )
}
