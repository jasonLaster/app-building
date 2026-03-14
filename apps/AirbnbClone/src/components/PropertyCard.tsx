import { useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import type { Property } from '../slices/propertiesSlice'
import FavoriteButton from './FavoriteButton'

interface PropertyCardProps {
  property: Property
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const navigate = useNavigate()
  const rating = Number(property.avg_rating) || 0
  const reviewCount = property.review_count || 0

  return (
    <div
      data-testid={`property-card-${property.id}`}
      className="cursor-pointer rounded-xl overflow-visible group"
      onClick={() => navigate(`/properties/${property.id}`)}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
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
        <span
          data-testid={`property-type-badge-${property.id}`}
          className="absolute top-3 left-3 bg-white/90 text-text text-xs font-semibold px-2.5 py-1 rounded-full"
        >
          {property.property_type}
        </span>
        <FavoriteButton propertyId={property.id} />
      </div>
      <div className="mt-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-text text-sm truncate">{property.title}</h3>
          {reviewCount > 0 ? (
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <Star size={14} className="fill-text text-text" />
              <span className="text-sm font-medium text-text">{rating.toFixed(1)}</span>
              <span className="text-sm text-text-secondary">({reviewCount})</span>
            </div>
          ) : (
            <span className="text-sm text-text-secondary shrink-0 ml-2">New</span>
          )}
        </div>
        <p className="text-text-secondary text-sm mt-0.5">
          {property.city}, {property.country}
        </p>
        <p className="mt-1 text-sm">
          <span className="font-semibold text-text">${Number(property.price_per_night).toFixed(0)}</span>
          <span className="text-text-secondary"> / night</span>
        </p>
      </div>
    </div>
  )
}
