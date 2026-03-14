import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { createBooking, setValidationErrors } from '../slices/bookingSlice'
import './BookingAction.css'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

interface BookingActionProps {
  flightId: string
  returnFlightId?: string
  cabinClass: string
  totalPriceCents: number
}

function BookingAction({ flightId, returnFlightId, cabinClass, totalPriceCents }: BookingActionProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { passengers, bookingInProgress, bookingComplete, bookingReference, bookingError } = useSelector(
    (state: RootState) => state.booking
  )
  const sessionToken = useSelector((state: RootState) => state.search.sessionToken)

  function handleBook() {
    if (bookingComplete) return

    // Validate
    const errors: Record<string, string> = {}
    passengers.forEach((p, i) => {
      if (!p.firstName.trim()) errors[`${i}-firstName`] = 'First name is required'
      if (!p.lastName.trim()) errors[`${i}-lastName`] = 'Last name is required'
      if (!p.dateOfBirth) errors[`${i}-dateOfBirth`] = 'Date of birth is required'
      if (!p.gender) errors[`${i}-gender`] = 'Gender is required'
      if (i === 0) {
        if (!p.email.trim()) {
          errors[`${i}-email`] = 'Email is required'
        } else if (!isValidEmail(p.email.trim())) {
          errors[`${i}-email`] = 'Please enter a valid email address'
        }
        if (!p.phone.trim()) errors[`${i}-phone`] = 'Phone number is required'
      }
    })

    if (Object.keys(errors).length > 0) {
      dispatch(setValidationErrors(errors))
      return
    }

    dispatch(createBooking({
      sessionToken,
      flightId,
      returnFlightId,
      cabinClass,
      totalPriceCents,
      passengers: passengers.map((p, i) => ({
        firstName: p.firstName.trim(),
        lastName: p.lastName.trim(),
        dateOfBirth: p.dateOfBirth,
        gender: p.gender,
        email: i === 0 ? p.email.trim() : undefined,
        phone: i === 0 ? p.phone.trim() : undefined,
        passengerType: p.passengerType,
      })),
    }))
  }

  if (bookingComplete && bookingReference) {
    return (
      <div className="booking-action" data-testid="booking-action">
        <div className="booking-action__confirmation" data-testid="booking-confirmation">
          <div className="booking-action__confirmation-icon">✓</div>
          <h3 className="booking-action__confirmation-title">Booking Confirmed!</h3>
          <p className="booking-action__reference" data-testid="booking-reference">
            Your booking reference: <strong>{bookingReference}</strong>
          </p>
          <p className="booking-action__confirmation-note">
            You can view this booking on the My Trips page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="booking-action" data-testid="booking-action">
      {bookingError && (
        <div className="booking-action__error" data-testid="booking-error">
          {bookingError}
        </div>
      )}
      <button
        className="booking-action__button"
        onClick={handleBook}
        disabled={bookingInProgress}
        data-testid="booking-button"
      >
        {bookingInProgress ? 'Booking...' : 'Book Flight'}
      </button>
    </div>
  )
}

export default BookingAction
