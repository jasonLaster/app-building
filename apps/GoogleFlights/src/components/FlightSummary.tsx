import type { FlightLeg } from '../slices/flightsSlice'
import type { BookingFlightDetail } from '../slices/bookingSlice'
import './FlightSummary.css'

interface FlightSummaryProps {
  flight: BookingFlightDetail
  legs: FlightLeg[]
  label?: string
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

function getStopsLabel(numLegs: number): string {
  if (numLegs <= 1) return 'Nonstop'
  if (numLegs === 2) return '1 stop'
  return `${numLegs - 1} stops`
}

function getBaggageInfo(cabinClass: string): string {
  if (cabinClass === 'economy') return '1 carry-on bag, 1 personal item'
  if (cabinClass === 'premium_economy') return '1 carry-on bag, 1 checked bag included'
  return '2 carry-on bags, 2 checked bags included'
}

function formatLayover(prevLeg: FlightLeg, nextLeg: FlightLeg): string {
  const prevArr = new Date(prevLeg.arrival_time).getTime()
  const nextDep = new Date(nextLeg.departure_time).getTime()
  const diffMinutes = Math.round((nextDep - prevArr) / (1000 * 60))
  return formatDuration(diffMinutes)
}

function FlightSummary({ flight, legs, label }: FlightSummaryProps) {
  const effectiveLegs = legs.length > 0 ? legs : null
  const numLegs = effectiveLegs ? effectiveLegs.length : 1
  const dayDiff = getDayDiff(flight.departure_time, flight.arrival_time)

  return (
    <div className="flight-summary" data-testid="flight-summary">
      {label && (
        <div className="flight-summary__label" data-testid="flight-summary-label">
          {label}
        </div>
      )}

      <div className="flight-summary__header" data-testid="flight-summary-header">
        <div className="flight-summary__route">
          <span className="flight-summary__route-code">{flight.origin_code}</span>
          <span className="flight-summary__route-arrow">→</span>
          <span className="flight-summary__route-code">{flight.dest_code}</span>
        </div>
        <div className="flight-summary__meta">
          <span data-testid="flight-summary-duration">{formatDuration(flight.duration_minutes)}</span>
          <span className="flight-summary__meta-sep">·</span>
          <span data-testid="flight-summary-stops">{getStopsLabel(numLegs)}</span>
        </div>
      </div>

      <div className="flight-summary__legs" data-testid="flight-summary-legs">
        {effectiveLegs ? (
          effectiveLegs.map((leg, index) => {
            const prevLeg = index > 0 ? effectiveLegs[index - 1] : undefined
            return (
              <div key={leg.id}>
                {index > 0 && prevLeg && (
                  <div className="flight-summary__layover" data-testid={`flight-summary-layover-${index}`}>
                    <div className="flight-summary__layover-badge">
                      {formatLayover(prevLeg, leg)} layover at {leg.origin_code}
                    </div>
                  </div>
                )}
                <LegDetail
                  leg={leg}
                  airlineName={leg.airline_name || flight.airline_name}
                  airlineCode={leg.airline_code || flight.airline_code}
                  logoColor={flight.logo_color}
                  flightNumber={leg.flight_number || flight.flight_number}
                />
              </div>
            )
          })
        ) : (
          <LegDetail
            leg={{
              id: flight.id,
              leg_order: 1,
              departure_time: flight.departure_time,
              arrival_time: flight.arrival_time,
              duration_minutes: flight.duration_minutes,
              flight_number: flight.flight_number,
              aircraft_type: flight.aircraft_type,
              terminal_departure: null,
              terminal_arrival: null,
              origin_code: flight.origin_code,
              origin_name: flight.origin_name,
              origin_city: flight.origin_city,
              dest_code: flight.dest_code,
              dest_name: flight.dest_name,
              dest_city: flight.dest_city,
              airline_name: flight.airline_name,
              airline_code: flight.airline_code,
            }}
            airlineName={flight.airline_name}
            airlineCode={flight.airline_code}
            logoColor={flight.logo_color}
            flightNumber={flight.flight_number}
          />
        )}
      </div>

      <div className="flight-summary__amenities" data-testid="flight-summary-amenities">
        {flight.has_wifi && (
          <span className="flight-summary__amenity" data-testid="flight-summary-wifi" title="Wi-Fi available">
            📶 Wi-Fi
          </span>
        )}
        {flight.has_power && (
          <span className="flight-summary__amenity" data-testid="flight-summary-power" title="Power outlets available">
            🔌 Power
          </span>
        )}
        {flight.has_entertainment && (
          <span className="flight-summary__amenity" data-testid="flight-summary-entertainment" title="In-flight entertainment">
            🎬 Entertainment
          </span>
        )}
      </div>

      <div className="flight-summary__baggage" data-testid="flight-summary-baggage">
        <span className="flight-summary__baggage-icon">🧳</span>
        <span>{getBaggageInfo(flight.cabin_class)}</span>
      </div>

      {dayDiff > 0 && (
        <div className="flight-summary__overnight-note" data-testid="flight-summary-overnight">
          Arrives +{dayDiff} day{dayDiff > 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

interface LegDetailProps {
  leg: FlightLeg
  airlineName: string
  airlineCode: string
  logoColor: string
  flightNumber: string
}

function LegDetail({ leg, airlineName, airlineCode: _airlineCode, logoColor, flightNumber }: LegDetailProps) {
  const legDayDiff = getDayDiff(leg.departure_time, leg.arrival_time)

  return (
    <div className="flight-summary__leg" data-testid={`flight-summary-leg-${leg.leg_order}`}>
      <div className="flight-summary__leg-airline">
        <div
          className="flight-summary__airline-logo"
          style={{ backgroundColor: logoColor || '#1A73E8' }}
          data-testid={`flight-summary-logo-${leg.leg_order}`}
        >
          {getAirlineInitials(airlineName)}
        </div>
        <div className="flight-summary__airline-info">
          <span className="flight-summary__airline-name" data-testid={`flight-summary-airline-${leg.leg_order}`}>
            {airlineName}
          </span>
          <span className="flight-summary__flight-number" data-testid={`flight-summary-flightnum-${leg.leg_order}`}>
            {flightNumber}
          </span>
          {leg.aircraft_type && (
            <span className="flight-summary__aircraft" data-testid={`flight-summary-aircraft-${leg.leg_order}`}>
              {leg.aircraft_type}
            </span>
          )}
        </div>
      </div>

      <div className="flight-summary__leg-timeline">
        <div className="flight-summary__timeline-row">
          <div className="flight-summary__timeline-dot" />
          <div className="flight-summary__timeline-content">
            <span className="flight-summary__leg-time" data-testid={`flight-summary-dep-time-${leg.leg_order}`}>
              {formatTime(leg.departure_time)}
            </span>
            <span className="flight-summary__leg-airport">
              {leg.origin_name} ({leg.origin_code})
              {leg.terminal_departure && (
                <span className="flight-summary__terminal" data-testid={`flight-summary-dep-terminal-${leg.leg_order}`}>
                  {' '}· Terminal {leg.terminal_departure}
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flight-summary__timeline-line">
          <span className="flight-summary__leg-duration">{formatDuration(leg.duration_minutes)}</span>
        </div>

        <div className="flight-summary__timeline-row">
          <div className="flight-summary__timeline-dot" />
          <div className="flight-summary__timeline-content">
            <span className="flight-summary__leg-time" data-testid={`flight-summary-arr-time-${leg.leg_order}`}>
              {formatTime(leg.arrival_time)}
              {legDayDiff > 0 && (
                <span className="flight-summary__day-indicator" data-testid={`flight-summary-day-${leg.leg_order}`}>
                  +{legDayDiff}
                </span>
              )}
            </span>
            <span className="flight-summary__leg-airport">
              {leg.dest_name} ({leg.dest_code})
              {leg.terminal_arrival && (
                <span className="flight-summary__terminal" data-testid={`flight-summary-arr-terminal-${leg.leg_order}`}>
                  {' '}· Terminal {leg.terminal_arrival}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FlightSummary
