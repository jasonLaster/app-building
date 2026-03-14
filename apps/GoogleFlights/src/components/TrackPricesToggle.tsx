import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { toggleTrackRoute } from '../slices/flightsSlice'
import './TrackPricesToggle.css'

interface TrackPricesToggleProps {
  originCode: string
  destCode: string
  departureDate: string
  returnDate: string | null
  cabinClass: string
}

function TrackPricesToggle({ originCode, destCode, departureDate, returnDate, cabinClass }: TrackPricesToggleProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { isTracked, isTrackedLoading } = useSelector((state: RootState) => state.flights)
  const sessionToken = useSelector((state: RootState) => state.search.sessionToken)

  function handleToggle() {
    if (isTrackedLoading) return
    dispatch(toggleTrackRoute({
      sessionToken,
      originCode,
      destCode,
      departureDateStart: departureDate,
      departureDateEnd: returnDate || departureDate,
      cabinClass,
      isCurrentlyTracked: isTracked,
    }))
  }

  return (
    <div className="track-prices" data-testid="track-prices-toggle">
      <button
        className={`track-prices__button ${isTracked ? 'track-prices__button--active' : ''}`}
        onClick={handleToggle}
        disabled={isTrackedLoading}
        data-testid="track-prices-button"
      >
        <span className="track-prices__icon">
          {isTracked ? '🔔' : '🔕'}
        </span>
        <span className="track-prices__label">
          {isTracked ? 'Tracking prices' : 'Track prices'}
        </span>
        <span className={`track-prices__indicator ${isTracked ? 'track-prices__indicator--on' : ''}`}>
          <span className="track-prices__indicator-dot" />
        </span>
      </button>
    </div>
  )
}

export default TrackPricesToggle
