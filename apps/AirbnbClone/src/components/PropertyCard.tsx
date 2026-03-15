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
      className="cursor-pointer group"
      onClick={() => navigate(`/properties/${property.id}`)}
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
      </div>
      <div className="mt-3">
        <div className="flex items-start justify-between gap-1">
          <h3 className="font-semibold text-text text-[15px] leading-tight truncate">
            {property.city}, {property.country}
          </h3>
          {reviewCount > 0 ? (
            <div className="flex items-center gap-1 shrink-0">
              <Star size={12} className="fill-text text-text" />
              <span className="text-sm text-text">{rating.toFixed(2)}</span>
            </div>
          ) : (
            <span className="text-sm text-text-secondary shrink-0">New</span>
          )}
        </div>
        <p className="text-text-secondary text-sm mt-0.5 truncate">{property.title}</p>
        <p className="text-text-secondary text-sm">
          {property.property_type} · {property.bedrooms} {property.bedrooms === 1 ? 'bedroom' : 'bedrooms'} · {property.beds} {property.beds === 1 ? 'bed' : 'beds'}
        </p>
        <p className="mt-1.5 text-[15px]">
          <span className="font-semibold text-text">${Number(property.price_per_night).toFixed(0)}</span>
          <span className="text-text"> night</span>
        </p>
      </div>
    </div>
  )
}
