import { Shield, Home } from 'lucide-react'
import type { Property } from '../slices/propertiesSlice'

interface HostInfoCardProps {
  property: Property
}

function formatMemberSince(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function getYearsHosting(dateStr: string): number {
  const date = new Date(dateStr)
  return Math.max(1, Math.floor((Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000)))
}

export default function HostInfoCard({ property }: HostInfoCardProps) {
  const listingCount = property.host_listing_count || 0

  return (
    <section id="host-info-card" data-testid="host-info-card" className="py-6">
      <h2 className="text-lg font-semibold text-text mb-4">Meet your host</h2>
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          {property.host_avatar ? (
            <img
              src={property.host_avatar}
              alt={property.host_name || 'Host'}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center text-xl font-semibold text-text-secondary">
              {property.host_name?.charAt(0) || 'H'}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-text text-lg">{property.host_name}</h3>
          {property.host_since && (
            <>
              <p className="text-text-secondary text-sm flex items-center gap-1 mt-1">
                <Shield size={14} aria-hidden="true" />
                {getYearsHosting(property.host_since)} {getYearsHosting(property.host_since) === 1 ? 'year' : 'years'} hosting
              </p>
              <p className="text-text-secondary text-xs mt-0.5">
                Member since {formatMemberSince(property.host_since)}
              </p>
            </>
          )}
          <div className="flex items-center gap-1 text-text-secondary text-sm mt-1">
            <Home size={14} aria-hidden="true" />
            <span>{listingCount} {listingCount === 1 ? 'listing' : 'listings'}</span>
          </div>
          {property.host_bio && (
            <p className="text-text-secondary text-sm mt-3 leading-relaxed">{property.host_bio}</p>
          )}
        </div>
      </div>
    </section>
  )
}
