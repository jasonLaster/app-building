import { Calendar, MapPin, Users } from 'lucide-react'
import type { BookingDetail } from '../slices/reviewFormSlice'

interface PropertyBookingContextProps {
  booking: BookingDetail
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr.split('T')[0] + 'T12:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function calcNights(checkIn: string, checkOut: string): number {
  const inDate = new Date(checkIn.split('T')[0] + 'T12:00:00')
  const outDate = new Date(checkOut.split('T')[0] + 'T12:00:00')
  return Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24))
}

export default function PropertyBookingContext({ booking }: PropertyBookingContextProps) {
  const nights = calcNights(booking.check_in, booking.check_out)

  return (
    <div data-testid="property-booking-context" className="flex max-sm:flex-col gap-4 max-sm:gap-0 rounded-xl border border-border">
      <div className="w-40 h-32 max-sm:w-full max-sm:h-40 shrink-0 overflow-hidden rounded-l-xl max-sm:rounded-l-none max-sm:rounded-t-xl">
        {booking.property_image ? (
          <img
            src={booking.property_image}
            alt={booking.property_title}
            className="w-full h-full object-cover"
            data-testid="booking-context-image"
          />
        ) : (
          <div className="w-full h-full bg-bg-secondary flex items-center justify-center text-text-secondary text-sm">
            No image
          </div>
        )}
      </div>

      <div className="flex-1 py-3 pr-4 max-sm:px-3 max-sm:pb-3 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="font-semibold text-text text-lg" data-testid="booking-context-title">
            {booking.property_title}
          </h3>
          <p className="flex items-center gap-1 text-sm text-text-secondary mt-1" data-testid="booking-context-location">
            <MapPin size={14} aria-hidden="true" />
            {booking.property_city}{booking.property_country ? `, ${booking.property_country}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-text-secondary">
          <span className="flex items-center gap-1" data-testid="booking-context-dates">
            <Calendar size={14} aria-hidden="true" />
            {formatDate(booking.check_in)} – {formatDate(booking.check_out)} ({nights} {nights === 1 ? 'night' : 'nights'})
          </span>
          <span className="flex items-center gap-1" data-testid="booking-context-guests">
            <Users size={14} aria-hidden="true" />
            {booking.num_guests} {booking.num_guests === 1 ? 'guest' : 'guests'}
          </span>
          <span className="font-semibold text-text" data-testid="booking-context-price">
            ${Number(booking.total_price).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}
