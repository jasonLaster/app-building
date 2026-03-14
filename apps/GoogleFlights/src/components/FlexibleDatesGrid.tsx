import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { DatePrice, DateRange } from '../slices/exploreSlice'
import './FlexibleDatesGrid.css'

interface FlexibleDatesGridProps {
  datePrices: DatePrice[]
  loading: boolean
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  originCode: string | null
}

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'weekend', label: 'Weekend trips' },
  { value: '1week', label: '1 week' },
  { value: '2weeks', label: '2 weeks' },
]

function getReturnDaysForRange(range: DateRange): number {
  switch (range) {
    case 'weekend':
      return 2
    case '1week':
      return 7
    case '2weeks':
      return 14
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDayName(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

function FlexibleDatesGrid({ datePrices, loading, dateRange, onDateRangeChange, originCode }: FlexibleDatesGridProps) {
  const navigate = useNavigate()

  const { minPrice, maxPrice } = useMemo(() => {
    const prices = datePrices.filter((dp) => dp.price !== null).map((dp) => dp.price!)
    if (prices.length === 0) return { minPrice: 0, maxPrice: 0 }
    return { minPrice: Math.min(...prices), maxPrice: Math.max(...prices) }
  }, [datePrices])

  function getPriceLevel(price: number | null): string {
    if (price === null) return 'none'
    if (maxPrice === minPrice) return 'cheap'
    const ratio = (price - minPrice) / (maxPrice - minPrice)
    if (ratio < 0.33) return 'cheap'
    if (ratio < 0.66) return 'moderate'
    return 'expensive'
  }

  function handleDateClick(dp: DatePrice) {
    if (!dp.price || !originCode) return
    const returnDays = getReturnDaysForRange(dateRange)
    const returnDate = new Date(dp.date + 'T12:00:00')
    returnDate.setDate(returnDate.getDate() + returnDays)
    const retStr = returnDate.toISOString().split('T')[0]

    const params = new URLSearchParams({
      origin: originCode,
      departureDate: dp.date,
      returnDate: retStr!,
    })
    navigate(`/results?${params.toString()}`)
  }

  return (
    <div className="flexible-dates-grid" data-testid="flexible-dates-grid">
      <div className="flexible-dates-grid__header">
        <h3 className="flexible-dates-grid__title">Flexible dates</h3>
        <div className="flexible-dates-grid__range-selector" data-testid="flexible-dates-range-selector">
          {DATE_RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`flexible-dates-grid__range-btn ${dateRange === opt.value ? 'flexible-dates-grid__range-btn--active' : ''}`}
              onClick={() => onDateRangeChange(opt.value)}
              data-testid={`date-range-${opt.value}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flexible-dates-grid__legend">
        <div className="flexible-dates-grid__legend-item">
          <span className="flexible-dates-grid__legend-dot flexible-dates-grid__legend-dot--cheap" />
          <span>Cheap</span>
        </div>
        <div className="flexible-dates-grid__legend-item">
          <span className="flexible-dates-grid__legend-dot flexible-dates-grid__legend-dot--moderate" />
          <span>Moderate</span>
        </div>
        <div className="flexible-dates-grid__legend-item">
          <span className="flexible-dates-grid__legend-dot flexible-dates-grid__legend-dot--expensive" />
          <span>Expensive</span>
        </div>
      </div>

      {loading ? (
        <div className="flexible-dates-grid__loading" data-testid="flexible-dates-loading">
          <div className="flexible-dates-grid__skeleton-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flexible-dates-grid__skeleton-cell" />
            ))}
          </div>
        </div>
      ) : datePrices.length === 0 ? (
        <div className="flexible-dates-grid__empty" data-testid="flexible-dates-empty">
          No price data available for the selected dates
        </div>
      ) : (
        <div className="flexible-dates-grid__grid" data-testid="flexible-dates-cells">
          {datePrices.map((dp) => {
            const level = getPriceLevel(dp.price)
            return (
              <button
                key={dp.date}
                className={`flexible-dates-grid__cell flexible-dates-grid__cell--${level}`}
                onClick={() => handleDateClick(dp)}
                disabled={dp.price === null}
                data-testid={`date-cell-${dp.date}`}
                title={dp.price !== null ? `$${dp.price} on ${formatDate(dp.date)}` : 'No flights available'}
              >
                <span className="flexible-dates-grid__cell-day">{formatDayName(dp.date)}</span>
                <span className="flexible-dates-grid__cell-date">{formatDate(dp.date)}</span>
                <span className="flexible-dates-grid__cell-price">
                  {dp.price !== null ? `$${dp.price}` : '—'}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FlexibleDatesGrid
