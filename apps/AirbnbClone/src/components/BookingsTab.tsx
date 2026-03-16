import { useState, useEffect, useRef, useCallback } from 'react'
import { Loader2, Calendar } from 'lucide-react'
import type { HostBooking } from '../slices/hostSlice'

interface BookingsTabProps {
  bookings: HostBooking[]
  loading: boolean
  onConfirm: (bookingId: string) => Promise<void>
  onCancel: (bookingId: string) => Promise<void>
}

const STATUS_FILTERS = ['All', 'Pending', 'Confirmed', 'Cancelled', 'Completed'] as const
type StatusFilter = (typeof STATUS_FILTERS)[number]

const statusColors: Record<string, string> = {
  pending: 'bg-status-pending/20 text-status-pending',
  confirmed: 'bg-status-confirmed/20 text-status-confirmed',
  cancelled: 'bg-status-cancelled/20 text-status-cancelled',
  completed: 'bg-status-completed/20 text-status-completed',
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr.split('T')[0] + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function BookingsTab({ bookings, loading, onConfirm, onCancel }: BookingsTabProps) {
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('All')
  const [cancelDialog, setCancelDialog] = useState<HostBooking | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setCancelDialog(null)
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
  }, [])

  useEffect(() => {
    if (cancelDialog) {
      document.addEventListener('keydown', handleKeyDown)
      dialogRef.current?.querySelector<HTMLElement>('button')?.focus()
      return () => document.removeEventListener('keydown', handleKeyDown)
    } else {
      triggerRef.current?.focus()
    }
  }, [cancelDialog, handleKeyDown])

  const filteredBookings = activeFilter === 'All'
    ? bookings
    : bookings.filter((b) => b.status === activeFilter.toLowerCase())

  const handleConfirm = async (bookingId: string) => {
    setActionLoading(bookingId)
    await onConfirm(bookingId)
    setActionLoading(null)
  }

  const handleCancelClick = (booking: HostBooking, button: HTMLButtonElement) => {
    triggerRef.current = button
    setCancelDialog(booking)
  }

  const handleConfirmCancel = async () => {
    if (!cancelDialog) return
    setActionLoading(cancelDialog.id)
    await onCancel(cancelDialog.id)
    setActionLoading(null)
    setCancelDialog(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16" role="status">
        <Loader2 size={32} className="animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Loading bookings...</span>
      </div>
    )
  }

  return (
    <div data-testid="bookings-tab">
      <div className="flex items-center gap-2 mb-6 flex-wrap" role="group" aria-label="Filter bookings by status">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter}
            data-testid={`booking-filter-${filter.toLowerCase()}`}
            onClick={() => setActiveFilter(filter)}
            aria-pressed={activeFilter === filter}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === filter
                ? 'bg-primary text-white'
                : 'bg-bg-secondary text-text-secondary hover:bg-border'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div data-testid="bookings-empty-state" className="text-center py-16">
          <Calendar size={48} className="mx-auto text-text-secondary mb-4 opacity-50" aria-hidden="true" />
          <p className="text-text-secondary text-lg">
            {activeFilter === 'All' ? 'No bookings yet' : `No ${activeFilter.toLowerCase()} bookings`}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table data-testid="bookings-table" className="w-full" aria-label="Bookings">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Property</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Guest</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Check-in</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Check-out</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Guests</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Total</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr
                  key={booking.id}
                  data-testid={`booking-row-${booking.id}`}
                  className="border-b border-border hover:bg-bg-secondary/50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm font-medium text-text">{booking.property_title}</td>
                  <td className="py-3 px-4 text-sm text-text">{booking.guest_name}</td>
                  <td className="py-3 px-4 text-sm text-text-secondary">{formatDate(booking.check_in)}</td>
                  <td className="py-3 px-4 text-sm text-text-secondary">{formatDate(booking.check_out)}</td>
                  <td className="py-3 px-4 text-sm text-text">{booking.num_guests}</td>
                  <td className="py-3 px-4 text-sm font-medium text-text">
                    ${Number(booking.total_price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      data-testid={`booking-status-${booking.id}`}
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[booking.status] || ''}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {booking.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          data-testid={`booking-confirm-${booking.id}`}
                          onClick={() => handleConfirm(booking.id)}
                          disabled={actionLoading === booking.id}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-status-confirmed rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {actionLoading === booking.id ? '...' : 'Confirm'}
                        </button>
                        <button
                          data-testid={`booking-cancel-${booking.id}`}
                          onClick={(e) => handleCancelClick(booking, e.currentTarget)}
                          disabled={actionLoading === booking.id}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-status-cancelled rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        data-testid={`booking-cancel-${booking.id}`}
                        onClick={(e) => handleCancelClick(booking, e.currentTarget)}
                        disabled={actionLoading === booking.id}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-status-cancelled rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {cancelDialog && (
        <div
          data-testid="cancel-booking-dialog"
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setCancelDialog(null)}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-booking-dialog-title"
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="cancel-booking-dialog-title" className="text-lg font-semibold text-text mb-2">Cancel Booking</h3>
            <p className="text-text-secondary mb-1">Are you sure you want to cancel this booking?</p>
            <div className="bg-bg-secondary rounded-lg p-3 mb-6 text-sm">
              <p className="font-medium text-text">{cancelDialog.property_title}</p>
              <p className="text-text-secondary">Guest: {cancelDialog.guest_name}</p>
              <p className="text-text-secondary">
                {formatDate(cancelDialog.check_in)} — {formatDate(cancelDialog.check_out)}
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                data-testid="cancel-booking-dialog-dismiss"
                onClick={() => setCancelDialog(null)}
                className="px-4 py-2 text-sm font-medium text-text bg-bg-secondary rounded-lg hover:bg-border transition-colors"
              >
                Keep Booking
              </button>
              <button
                data-testid="cancel-booking-dialog-confirm"
                onClick={handleConfirmCancel}
                disabled={actionLoading === cancelDialog.id}
                className="px-4 py-2 text-sm font-medium text-white bg-status-cancelled rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {actionLoading === cancelDialog.id ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
