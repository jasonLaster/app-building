import { useEffect } from 'react'
import type { BookingTrip } from '../slices/tripsSlice'
import './CancelBookingModal.css'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface CancelBookingModalProps {
  booking: BookingTrip
  onConfirm: () => void
  onDismiss: () => void
  isCancelling: boolean
  error: string | null
}

function CancelBookingModal({ booking, onConfirm, onDismiss, isCancelling, error }: CancelBookingModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onDismiss])

  return (
    <div
      className="cancel-modal__overlay"
      onClick={onDismiss}
      data-testid="cancel-modal-overlay"
    >
      <div
        className="cancel-modal"
        onClick={(e) => e.stopPropagation()}
        data-testid="cancel-booking-modal"
      >
        <h2 className="cancel-modal__title">Cancel Booking</h2>
        <p className="cancel-modal__message">
          Are you sure you want to cancel this booking?
        </p>

        <div className="cancel-modal__details" data-testid="cancel-modal-details">
          <div className="cancel-modal__detail-row">
            <span className="cancel-modal__label">Route</span>
            <span className="cancel-modal__value">{booking.origin_code} → {booking.dest_code}</span>
          </div>
          <div className="cancel-modal__detail-row">
            <span className="cancel-modal__label">Date</span>
            <span className="cancel-modal__value">{formatDate(booking.departure_time)}</span>
          </div>
          <div className="cancel-modal__detail-row">
            <span className="cancel-modal__label">Flight</span>
            <span className="cancel-modal__value">{booking.airline_name} {booking.flight_number}</span>
          </div>
          <div className="cancel-modal__detail-row">
            <span className="cancel-modal__label">Reference</span>
            <span className="cancel-modal__value cancel-modal__value--mono">{booking.booking_reference}</span>
          </div>
        </div>

        {error && (
          <div className="cancel-modal__error" data-testid="cancel-modal-error">
            {error}
          </div>
        )}

        <div className="cancel-modal__actions">
          <button
            className="cancel-modal__btn cancel-modal__btn--dismiss"
            onClick={onDismiss}
            disabled={isCancelling}
            data-testid="cancel-modal-keep"
          >
            Keep Booking
          </button>
          <button
            className="cancel-modal__btn cancel-modal__btn--confirm"
            onClick={onConfirm}
            disabled={isCancelling}
            data-testid="cancel-modal-confirm"
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CancelBookingModal
