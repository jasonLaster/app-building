import { useEffect, useRef } from 'react'
import type { Booking } from '../slices/bookingsSlice'

interface CancelBookingDialogProps {
  booking: Booking
  onConfirm: () => void
  onDismiss: () => void
}

function formatDateRange(checkIn: string, checkOut: string): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' }
  const inDate = new Date(checkIn.split('T')[0] + 'T12:00:00')
  const outDate = new Date(checkOut.split('T')[0] + 'T12:00:00')
  const inStr = inDate.toLocaleDateString('en-US', opts)
  const outStr = outDate.toLocaleDateString('en-US', opts)
  return `${inStr} – ${outStr}`
}

export default function CancelBookingDialog({ booking, onConfirm, onDismiss }: CancelBookingDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const dismissRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    dismissRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss()
        return
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onDismiss])

  return (
    <div
      data-testid="cancel-dialog-overlay"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onDismiss}
      role="presentation"
    >
      <div
        ref={dialogRef}
        data-testid="cancel-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-dialog-title"
        className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="cancel-dialog-title" className="text-lg font-semibold text-text mb-2">Cancel Booking</h2>
        <p className="text-text-secondary mb-4">
          Are you sure you want to cancel this booking?
        </p>
        <div className="bg-bg-secondary rounded-lg p-3 mb-6">
          <p className="font-medium text-text">{booking.property_title || 'Untitled Property'}</p>
          <p className="text-sm text-text-secondary mt-1">
            {formatDateRange(booking.check_in, booking.check_out)}
          </p>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            ref={dismissRef}
            data-testid="cancel-dialog-dismiss"
            onClick={onDismiss}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text hover:bg-bg-secondary transition-colors"
          >
            Keep Booking
          </button>
          <button
            data-testid="cancel-dialog-confirm"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-status-cancelled text-white hover:bg-status-cancelled/90 transition-colors"
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
