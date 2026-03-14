import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { RootState, AppDispatch } from '../store'
import type { FlightResult, FlightLeg } from '../slices/flightsSlice'
import { fetchFlightLegs } from '../slices/flightsSlice'
import './FlightResultCard.css'

interface FlightResultCardProps {
  flight: FlightResult
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatPrice(cents: number): string {
  return `$${Math.round(cents / 100)}`
}

function getStopsLabel(numLegs: number): string {
  if (numLegs <= 1) return 'Nonstop'
  if (numLegs === 2) return '1 stop'
  return `${numLegs - 1} stops`
}

function getAirlineInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function getDayDiff(dep: string, arr: string): number {
  const depDate = new Date(dep)
  const arrDate = new Date(arr)
  const depDay = new Date(depDate.getFullYear(), depDate.getMonth(), depDate.getDate())
  const arrDay = new Date(arrDate.getFullYear(), arrDate.getMonth(), arrDate.getDate())
  return Math.round((arrDay.getTime() - depDay.getTime()) / (1000 * 60 * 60 * 24))
}

function FlightResultCard({ flight }: FlightResultCardProps) {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [expanded, setExpanded] = useState(false)

  const legs = useSelector((state: RootState) => state.flights.expandedLegs[flight.id])
  const legsLoading = useSelector((state: RootState) => state.flights.expandedLegsLoading[flight.id])
  const passengers = useSelector((state: RootState) => state.search.passengers)

  function handleToggleExpand() {
    if (!expanded && !legs && !legsLoading) {
      dispatch(fetchFlightLegs(flight.id))
    }
    setExpanded(!expanded)
  }

  function handleSelect(e: React.MouseEvent) {
    e.stopPropagation()
    const cabinClass = searchParams.get('cabinClass') || 'economy'
    navigate(`/booking/${flight.id}?cabin=${encodeURIComponent(cabinClass)}&adults=${passengers.adults}&children=${passengers.children}&infants=${passengers.infants}`)
  }

  const dayDiff = getDayDiff(flight.departure_time, flight.arrival_time)

  return (
    <div
      className={`flight-card ${expanded ? 'flight-card--expanded' : ''}`}
      data-testid={`flight-card-${flight.id}`}
    >
      <div className="flight-card__main" onClick={handleToggleExpand} data-testid={`flight-card-main-${flight.id}`}>
        <div className="flight-card__airline">
          <div
            className="flight-card__airline-logo"
            style={{ backgroundColor: flight.logo_color || '#1A73E8' }}
            data-testid={`flight-card-logo-${flight.id}`}
          >
            {getAirlineInitials(flight.airline_name)}
          </div>
          <span className="flight-card__airline-name" data-testid={`flight-card-airline-${flight.id}`}>
            {flight.airline_name}
          </span>
          <span className="flight-card__flight-number" data-testid={`flight-card-flightnum-${flight.id}`}>
            {flight.flight_number}
          </span>
        </div>

        <div className="flight-card__times">
          <div className="flight-card__time-display">
            <span className="flight-card__time" data-testid={`flight-card-departure-${flight.id}`}>
              {formatTime(flight.departure_time)}
            </span>
            <span className="flight-card__time-arrow">→</span>
            <span className="flight-card__time" data-testid={`flight-card-arrival-${flight.id}`}>
              {formatTime(flight.arrival_time)}
              {dayDiff > 0 && (
                <span className="flight-card__day-indicator" data-testid={`flight-card-day-${flight.id}`}>
                  +{dayDiff}
                </span>
              )}
            </span>
          </div>
          <div className="flight-card__route-codes">
            {flight.origin_code} – {flight.dest_code}
          </div>
        </div>

        <div className="flight-card__duration" data-testid={`flight-card-duration-${flight.id}`}>
          <span className="flight-card__duration-text">{formatDuration(flight.duration_minutes)}</span>
          <span className="flight-card__stops" data-testid={`flight-card-stops-${flight.id}`}>
            {getStopsLabel(Number(flight.num_legs))}{flight.layover_codes ? ` · ${flight.layover_codes}` : ''}
          </span>
        </div>

        <div className="flight-card__co2" data-testid={`flight-card-co2-${flight.id}`}>
          {flight.co2_kg} kg CO₂
        </div>

        <div className="flight-card__price" data-testid={`flight-card-price-${flight.id}`}>
          {formatPrice(flight.total_price_cents)}
        </div>

        <div className="flight-card__expand-icon">
          {expanded ? '▲' : '▼'}
        </div>
      </div>

      {expanded && (
        <div className="flight-card__details" data-testid={`flight-card-details-${flight.id}`}>
          {legsLoading ? (
            <div className="flight-card__details-loading" data-testid={`flight-card-loading-${flight.id}`}>
              Loading flight details...
            </div>
          ) : legs && legs.length > 0 ? (
            <div className="flight-card__legs">
              {legs.map((leg: FlightLeg, index: number) => (
                <div key={leg.id}>
                  {index > 0 && (
                    <div className="flight-card__layover" data-testid={`flight-card-layover-${flight.id}-${index}`}>
                      <div className="flight-card__layover-line" />
                      <span className="flight-card__layover-text">
                        {formatLayover(legs[index - 1]!, leg)} layover at {leg.origin_code}
                      </span>
                      <div className="flight-card__layover-line" />
                    </div>
                  )}
                  <div className="flight-card__leg" data-testid={`flight-card-leg-${flight.id}-${leg.leg_order}`}>
                    <div className="flight-card__leg-timeline">
                      <div className="flight-card__leg-dot" />
                      <div className="flight-card__leg-line" />
                      <div className="flight-card__leg-dot" />
                    </div>
                    <div className="flight-card__leg-info">
                      <div className="flight-card__leg-row">
                        <span className="flight-card__leg-time">{formatTime(leg.departure_time)}</span>
                        <span className="flight-card__leg-airport">
                          {leg.origin_name} ({leg.origin_code})
                          {leg.terminal_departure && <span className="flight-card__leg-terminal"> · Terminal {leg.terminal_departure}</span>}
                        </span>
                      </div>
                      <div className="flight-card__leg-meta">
                        <span>{formatDuration(leg.duration_minutes)}</span>
                        <span className="flight-card__leg-flight-num">
                          {leg.airline_name || flight.airline_name} · {leg.flight_number}
                        </span>
                        {leg.aircraft_type && (
                          <span className="flight-card__leg-aircraft">{leg.aircraft_type}</span>
                        )}
                      </div>
                      <div className="flight-card__leg-row">
                        <span className="flight-card__leg-time">{formatTime(leg.arrival_time)}</span>
                        <span className="flight-card__leg-airport">
                          {leg.dest_name} ({leg.dest_code})
                          {leg.terminal_arrival && <span className="flight-card__leg-terminal"> · Terminal {leg.terminal_arrival}</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flight-card__legs">
              <div className="flight-card__leg" data-testid={`flight-card-leg-${flight.id}-single`}>
                <div className="flight-card__leg-timeline">
                  <div className="flight-card__leg-dot" />
                  <div className="flight-card__leg-line" />
                  <div className="flight-card__leg-dot" />
                </div>
                <div className="flight-card__leg-info">
                  <div className="flight-card__leg-row">
                    <span className="flight-card__leg-time">{formatTime(flight.departure_time)}</span>
                    <span className="flight-card__leg-airport">{flight.origin_name} ({flight.origin_code})</span>
                  </div>
                  <div className="flight-card__leg-meta">
                    <span>{formatDuration(flight.duration_minutes)}</span>
                    <span className="flight-card__leg-flight-num">{flight.airline_name} · {flight.flight_number}</span>
                    {flight.aircraft_type && <span className="flight-card__leg-aircraft">{flight.aircraft_type}</span>}
                  </div>
                  <div className="flight-card__leg-row">
                    <span className="flight-card__leg-time">{formatTime(flight.arrival_time)}</span>
                    <span className="flight-card__leg-airport">{flight.dest_name} ({flight.dest_code})</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flight-card__amenities" data-testid={`flight-card-amenities-${flight.id}`}>
            {flight.has_wifi && (
              <span className="flight-card__amenity" data-testid={`flight-card-wifi-${flight.id}`} title="Wi-Fi available">
                📶 Wi-Fi
              </span>
            )}
            {flight.has_power && (
              <span className="flight-card__amenity" data-testid={`flight-card-power-${flight.id}`} title="Power outlets available">
                🔌 Power
              </span>
            )}
            {flight.has_entertainment && (
              <span className="flight-card__amenity" data-testid={`flight-card-entertainment-${flight.id}`} title="In-flight entertainment">
                🎬 Entertainment
              </span>
            )}
          </div>

          <div className="flight-card__baggage" data-testid={`flight-card-baggage-${flight.id}`}>
            <span className="flight-card__baggage-icon">🧳</span>
            <span>
              {flight.cabin_class === 'economy'
                ? '1 carry-on bag, 1 personal item'
                : flight.cabin_class === 'premium_economy'
                  ? '1 carry-on bag, 1 checked bag included'
                  : '2 carry-on bags, 2 checked bags included'}
            </span>
          </div>

          <div className="flight-card__actions">
            <button
              className="flight-card__select-button"
              onClick={handleSelect}
              data-testid={`flight-card-select-${flight.id}`}
            >
              Select flight · {formatPrice(flight.total_price_cents)}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function formatLayover(prevLeg: FlightLeg, nextLeg: FlightLeg): string {
  const prevArr = new Date(prevLeg.arrival_time).getTime()
  const nextDep = new Date(nextLeg.departure_time).getTime()
  const diffMinutes = Math.round((nextDep - prevArr) / (1000 * 60))
  return formatDuration(diffMinutes)
}

export default FlightResultCard
