import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState, AppDispatch } from '../store'
import type { Property } from '../slices/propertiesSlice'
import { createBooking, clearBookingError } from '../slices/bookingsSlice'

interface BookingCardProps {
  property: Property
}

export default function BookingCard({ property }: BookingCardProps) {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const currentUser = useSelector((state: RootState) => state.auth.currentUser)
  const { loading, error } = useSelector((state: RootState) => state.bookings)

  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [success, setSuccess] = useState(false)

  const today = new Date().toISOString().split('T')[0]!
  const isOwnProperty = currentUser?.id === property.host_id

  const nights =
    checkIn && checkOut
      ? Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
      : 0

  const nightlyTotal = nights * Number(property.price_per_night)
  const cleaningFee = Number(property.cleaning_fee)
  const total = nightlyTotal + cleaningFee

  const canReserve = checkIn && checkOut && nights > 0 && !isOwnProperty && currentUser && !loading

  const handleReserve = async () => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    if (!checkIn || !checkOut || isOwnProperty) return

    dispatch(clearBookingError())
    const result = await dispatch(
      createBooking({
        property_id: property.id,
        guest_id: currentUser.id,
        check_in: checkIn,
        check_out: checkOut,
        num_guests: guests,
        total_price: total,
      })
    )
    if (createBooking.fulfilled.match(result)) {
      setSuccess(true)
      setTimeout(() => navigate('/trips'), 1500)
    }
  }

  return (
    <div data-testid="booking-card" className="border border-border rounded-xl p-6 shadow-md sticky top-6">
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-xl font-semibold text-text">${Number(property.price_per_night).toFixed(0)}</span>
        <span className="text-text-secondary">/ night</span>
      </div>

      <div className="border border-border rounded-lg overflow-hidden mb-4">
        <div className="grid grid-cols-2">
          <div className="p-3 border-r border-border">
            <label className="block text-xs font-semibold text-text uppercase mb-1">Check-in</label>
            <input
              data-testid="booking-checkin"
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => {
                setCheckIn(e.target.value)
                if (checkOut && e.target.value >= checkOut) {
                  setCheckOut('')
                }
              }}
              className="w-full text-sm text-text bg-transparent outline-none"
            />
          </div>
          <div className="p-3">
            <label className="block text-xs font-semibold text-text uppercase mb-1">Check-out</label>
            <input
              data-testid="booking-checkout"
              type="date"
              value={checkOut}
              min={checkIn || today}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full text-sm text-text bg-transparent outline-none"
            />
          </div>
        </div>
        <div className="border-t border-border p-3">
          <label className="block text-xs font-semibold text-text uppercase mb-1">Guests</label>
          <select
            data-testid="booking-guests"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full text-sm text-text bg-transparent outline-none"
          >
            {Array.from({ length: property.max_guests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'guest' : 'guests'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {nights > 0 && (
        <div data-testid="price-breakdown" className="mb-4 space-y-2 text-sm">
          <div className="flex justify-between text-text-secondary">
            <span>${Number(property.price_per_night).toFixed(0)} x {nights} {nights === 1 ? 'night' : 'nights'}</span>
            <span>${nightlyTotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Cleaning fee</span>
            <span>${cleaningFee.toFixed(0)}</span>
          </div>
          <div className="flex justify-between font-semibold text-text pt-2 border-t border-border">
            <span>Total</span>
            <span>${total.toFixed(0)}</span>
          </div>
        </div>
      )}

      {isOwnProperty ? (
        <p data-testid="own-property-message" className="text-center text-text-secondary text-sm mb-2">
          You cannot book your own property
        </p>
      ) : !currentUser ? (
        <button
          data-testid="booking-login-prompt"
          className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors cursor-pointer"
          onClick={() => navigate('/login')}
        >
          Log in to reserve
        </button>
      ) : (
        <button
          data-testid="reserve-button"
          className="w-full py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          disabled={!canReserve}
          onClick={handleReserve}
        >
          {loading ? 'Reserving...' : 'Reserve'}
        </button>
      )}

      {!checkIn && !checkOut && currentUser && !isOwnProperty && (
        <p className="text-center text-text-secondary text-xs mt-2">Select dates to book</p>
      )}

      {error && (
        <p data-testid="booking-error" className="text-error text-sm mt-2 text-center">{error}</p>
      )}

      {success && (
        <p data-testid="booking-success" className="text-success text-sm mt-2 text-center font-semibold">
          Booking confirmed! Redirecting...
        </p>
      )}
    </div>
  )
}
