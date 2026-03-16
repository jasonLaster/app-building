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
      <div data-testid="property-grid-loading" role="status" aria-live="polite" className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Loading properties</span>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div data-testid="property-grid-empty" role="status" className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold text-text mb-2">No properties found</p>
        <p className="text-text-secondary text-sm">Try adjusting your filters or search criteria</p>
      </div>
    )
  }

  return (
    <section
      data-testid="property-grid"
      aria-label="Property listings"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </section>
  )
}
