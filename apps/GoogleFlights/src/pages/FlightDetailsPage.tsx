import { useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { fetchFlightForBooking, initializePassengers, resetBooking } from '../slices/bookingSlice'
import FlightSummary from '../components/FlightSummary'
import PriceBreakdown from '../components/PriceBreakdown'
import PassengerForm from '../components/PassengerForm'
import BookingAction from '../components/BookingAction'
import './FlightDetailsPage.css'

function FlightDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  const cabinClass = searchParams.get('cabin') || 'economy'
  const adults = parseInt(searchParams.get('adults') || '1', 10)
  const children = parseInt(searchParams.get('children') || '0', 10)
  const infants = parseInt(searchParams.get('infants') || '0', 10)

  const { flight, legs, loading, error, bookingComplete } = useSelector(
    (state: RootState) => state.booking
  )

  useEffect(() => {
    if (id) {
      dispatch(resetBooking())
      dispatch(fetchFlightForBooking({ flightId: id, cabinClass }))
      dispatch(initializePassengers({ adults, children, infants }))
    }
  }, [id, cabinClass, adults, children, infants, dispatch])

  if (loading) {
    return (
      <div className="flight-details-page p-6 max-sm:p-3" data-testid="flight-details-page">
        <div className="flight-details-page__loading" data-testid="flight-details-loading">
          <div className="flight-details-page__loading-spinner" />
          <span>Loading flight details...</span>
        </div>
      </div>
    )
  }

  if (error || !flight) {
    return (
      <div className="flight-details-page p-6 max-sm:p-3" data-testid="flight-details-page">
        <div className="flight-details-page__error" data-testid="flight-details-error">
          <h2>Flight not found</h2>
          <p>{error || 'Unable to load flight details.'}</p>
          <button
            className="flight-details-page__back-button"
            onClick={() => navigate(-1)}
            data-testid="flight-details-back"
          >
            ← Back to results
          </button>
        </div>
      </div>
    )
  }

  // Calculate total price for BookingAction
  const adultBaseFare = flight.base_price_cents
  const childBaseFare = Math.round(flight.base_price_cents * 0.75)
  const infantBaseFare = Math.round(flight.base_price_cents * 0.1)
  const totalTaxes = flight.taxes_cents * (adults + children)
  const totalPriceCents =
    adultBaseFare * adults +
    childBaseFare * children +
    infantBaseFare * infants +
    totalTaxes

  return (
    <div className="flight-details-page p-6 max-sm:p-3" data-testid="flight-details-page">
      <div className="flight-details-page__header">
        <button
          className="flight-details-page__back-link"
          onClick={() => navigate(-1)}
          data-testid="flight-details-back"
        >
          ← Back to results
        </button>
        <h1 className="flight-details-page__title">Flight Details & Booking</h1>
      </div>

      <div className="flight-details-page__content">
        <div className="flight-details-page__main">
          <div className="flight-details-page__section">
            <FlightSummary
              flight={flight}
              legs={legs}
              label={`Outbound · ${flight.origin_code} → ${flight.dest_code}`}
            />
          </div>

          <div className="flight-details-page__section">
            <PassengerForm />
          </div>
        </div>

        <div className="flight-details-page__sidebar">
          <div className="flight-details-page__section">
            <PriceBreakdown
              flight={flight}
              passengers={{ adults, children, infants }}
            />
          </div>

          <div className="flight-details-page__section">
            <BookingAction
              flightId={flight.id}
              cabinClass={cabinClass}
              totalPriceCents={totalPriceCents}
            />
          </div>

          {bookingComplete && (
            <button
              className="flight-details-page__trips-link"
              onClick={() => navigate('/trips')}
              data-testid="view-trips-button"
            >
              View My Trips
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default FlightDetailsPage
