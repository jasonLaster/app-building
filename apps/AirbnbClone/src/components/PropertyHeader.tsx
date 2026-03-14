import { Star, MapPin } from 'lucide-react'
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
    <div data-testid="property-header">
      <h1 className="text-2xl font-semibold text-text">{property.title}</h1>
      <div className="flex flex-wrap items-center gap-2 mt-2 text-sm">
        <div className="flex items-center gap-1">
          <MapPin size={16} className="text-text-secondary" />
          <span className="text-text-secondary">{property.city}, {property.country}</span>
        </div>
        <span className="text-text-secondary">·</span>
        {reviewCount > 0 ? (
          <button
            data-testid="review-count-link"
            className="flex items-center gap-1 hover:underline cursor-pointer"
            onClick={scrollToReviews}
          >
            <Star size={14} className="fill-text text-text" />
            <span className="font-medium text-text">{rating.toFixed(1)}</span>
            <span className="text-text-secondary">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
          </button>
        ) : (
          <span className="text-text-secondary">New</span>
        )}
        <span className="text-text-secondary">·</span>
        <button data-testid="host-info" className="flex items-center gap-2 cursor-pointer" onClick={() => {
          const el = document.getElementById('host-info-card')
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }}>
          {property.host_avatar ? (
            <img
              data-testid="host-avatar"
              src={property.host_avatar}
              alt={property.host_name || 'Host'}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div data-testid="host-avatar" className="w-6 h-6 rounded-full bg-bg-secondary flex items-center justify-center text-xs font-semibold text-text-secondary">
              {property.host_name?.charAt(0) || 'H'}
            </div>
          )}
          <span className="text-text-secondary">Hosted by <span className="font-medium text-text">{property.host_name}</span></span>
        </button>
      </div>
    </div>
  )
}
