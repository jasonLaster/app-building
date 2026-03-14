import type { BookingTrip } from '../slices/tripsSlice'
import './TripCard.css'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'confirmed': return 'trip-card__status--confirmed'
    case 'completed': return 'trip-card__status--completed'
    case 'cancelled': return 'trip-card__status--cancelled'
    default: return ''
  }
}

interface TripCardProps {
  booking: BookingTrip
  showCancelButton: boolean
  onCancel?: (booking: BookingTrip) => void
}

function TripCard({ booking, showCancelButton, onCancel }: TripCardProps) {
  const isRoundTrip = !!booking.return_flight_id

  return (
    <div className="trip-card" data-testid={`trip-card-${booking.id}`}>
      <div className="trip-card__header">
        <div className="trip-card__airline">
          <div
            className="trip-card__airline-logo"
            style={{ backgroundColor: booking.logo_color || '#1A73E8' }}
            data-testid={`trip-card-airline-logo-${booking.id}`}
          >
            {booking.airline_code}
          </div>
          <div className="trip-card__airline-info">
            <span className="trip-card__airline-name">{booking.airline_name}</span>
            <span className="trip-card__flight-number">{booking.flight_number}</span>
          </div>
        </div>
        <span
          className={`trip-card__status ${getStatusClass(booking.status)}`}
          data-testid={`trip-card-status-${booking.id}`}
        >
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
      </div>

      <div className="trip-card__route">
        <span className="trip-card__route-text" data-testid={`trip-card-route-${booking.id}`}>
          {booking.origin_code} → {booking.dest_code}
        </span>
        <span className="trip-card__dates" data-testid={`trip-card-dates-${booking.id}`}>
          {formatDate(booking.departure_time)}
          {isRoundTrip && booking.return_departure_time
            ? ` – ${formatDate(booking.return_departure_time)}`
            : ''}
        </span>
      </div>

      <div className="trip-card__footer">
        <div className="trip-card__details">
          <span className="trip-card__price" data-testid={`trip-card-price-${booking.id}`}>
            {formatPrice(booking.total_price_cents)}
          </span>
          <span className="trip-card__ref" data-testid={`trip-card-ref-${booking.id}`}>
            {booking.booking_reference}
          </span>
        </div>
        {showCancelButton && booking.status === 'confirmed' && (
          <button
            className="trip-card__cancel-btn"
            onClick={() => onCancel?.(booking)}
            data-testid={`trip-card-cancel-${booking.id}`}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

export default TripCard
