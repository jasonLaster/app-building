import { useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import type { Airport } from '../slices/searchSlice'
import { setOrigin, setDestination, setDepartureDate, setReturnDate, setCabinClass, setPassengers } from '../slices/searchSlice'
import type { FlightResult, SortOption, TimeFilter } from '../slices/flightsSlice'
import { searchFlights, loadMoreFlights, checkTrackedRoute } from '../slices/flightsSlice'
import SearchSummaryBar from '../components/SearchSummaryBar'
import FilterSidebar from '../components/FilterSidebar'
import FlightResultCard from '../components/FlightResultCard'
import TrackPricesToggle from '../components/TrackPricesToggle'
import Pagination from '../components/Pagination'
import './SearchResultsPage.css'

function getTimeCategory(dateStr: string): keyof TimeFilter {
  const hour = new Date(dateStr).getHours()
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18) return 'evening'
  return 'night'
}

function hasActiveTimeFilter(filter: TimeFilter): boolean {
  return filter.morning || filter.afternoon || filter.evening || filter.night
}

function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  const originCode = searchParams.get('origin') || ''
  const destCode = searchParams.get('destination') || ''
  const departureDate = searchParams.get('departureDate') || ''
  const returnDate = searchParams.get('returnDate') || null
  const tripType = searchParams.get('tripType') || 'round_trip'
  const cabinClass = searchParams.get('cabinClass') || 'economy'
  const adults = parseInt(searchParams.get('adults') || '1')
  const children = parseInt(searchParams.get('children') || '0')
  const infants = parseInt(searchParams.get('infants') || '0')

  const {
    flights, loading, page, totalPages, loadingMore,
    sortBy, stopsFilter, airlinesFilter,
    priceRange, durationRange,
    departureTimeFilter, arrivalTimeFilter,
  } = useSelector((state: RootState) => state.flights)

  const sessionToken = useSelector((state: RootState) => state.search.sessionToken)

  // Fetch flights on mount or when search params change
  useEffect(() => {
    if (originCode && destCode && departureDate) {
      dispatch(searchFlights({
        origin: originCode,
        destination: destCode,
        departureDate,
        cabinClass,
      }))
      dispatch(checkTrackedRoute({
        sessionToken,
        origin: originCode,
        destination: destCode,
      }))
    }
  }, [dispatch, originCode, destCode, departureDate, cabinClass, sessionToken])

  // Apply client-side filters and sorting
  const filteredFlights = useMemo(() => {
    let result = [...flights]

    // Stops filter
    const hasStopsFilter = stopsFilter.nonstop || stopsFilter.oneStop || stopsFilter.twoPlusStops
    if (hasStopsFilter) {
      result = result.filter((f: FlightResult) => {
        const numStops = Number(f.num_legs) - 1
        if (numStops === 0 && stopsFilter.nonstop) return true
        if (numStops === 1 && stopsFilter.oneStop) return true
        if (numStops >= 2 && stopsFilter.twoPlusStops) return true
        return false
      })
    }

    // Airlines filter
    if (airlinesFilter.length > 0) {
      result = result.filter((f: FlightResult) => airlinesFilter.includes(f.airline_code))
    }

    // Price range filter
    result = result.filter((f: FlightResult) =>
      f.total_price_cents >= priceRange[0] && f.total_price_cents <= priceRange[1]
    )

    // Duration range filter
    result = result.filter((f: FlightResult) =>
      f.duration_minutes >= durationRange[0] && f.duration_minutes <= durationRange[1]
    )

    // Departure time filter
    if (hasActiveTimeFilter(departureTimeFilter)) {
      result = result.filter((f: FlightResult) => {
        const cat = getTimeCategory(f.departure_time)
        return departureTimeFilter[cat]
      })
    }

    // Arrival time filter
    if (hasActiveTimeFilter(arrivalTimeFilter)) {
      result = result.filter((f: FlightResult) => {
        const cat = getTimeCategory(f.arrival_time)
        return arrivalTimeFilter[cat]
      })
    }

    // Sorting
    const sortFns: Record<SortOption, (a: FlightResult, b: FlightResult) => number> = {
      best: (a, b) => {
        // Best = combination of price and duration
        const scoreA = a.total_price_cents / 100 + a.duration_minutes * 2
        const scoreB = b.total_price_cents / 100 + b.duration_minutes * 2
        return scoreA - scoreB
      },
      price: (a, b) => a.total_price_cents - b.total_price_cents,
      duration: (a, b) => a.duration_minutes - b.duration_minutes,
      departure: (a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime(),
      arrival: (a, b) => new Date(a.arrival_time).getTime() - new Date(b.arrival_time).getTime(),
    }
    result.sort(sortFns[sortBy])

    return result
  }, [flights, stopsFilter, airlinesFilter, priceRange, durationRange, departureTimeFilter, arrivalTimeFilter, sortBy])

  const handleSearch = useCallback((params: {
    origin?: Airport
    destination?: Airport
    departureDate?: string
    returnDate?: string | null
    cabinClass?: string
    adults?: number
    children?: number
    infants?: number
  }) => {
    const newParams = new URLSearchParams(searchParams)
    if (params.origin) {
      newParams.set('origin', params.origin.iata_code)
      dispatch(setOrigin(params.origin))
    }
    if (params.destination) {
      newParams.set('destination', params.destination.iata_code)
      dispatch(setDestination(params.destination))
    }
    if (params.departureDate) {
      newParams.set('departureDate', params.departureDate)
      dispatch(setDepartureDate(params.departureDate))
    }
    if (params.returnDate !== undefined) {
      if (params.returnDate) {
        newParams.set('returnDate', params.returnDate)
      } else {
        newParams.delete('returnDate')
      }
      dispatch(setReturnDate(params.returnDate))
    }
    if (params.cabinClass) {
      newParams.set('cabinClass', params.cabinClass)
      dispatch(setCabinClass(params.cabinClass as 'economy' | 'premium_economy' | 'business' | 'first'))
    }
    if (params.adults !== undefined) {
      newParams.set('adults', String(params.adults))
      newParams.set('children', String(params.children ?? children))
      newParams.set('infants', String(params.infants ?? infants))
      dispatch(setPassengers({
        adults: params.adults,
        children: params.children ?? children,
        infants: params.infants ?? infants,
      }))
    }
    setSearchParams(newParams)
  }, [searchParams, setSearchParams, dispatch, children, infants])

  function handleLoadMore() {
    dispatch(loadMoreFlights({
      origin: originCode,
      destination: destCode,
      departureDate,
      cabinClass,
      page: page + 1,
    }))
  }

  if (!originCode || !destCode || !departureDate) {
    return (
      <div className="search-results-page p-6 max-sm:p-3" data-testid="search-results-page">
        <div className="search-results-page__empty" data-testid="search-results-empty">
          <h2>No search parameters</h2>
          <p>Please go back and enter your search criteria.</p>
          <button
            className="search-results-page__back-button"
            onClick={() => navigate('/')}
            data-testid="back-to-search"
          >
            Back to Search
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="search-results-page p-6 max-sm:p-3" data-testid="search-results-page">
      <SearchSummaryBar
        origin={originCode}
        destination={destCode}
        departureDate={departureDate}
        returnDate={returnDate}
        tripType={tripType}
        cabinClass={cabinClass}
        adults={adults}
        children={children}
        infants={infants}
        onSearch={handleSearch}
      />

      <div className="search-results-page__content">
        <FilterSidebar />

        <div className="search-results-page__results">
          <div className="search-results-page__header">
            <div className="search-results-page__count" data-testid="results-count">
              {loading ? 'Searching...' : `${filteredFlights.length} of ${flights.length} flights`}
            </div>
            <TrackPricesToggle
              originCode={originCode}
              destCode={destCode}
              departureDate={departureDate}
              returnDate={returnDate}
              cabinClass={cabinClass}
            />
          </div>

          {loading ? (
            <div className="search-results-page__loading" data-testid="results-loading">
              <div className="search-results-page__loading-spinner" />
              <p>Searching for the best flights...</p>
            </div>
          ) : filteredFlights.length === 0 ? (
            <div className="search-results-page__no-results" data-testid="results-none">
              <p>No flights found matching your criteria.</p>
              <p className="search-results-page__no-results-hint">
                Try adjusting your filters or search dates.
              </p>
            </div>
          ) : (
            <>
              <div className="search-results-page__list" data-testid="results-list">
                {filteredFlights.map((flight: FlightResult) => (
                  <FlightResultCard key={flight.id} flight={flight} />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                loading={loadingMore}
                onLoadMore={handleLoadMore}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchResultsPage
