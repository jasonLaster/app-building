import type { BookingFlightDetail } from '../slices/bookingSlice'
import './PriceBreakdown.css'

interface PriceBreakdownProps {
  flight: BookingFlightDetail
  passengers: { adults: number; children: number; infants: number }
  returnFlight?: BookingFlightDetail | null
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

function formatCabinClass(cls: string): string {
  switch (cls) {
    case 'economy': return 'Economy'
    case 'premium_economy': return 'Premium Economy'
    case 'business': return 'Business'
    case 'first': return 'First'
    default: return cls
  }
}

function PriceBreakdown({ flight, passengers, returnFlight }: PriceBreakdownProps) {
  const adultBaseFare = flight.base_price_cents
  const childBaseFare = Math.round(flight.base_price_cents * 0.75)
  const infantBaseFare = Math.round(flight.base_price_cents * 0.1)

  const returnAdultBase = returnFlight ? returnFlight.base_price_cents : 0
  const returnChildBase = returnFlight ? Math.round(returnFlight.base_price_cents * 0.75) : 0
  const returnInfantBase = returnFlight ? Math.round(returnFlight.base_price_cents * 0.1) : 0

  const adultTotal = (adultBaseFare + returnAdultBase) * passengers.adults
  const childTotal = (childBaseFare + returnChildBase) * passengers.children
  const infantTotal = (infantBaseFare + returnInfantBase) * passengers.infants

  const totalTaxes = flight.taxes_cents * (passengers.adults + passengers.children)
    + (returnFlight ? returnFlight.taxes_cents * (passengers.adults + passengers.children) : 0)

  const grandTotal = adultTotal + childTotal + infantTotal + totalTaxes

  return (
    <div className="price-breakdown" data-testid="price-breakdown">
      <h3 className="price-breakdown__title">Price Breakdown</h3>

      <div className="price-breakdown__cabin" data-testid="price-breakdown-cabin">
        Cabin: {formatCabinClass(flight.cabin_class)}
      </div>

      <div className="price-breakdown__items">
        {passengers.adults > 0 && (
          <div className="price-breakdown__item" data-testid="price-breakdown-adults">
            <div className="price-breakdown__item-label">
              <span className="price-breakdown__type">Adult × {passengers.adults}</span>
              <span className="price-breakdown__per-person">
                {formatPrice(adultBaseFare + returnAdultBase)} each
              </span>
            </div>
            <span className="price-breakdown__item-amount">{formatPrice(adultTotal)}</span>
          </div>
        )}

        {passengers.children > 0 && (
          <div className="price-breakdown__item" data-testid="price-breakdown-children">
            <div className="price-breakdown__item-label">
              <span className="price-breakdown__type">Child × {passengers.children}</span>
              <span className="price-breakdown__per-person">
                {formatPrice(childBaseFare + returnChildBase)} each
              </span>
            </div>
            <span className="price-breakdown__item-amount">{formatPrice(childTotal)}</span>
          </div>
        )}

        {passengers.infants > 0 && (
          <div className="price-breakdown__item" data-testid="price-breakdown-infants">
            <div className="price-breakdown__item-label">
              <span className="price-breakdown__type">Infant × {passengers.infants}</span>
              <span className="price-breakdown__per-person">
                {formatPrice(infantBaseFare + returnInfantBase)} each
              </span>
            </div>
            <span className="price-breakdown__item-amount">{formatPrice(infantTotal)}</span>
          </div>
        )}

        <div className="price-breakdown__item" data-testid="price-breakdown-taxes">
          <div className="price-breakdown__item-label">
            <span className="price-breakdown__type">Taxes and fees</span>
          </div>
          <span className="price-breakdown__item-amount">{formatPrice(totalTaxes)}</span>
        </div>

        {returnFlight && (
          <div className="price-breakdown__note" data-testid="price-breakdown-roundtrip">
            Includes outbound + return flights
          </div>
        )}
      </div>

      <div className="price-breakdown__total" data-testid="price-breakdown-total">
        <span className="price-breakdown__total-label">Total</span>
        <span className="price-breakdown__total-amount">{formatPrice(grandTotal)}</span>
      </div>
    </div>
  )
}

export default PriceBreakdown
