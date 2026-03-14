import { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'
import type { Airport } from '../slices/searchSlice'
import AirportAutocomplete from './AirportAutocomplete'
import DatePicker from './DatePicker'
import PassengerCountSelector from './PassengerCountSelector'
import CabinClassSelector from './CabinClassSelector'
import './SearchSummaryBar.css'

type EditingField = 'origin' | 'destination' | 'departureDate' | 'returnDate' | 'passengers' | 'cabinClass' | null

interface SearchSummaryBarProps {
  origin: string
  destination: string
  departureDate: string
  returnDate: string | null
  tripType: string
  cabinClass: string
  adults: number
  children: number
  infants: number
  onSearch: (params: {
    origin?: Airport
    destination?: Airport
    departureDate?: string
    returnDate?: string | null
    cabinClass?: string
    adults?: number
    children?: number
    infants?: number
  }) => void
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatCabinClass(cls: string): string {
  const map: Record<string, string> = {
    economy: 'Economy',
    premium_economy: 'Premium Economy',
    business: 'Business',
    first: 'First',
  }
  return map[cls] || cls
}

function formatPassengers(adults: number, children: number, infants: number): string {
  const total = adults + children + infants
  if (total === 1) return '1 adult'
  return `${total} passengers`
}

function SearchSummaryBar({
  origin, destination, departureDate, returnDate, tripType,
  cabinClass, adults, children, infants, onSearch,
}: SearchSummaryBarProps) {
  const [editing, setEditing] = useState<EditingField>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const searchState = useSelector((state: RootState) => state.search)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setEditing(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleOriginSelect(airport: Airport | null) {
    if (airport) {
      onSearch({ origin: airport })
      setEditing(null)
    }
  }

  function handleDestinationSelect(airport: Airport | null) {
    if (airport) {
      onSearch({ destination: airport })
      setEditing(null)
    }
  }

  function handleDepartureDateSelect(date: string | null) {
    if (date) {
      onSearch({ departureDate: date })
      setEditing(null)
    }
  }

  function handleReturnDateSelect(date: string | null) {
    if (date) {
      onSearch({ returnDate: date })
      setEditing(null)
    }
  }

  const dateDisplay = returnDate
    ? `${formatDate(departureDate)} – ${formatDate(returnDate)}`
    : formatDate(departureDate)

  return (
    <div className="search-summary-bar" ref={containerRef} data-testid="search-summary-bar">
      <div className="search-summary-bar__chips">
        <div className="search-summary-bar__chip-wrapper" style={{ position: 'relative' }}>
          <button
            className={`search-summary-bar__chip ${editing === 'origin' ? 'search-summary-bar__chip--active' : ''}`}
            onClick={() => setEditing(editing === 'origin' ? null : 'origin')}
            data-testid="summary-origin"
          >
            <span className="search-summary-bar__chip-icon">✈</span>
            {origin}
          </button>
          {editing === 'origin' && (
            <div className="search-summary-bar__editor" data-testid="summary-origin-editor">
              <AirportAutocomplete
                value={searchState.origin}
                onChange={handleOriginSelect}
                placeholder="Where from?"
                testIdPrefix="summary-origin-autocomplete"
              />
            </div>
          )}
        </div>

        <span className="search-summary-bar__arrow">→</span>

        <div className="search-summary-bar__chip-wrapper" style={{ position: 'relative' }}>
          <button
            className={`search-summary-bar__chip ${editing === 'destination' ? 'search-summary-bar__chip--active' : ''}`}
            onClick={() => setEditing(editing === 'destination' ? null : 'destination')}
            data-testid="summary-destination"
          >
            <span className="search-summary-bar__chip-icon">✈</span>
            {destination}
          </button>
          {editing === 'destination' && (
            <div className="search-summary-bar__editor" data-testid="summary-destination-editor">
              <AirportAutocomplete
                value={searchState.destination}
                onChange={handleDestinationSelect}
                placeholder="Where to?"
                testIdPrefix="summary-dest-autocomplete"
              />
            </div>
          )}
        </div>

        <div className="search-summary-bar__divider" />

        <div className="search-summary-bar__chip-wrapper" style={{ position: 'relative' }}>
          <button
            className={`search-summary-bar__chip ${editing === 'departureDate' ? 'search-summary-bar__chip--active' : ''}`}
            onClick={() => setEditing(editing === 'departureDate' ? null : 'departureDate')}
            data-testid="summary-dates"
          >
            <span className="search-summary-bar__chip-icon">📅</span>
            {dateDisplay}
          </button>
          {editing === 'departureDate' && (
            <div className="search-summary-bar__editor" data-testid="summary-departure-editor">
              <DatePicker
                value={departureDate}
                onChange={handleDepartureDateSelect}
                placeholder="Departure"
                testIdPrefix="summary-departure"
              />
            </div>
          )}
          {editing === 'returnDate' && tripType === 'round_trip' && (
            <div className="search-summary-bar__editor" data-testid="summary-return-editor">
              <DatePicker
                value={returnDate}
                onChange={handleReturnDateSelect}
                placeholder="Return"
                minDate={departureDate}
                testIdPrefix="summary-return"
              />
            </div>
          )}
        </div>

        {tripType === 'round_trip' && returnDate && (
          <div className="search-summary-bar__chip-wrapper" style={{ position: 'relative' }}>
            <button
              className={`search-summary-bar__chip ${editing === 'returnDate' ? 'search-summary-bar__chip--active' : ''}`}
              onClick={() => setEditing(editing === 'returnDate' ? null : 'returnDate')}
              data-testid="summary-return-date"
            >
              <span className="search-summary-bar__chip-icon">📅</span>
              Return: {formatDate(returnDate)}
            </button>
            {editing === 'returnDate' && (
              <div className="search-summary-bar__editor" data-testid="summary-return-editor">
                <DatePicker
                  value={returnDate}
                  onChange={handleReturnDateSelect}
                  placeholder="Return"
                  minDate={departureDate}
                  testIdPrefix="summary-return"
                />
              </div>
            )}
          </div>
        )}

        <div className="search-summary-bar__divider" />

        <div className="search-summary-bar__chip-wrapper" style={{ position: 'relative' }}>
          <button
            className={`search-summary-bar__chip ${editing === 'passengers' ? 'search-summary-bar__chip--active' : ''}`}
            onClick={() => setEditing(editing === 'passengers' ? null : 'passengers')}
            data-testid="summary-passengers"
          >
            <span className="search-summary-bar__chip-icon">👤</span>
            {formatPassengers(adults, children, infants)}
          </button>
          {editing === 'passengers' && (
            <div className="search-summary-bar__editor search-summary-bar__editor--wide" data-testid="summary-passengers-editor">
              <PassengerCountSelector />
            </div>
          )}
        </div>

        <div className="search-summary-bar__chip-wrapper" style={{ position: 'relative' }}>
          <button
            className={`search-summary-bar__chip ${editing === 'cabinClass' ? 'search-summary-bar__chip--active' : ''}`}
            onClick={() => setEditing(editing === 'cabinClass' ? null : 'cabinClass')}
            data-testid="summary-cabin-class"
          >
            <span className="search-summary-bar__chip-icon">💺</span>
            {formatCabinClass(cabinClass)}
          </button>
          {editing === 'cabinClass' && (
            <div className="search-summary-bar__editor" data-testid="summary-cabin-editor">
              <CabinClassSelector />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchSummaryBar
