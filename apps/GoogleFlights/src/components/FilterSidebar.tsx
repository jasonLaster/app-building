import { useState, useRef, useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import type { FlightResult, SortOption, StopsFilter, TimeFilter } from '../slices/flightsSlice'
import {
  setSortBy,
  setStopsFilter,
  setAirlinesFilter,
  setPriceRange,
  setDurationRange,
  setDepartureTimeFilter,
  setArrivalTimeFilter,
} from '../slices/flightsSlice'
import './FilterSidebar.css'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'best', label: 'Best' },
  { value: 'price', label: 'Price (lowest)' },
  { value: 'duration', label: 'Duration (shortest)' },
  { value: 'departure', label: 'Departure time (earliest)' },
  { value: 'arrival', label: 'Arrival time (earliest)' },
]

const TIME_LABELS: { key: keyof TimeFilter; label: string; range: string }[] = [
  { key: 'morning', label: 'Morning', range: '6:00 AM – 12:00 PM' },
  { key: 'afternoon', label: 'Afternoon', range: '12:00 PM – 6:00 PM' },
  { key: 'evening', label: 'Evening', range: '6:00 PM – 12:00 AM' },
  { key: 'night', label: 'Night', range: '12:00 AM – 6:00 AM' },
]

function formatPrice(cents: number): string {
  return `$${Math.round(cents / 100)}`
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

interface RangeSliderProps {
  min: number
  max: number
  value: [number, number]
  onChange: (val: [number, number]) => void
  formatLabel: (val: number) => string
  testIdPrefix: string
  histogram?: number[]
}

function RangeSlider({ min, max, value, onChange, formatLabel, testIdPrefix, histogram }: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  const range = max - min || 1
  const leftPct = ((value[0] - min) / range) * 100
  const rightPct = ((value[1] - min) / range) * 100

  function handlePointerDown(handle: 'min' | 'max') {
    return (e: React.PointerEvent) => {
      e.preventDefault()
      const track = trackRef.current
      if (!track) return

      const onMove = (moveEvent: PointerEvent) => {
        const rect = track.getBoundingClientRect()
        const pct = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width))
        const val = Math.round(min + pct * range)

        if (handle === 'min') {
          onChange([Math.min(val, value[1]), value[1]])
        } else {
          onChange([value[0], Math.max(val, value[0])])
        }
      }

      const onUp = () => {
        document.removeEventListener('pointermove', onMove)
        document.removeEventListener('pointerup', onUp)
      }

      document.addEventListener('pointermove', onMove)
      document.addEventListener('pointerup', onUp)
    }
  }

  const maxHistVal = histogram ? Math.max(...histogram, 1) : 1

  return (
    <div className="range-slider" data-testid={`${testIdPrefix}-slider`}>
      {histogram && histogram.length > 0 && (
        <div className="range-slider__histogram" data-testid={`${testIdPrefix}-histogram`}>
          {histogram.map((count, i) => (
            <div
              key={i}
              className="range-slider__histogram-bar"
              style={{ height: `${(count / maxHistVal) * 40}px` }}
            />
          ))}
        </div>
      )}
      <div className="range-slider__labels">
        <span data-testid={`${testIdPrefix}-min-label`}>{formatLabel(value[0])}</span>
        <span data-testid={`${testIdPrefix}-max-label`}>{formatLabel(value[1])}</span>
      </div>
      <div className="range-slider__track" ref={trackRef} data-testid={`${testIdPrefix}-track`}>
        <div
          className="range-slider__fill"
          style={{ left: `${leftPct}%`, width: `${rightPct - leftPct}%` }}
        />
        <div
          className="range-slider__handle"
          style={{ left: `${leftPct}%` }}
          onPointerDown={handlePointerDown('min')}
          data-testid={`${testIdPrefix}-handle-min`}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value[0]}
          aria-label="Minimum"
          tabIndex={0}
        />
        <div
          className="range-slider__handle"
          style={{ left: `${rightPct}%` }}
          onPointerDown={handlePointerDown('max')}
          data-testid={`${testIdPrefix}-handle-max`}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value[1]}
          aria-label="Maximum"
          tabIndex={0}
        />
      </div>
    </div>
  )
}

function FilterSidebar() {
  const dispatch = useDispatch<AppDispatch>()
  const {
    flights, sortBy, stopsFilter, airlinesFilter,
    priceRange, priceRangeMax, durationRange, durationRangeMax,
    departureTimeFilter, arrivalTimeFilter,
  } = useSelector((state: RootState) => state.flights)

  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Compute airline counts
  const airlineCounts = useMemo(() => {
    const counts: Record<string, { name: string; count: number }> = {}
    flights.forEach((f: FlightResult) => {
      if (!counts[f.airline_code]) {
        counts[f.airline_code] = { name: f.airline_name, count: 0 }
      }
      counts[f.airline_code]!.count++
    })
    return counts
  }, [flights])

  // Compute price histogram
  const priceHistogram = useMemo(() => {
    if (flights.length === 0) return []
    const buckets = 10
    const [pMin, pMax] = priceRangeMax
    const range = pMax - pMin || 1
    const hist = new Array(buckets).fill(0) as number[]
    flights.forEach((f: FlightResult) => {
      const idx = Math.min(buckets - 1, Math.floor(((f.total_price_cents - pMin) / range) * buckets))
      const current = hist[idx]
      if (current !== undefined) {
        hist[idx] = current + 1
      }
    })
    return hist
  }, [flights, priceRangeMax])

  function handleStopsChange(key: keyof StopsFilter) {
    dispatch(setStopsFilter({ ...stopsFilter, [key]: !stopsFilter[key] }))
  }

  function handleAirlineToggle(code: string) {
    const newFilter = airlinesFilter.includes(code)
      ? airlinesFilter.filter(c => c !== code)
      : [...airlinesFilter, code]
    dispatch(setAirlinesFilter(newFilter))
  }

  function handleDepartureTimeChange(key: keyof TimeFilter) {
    dispatch(setDepartureTimeFilter({ ...departureTimeFilter, [key]: !departureTimeFilter[key] }))
  }

  function handleArrivalTimeChange(key: keyof TimeFilter) {
    dispatch(setArrivalTimeFilter({ ...arrivalTimeFilter, [key]: !arrivalTimeFilter[key] }))
  }

  const sortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Best'

  return (
    <div className="filter-sidebar" data-testid="filter-sidebar">
      {/* Sort By */}
      <div className="filter-sidebar__section" data-testid="filter-sort-section">
        <h3 className="filter-sidebar__section-title">Sort by</h3>
        <div className="filter-sidebar__sort" ref={sortRef}>
          <button
            className="filter-sidebar__sort-button"
            onClick={() => setSortOpen(!sortOpen)}
            data-testid="sort-dropdown-button"
          >
            <span>{sortLabel}</span>
            <span className={`filter-sidebar__sort-arrow ${sortOpen ? 'filter-sidebar__sort-arrow--open' : ''}`}>▾</span>
          </button>
          {sortOpen && (
            <div className="filter-sidebar__sort-dropdown" data-testid="sort-dropdown">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`filter-sidebar__sort-option ${sortBy === opt.value ? 'filter-sidebar__sort-option--selected' : ''}`}
                  onClick={() => {
                    dispatch(setSortBy(opt.value))
                    setSortOpen(false)
                  }}
                  data-testid={`sort-option-${opt.value}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stops */}
      <div className="filter-sidebar__section" data-testid="filter-stops-section">
        <h3 className="filter-sidebar__section-title">Stops</h3>
        <label className="filter-sidebar__checkbox" data-testid="filter-stops-nonstop">
          <input
            type="checkbox"
            checked={stopsFilter.nonstop}
            onChange={() => handleStopsChange('nonstop')}
          />
          <span>Nonstop</span>
        </label>
        <label className="filter-sidebar__checkbox" data-testid="filter-stops-one">
          <input
            type="checkbox"
            checked={stopsFilter.oneStop}
            onChange={() => handleStopsChange('oneStop')}
          />
          <span>1 stop</span>
        </label>
        <label className="filter-sidebar__checkbox" data-testid="filter-stops-two-plus">
          <input
            type="checkbox"
            checked={stopsFilter.twoPlusStops}
            onChange={() => handleStopsChange('twoPlusStops')}
          />
          <span>2+ stops</span>
        </label>
      </div>

      {/* Airlines */}
      <div className="filter-sidebar__section" data-testid="filter-airlines-section">
        <h3 className="filter-sidebar__section-title">Airlines</h3>
        {Object.entries(airlineCounts).map(([code, info]) => (
          <label key={code} className="filter-sidebar__checkbox" data-testid={`filter-airline-${code}`}>
            <input
              type="checkbox"
              checked={airlinesFilter.includes(code)}
              onChange={() => handleAirlineToggle(code)}
            />
            <span>{info.name} ({info.count})</span>
          </label>
        ))}
      </div>

      {/* Price Range */}
      <div className="filter-sidebar__section" data-testid="filter-price-section">
        <h3 className="filter-sidebar__section-title">Price range</h3>
        <RangeSlider
          min={priceRangeMax[0]}
          max={priceRangeMax[1]}
          value={priceRange}
          onChange={(val) => dispatch(setPriceRange(val))}
          formatLabel={formatPrice}
          testIdPrefix="price-range"
          histogram={priceHistogram}
        />
      </div>

      {/* Duration Range */}
      <div className="filter-sidebar__section" data-testid="filter-duration-section">
        <h3 className="filter-sidebar__section-title">Duration range</h3>
        <RangeSlider
          min={durationRangeMax[0]}
          max={durationRangeMax[1]}
          value={durationRange}
          onChange={(val) => dispatch(setDurationRange(val))}
          formatLabel={formatDuration}
          testIdPrefix="duration-range"
        />
      </div>

      {/* Departure Time */}
      <div className="filter-sidebar__section" data-testid="filter-departure-time-section">
        <h3 className="filter-sidebar__section-title">Departure time</h3>
        {TIME_LABELS.map(({ key, label, range }) => (
          <label key={key} className="filter-sidebar__checkbox" data-testid={`filter-departure-${key}`}>
            <input
              type="checkbox"
              checked={departureTimeFilter[key]}
              onChange={() => handleDepartureTimeChange(key)}
            />
            <span className="filter-sidebar__time-label">
              {label}
              <span className="filter-sidebar__time-range">{range}</span>
            </span>
          </label>
        ))}
      </div>

      {/* Arrival Time */}
      <div className="filter-sidebar__section" data-testid="filter-arrival-time-section">
        <h3 className="filter-sidebar__section-title">Arrival time</h3>
        {TIME_LABELS.map(({ key, label, range }) => (
          <label key={key} className="filter-sidebar__checkbox" data-testid={`filter-arrival-${key}`}>
            <input
              type="checkbox"
              checked={arrivalTimeFilter[key]}
              onChange={() => handleArrivalTimeChange(key)}
            />
            <span className="filter-sidebar__time-label">
              {label}
              <span className="filter-sidebar__time-range">{range}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

export default FilterSidebar
