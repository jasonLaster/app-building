import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import type { Property } from '../slices/propertiesSlice'
import FavoriteButton from './FavoriteButton'

interface PropertyCardProps {
  property: Property
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const rating = Number(property.avg_rating) || 0
  const reviewCount = property.review_count || 0

  return (
    <article
      data-testid={`property-card-${property.id}`}
      className="group"
    >
      <Link
        to={`/properties/${property.id}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
        aria-label={`${property.title} in ${property.city}, ${property.country} — $${Number(property.price_per_night).toFixed(0)} per night`}
      >
        <div className="relative aspect-square overflow-hidden rounded-xl">
          {property.main_image ? (
            <img
              src={property.main_image}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-bg-secondary flex items-center justify-center text-text-secondary text-sm">
              No image
            </div>
          )}
          <FavoriteButton propertyId={property.id} />
          <span
            data-testid={`property-type-badge-${property.id}`}
            className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-semibold text-text shadow-sm"
          >
            {property.property_type}
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-semibold text-text text-[15px] leading-tight truncate">
              {property.city}, {property.country}
            </h3>
            {reviewCount > 0 ? (
              <div className="flex items-center gap-1 shrink-0">
                <Star size={12} className="fill-text text-text" aria-hidden="true" />
                <span className="text-sm text-text">{rating.toFixed(2)}</span>
                <span className="text-sm text-text-secondary">({reviewCount})</span>
              </div>
            ) : (
              <span className="text-sm text-text-secondary shrink-0">New</span>
            )}
          </div>
          <p className="text-text-secondary text-sm mt-0.5 truncate">{property.title}</p>
          <p className="text-text-secondary text-sm">
            {property.beds} {property.beds === 1 ? 'bed' : 'beds'}
          </p>
          <p className="mt-1 text-[15px]">
            <span className="font-semibold text-text">${Number(property.price_per_night).toFixed(0)}</span>
            <span className="text-text"> / night</span>
          </p>
        </div>
      </Link>
    </article>
  )
}
