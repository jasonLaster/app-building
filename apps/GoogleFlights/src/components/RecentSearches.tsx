import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  fetchRecentSearches,
  setTripType,
  setCabinClass,
  setPassengers,
  type TripType,
  type CabinClass,
} from '../slices/searchSlice'
import type { RootState, AppDispatch } from '../store'
import './RecentSearches.css'

function RecentSearches() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { recentSearches, recentSearchesLoading, sessionToken } = useSelector(
    (state: RootState) => state.search
  )

  useEffect(() => {
    if (sessionToken) {
      dispatch(fetchRecentSearches(sessionToken))
    }
  }, [dispatch, sessionToken])

  function handleClick(search: (typeof recentSearches)[number]) {
    // Update search form state
    dispatch(setTripType(search.trip_type as TripType))
    dispatch(setCabinClass(search.cabin_class as CabinClass))
    dispatch(setPassengers({
      adults: search.passengers_adults,
      children: search.passengers_children,
      infants: search.passengers_infants,
    }))

    // Navigate to results
    const params = new URLSearchParams({
      origin: search.origin_code,
      destination: search.dest_code,
      departureDate: search.departure_date.split('T')[0]!,
      tripType: search.trip_type,
      cabinClass: search.cabin_class,
      adults: String(search.passengers_adults),
      children: String(search.passengers_children),
      infants: String(search.passengers_infants),
    })
    if (search.return_date) params.set('returnDate', search.return_date.split('T')[0]!)

    navigate(`/results?${params.toString()}`)
  }

  if (recentSearchesLoading) {
    return (
      <div className="recent-searches" data-testid="recent-searches">
        <h3 className="recent-searches__title">Recent searches</h3>
        <div className="recent-searches__loading">Loading...</div>
      </div>
    )
  }

  if (recentSearches.length === 0) {
    return (
      <div className="recent-searches" data-testid="recent-searches">
        <h3 className="recent-searches__title">Recent searches</h3>
        <p className="recent-searches__empty" data-testid="recent-searches-empty">No recent searches</p>
      </div>
    )
  }

  return (
    <div className="recent-searches" data-testid="recent-searches">
      <h3 className="recent-searches__title">Recent searches</h3>
      <div className="recent-searches__list" data-testid="recent-searches-list">
        {recentSearches.map((search) => {
          const depDate = search.departure_date.split('T')[0] || ''
          const retDate = search.return_date ? search.return_date.split('T')[0] : null
          const totalPassengers = search.passengers_adults + search.passengers_children + search.passengers_infants
          const dateDisplay = retDate
            ? `${formatShortDate(depDate)} – ${formatShortDate(retDate || '')}`
            : formatShortDate(depDate)

          return (
            <button
              key={search.id}
              className="recent-searches__item"
              onClick={() => handleClick(search)}
              data-testid={`recent-search-${search.id}`}
            >
              <div className="recent-searches__route">
                <span className="recent-searches__code">{search.origin_code}</span>
                <span className="recent-searches__arrow">→</span>
                <span className="recent-searches__code">{search.dest_code}</span>
              </div>
              <div className="recent-searches__details">
                <span>{dateDisplay}</span>
                <span className="recent-searches__separator">·</span>
                <span>{totalPassengers} {totalPassengers === 1 ? 'passenger' : 'passengers'}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function formatShortDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default RecentSearches
