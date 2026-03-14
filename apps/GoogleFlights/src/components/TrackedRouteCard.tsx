import { useNavigate } from 'react-router-dom'
import type { TrackedRoute } from '../slices/tripsSlice'
import './TrackedRouteCard.css'

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr.split('T')[0] + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatPrice(cents: number): string {
  return `$${Math.round(cents / 100)}`
}

interface TrackedRouteCardProps {
  route: TrackedRoute
  onUntrack: (routeId: string) => void
  isUntracking: boolean
}

function TrackedRouteCard({ route, onUntrack, isUntracking }: TrackedRouteCardProps) {
  const navigate = useNavigate()

  const handleSearch = () => {
    const params = new URLSearchParams({
      origin: route.origin_code,
      destination: route.dest_code,
      cabinClass: route.cabin_class || 'economy',
    })
    if (route.departure_date_start) {
      params.set('departureDate', route.departure_date_start.split('T')[0] || '')
    }
    navigate(`/results?${params.toString()}`)
  }

  const dateRange = route.departure_date_start && route.departure_date_end
    ? `${formatDate(route.departure_date_start)} – ${formatDate(route.departure_date_end)}`
    : route.departure_date_start
      ? `From ${formatDate(route.departure_date_start)}`
      : 'Any dates'

  return (
    <div className="tracked-route-card" data-testid={`tracked-route-card-${route.id}`}>
      <div className="tracked-route-card__header">
        <div className="tracked-route-card__route">
          <span className="tracked-route-card__route-text" data-testid={`tracked-route-route-${route.id}`}>
            {route.origin_code} → {route.dest_code}
          </span>
          <span className="tracked-route-card__cities">
            {route.origin_city} to {route.dest_city}
          </span>
        </div>
      </div>

      <div className="tracked-route-card__details">
        <div className="tracked-route-card__date-range" data-testid={`tracked-route-dates-${route.id}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {dateRange}
        </div>

        {route.lowest_price_cents != null && (
          <div className="tracked-route-card__price" data-testid={`tracked-route-price-${route.id}`}>
            <span className="tracked-route-card__price-label">Lowest price</span>
            <span className="tracked-route-card__price-value">
              {formatPrice(route.lowest_price_cents)}
            </span>
          </div>
        )}
      </div>

      <div className="tracked-route-card__actions">
        <button
          className="tracked-route-card__search-btn"
          onClick={handleSearch}
          data-testid={`tracked-route-search-${route.id}`}
        >
          Search
        </button>
        <button
          className="tracked-route-card__untrack-btn"
          onClick={() => onUntrack(route.id)}
          disabled={isUntracking}
          data-testid={`tracked-route-untrack-${route.id}`}
        >
          {isUntracking ? 'Removing...' : 'Untrack'}
        </button>
      </div>
    </div>
  )
}

export default TrackedRouteCard
