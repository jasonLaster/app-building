import { Loader2 } from 'lucide-react'
import type { Property } from '../slices/propertiesSlice'
import PropertyCard from './PropertyCard'

interface PropertyGridProps {
  properties: Property[]
  loading: boolean
}

export default function PropertyGrid({ properties, loading }: PropertyGridProps) {
  if (loading) {
    return (
      <div data-testid="property-grid-loading" className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div data-testid="property-grid-empty" className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold text-text mb-2">No properties found</p>
        <p className="text-text-secondary text-sm">Try adjusting your filters or search criteria</p>
      </div>
    )
  }

  return (
    <div
      data-testid="property-grid"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}
