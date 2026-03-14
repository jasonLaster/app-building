import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin } from 'lucide-react'
import type { Booking } from '../slices/bookingsSlice'

interface TripCardProps {
  booking: Booking
  onCancel: () => void
}

function formatDateRange(checkIn: string, checkOut: string): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
  const inDate = new Date(checkIn.split('T')[0] + 'T12:00:00')
  const outDate = new Date(checkOut.split('T')[0] + 'T12:00:00')
  const inStr = inDate.toLocaleDateString('en-US', opts)
  const outStr = outDate.toLocaleDateString('en-US', opts)
  return `${inStr} – ${outStr}`
}

const statusColors: Record<string, string> = {
  pending: 'bg-status-pending/15 text-status-pending',
  confirmed: 'bg-status-confirmed/15 text-status-confirmed',
  cancelled: 'bg-status-cancelled/15 text-status-cancelled',
  completed: 'bg-status-completed/15 text-status-completed',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
}

export default function TripCard({ booking, onCancel }: TripCardProps) {
  const navigate = useNavigate()
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed'
  const canReview = booking.status === 'completed' && !booking.has_review

  const handleCardClick = () => {
    navigate(`/properties/${booking.property_id}`)
  }

  return (
    <div
      data-testid={`trip-card-${booking.id}`}
      className="flex gap-4 rounded-xl border border-border hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="w-40 h-32 shrink-0 overflow-hidden rounded-l-xl">
        {booking.property_image ? (
          <img
            src={booking.property_image}
            alt={booking.property_title || 'Property'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-bg-secondary flex items-center justify-center text-text-secondary text-sm">
            No image
          </div>
        )}
      </div>

      <div className="flex-1 py-3 pr-4 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-text truncate">
              {booking.property_title || 'Untitled Property'}
            </h3>
            <span
              data-testid={`status-badge-${booking.id}`}
              className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[booking.status] || ''}`}
            >
              {statusLabels[booking.status] || booking.status}
            </span>
          </div>
          {booking.property_city && (
            <p className="flex items-center gap-1 text-sm text-text-secondary mt-1">
              <MapPin size={14} />
              {booking.property_city}
              {booking.property_country ? `, ${booking.property_country}` : ''}
            </p>
          )}
          <p className="flex items-center gap-1 text-sm text-text-secondary mt-1">
            <Calendar size={14} />
            {formatDateRange(booking.check_in, booking.check_out)}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-sm font-semibold text-text">
            ${Number(booking.total_price).toFixed(0)}
          </p>
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            {canCancel && (
              <button
                data-testid={`cancel-button-${booking.id}`}
                onClick={onCancel}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-status-cancelled text-status-cancelled hover:bg-status-cancelled/10 transition-colors"
              >
                Cancel
              </button>
            )}
            {canReview && (
              <button
                data-testid={`review-button-${booking.id}`}
                onClick={() => navigate(`/trips/${booking.id}/review`)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
              >
                Write Review
              </button>
            )}
            {booking.status === 'completed' && booking.has_review && (
              <span
                data-testid={`reviewed-badge-${booking.id}`}
                className="text-xs font-medium px-3 py-1.5 text-status-confirmed"
              >
                Reviewed ✓
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
