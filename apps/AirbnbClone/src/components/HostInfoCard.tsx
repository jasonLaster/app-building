import { Shield, Home, Star } from 'lucide-react'
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
  const rating = Number(property.avg_rating) || 0
  const reviewCount = property.review_count || 0

  return (
    <section id="host-info-card" data-testid="host-info-card" className="py-8">
      <div className="rounded-xl border border-border p-6 max-sm:p-4 shadow-sm">
        <div className="flex items-start gap-6 max-sm:flex-col max-sm:items-center">
          {/* Host avatar + name card */}
          <div className="flex flex-col items-center text-center min-w-[120px]">
            {property.host_avatar ? (
              <img
                src={property.host_avatar}
                alt={property.host_name || 'Host'}
                className="w-[72px] h-[72px] rounded-full object-cover mb-2"
              />
            ) : (
              <div className="w-[72px] h-[72px] rounded-full bg-text flex items-center justify-center text-2xl font-bold text-white mb-2">
                {property.host_name?.charAt(0) || 'H'}
              </div>
            )}
            <h3 className="font-bold text-text text-lg">{property.host_name}</h3>
            <p className="text-text-secondary text-xs mt-0.5">Host</p>
          </div>

          {/* Host stats */}
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-4 mb-4">
              {reviewCount > 0 && (
                <div className="text-center">
                  <p className="text-lg font-bold text-text">{reviewCount}</p>
                  <p className="text-xs text-text-secondary">{reviewCount === 1 ? 'Review' : 'Reviews'}</p>
                </div>
              )}
              {reviewCount > 0 && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <p className="text-lg font-bold text-text">{rating.toFixed(1)}</p>
                    <Star size={12} className="fill-text text-text" aria-hidden="true" />
                  </div>
                  <p className="text-xs text-text-secondary">Rating</p>
                </div>
              )}
              {property.host_since && (
                <div className="text-center">
                  <p className="text-lg font-bold text-text">{getYearsHosting(property.host_since)}</p>
                  <p className="text-xs text-text-secondary">{getYearsHosting(property.host_since) === 1 ? 'Year' : 'Years'} hosting</p>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm text-text-secondary">
              {property.host_since && (
                <p className="flex items-center gap-2">
                  <Shield size={16} aria-hidden="true" />
                  Member since {formatMemberSince(property.host_since)}
                </p>
              )}
              <p className="flex items-center gap-2">
                <Home size={16} aria-hidden="true" />
                {listingCount} {listingCount === 1 ? 'listing' : 'listings'}
              </p>
            </div>
          </div>
        </div>

        {property.host_bio && (
          <p className="text-text text-sm mt-5 pt-5 border-t border-border leading-relaxed">{property.host_bio}</p>
        )}
      </div>
    </section>
  )
}
