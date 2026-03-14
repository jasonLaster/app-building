import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  setExploreOrigin,
  setDateRange,
  fetchExploreDestinations,
  fetchExploreDates,
  fetchExploreDeals,
} from '../slices/exploreSlice'
import type { DateRange } from '../slices/exploreSlice'
import type { Airport } from '../slices/searchSlice'
import type { RootState, AppDispatch } from '../store'
import AirportAutocomplete from '../components/AirportAutocomplete'
import DestinationMap from '../components/DestinationMap'
import FlexibleDatesGrid from '../components/FlexibleDatesGrid'
import DealsSection from '../components/DealsSection'
import './ExplorePage.css'

function ExplorePage() {
  const dispatch = useDispatch<AppDispatch>()
  const {
    origin,
    destinations,
    destinationsLoading,
    datePrices,
    datePricesLoading,
    dateRange,
    deals,
    dealsLoading,
  } = useSelector((state: RootState) => state.explore)

  useEffect(() => {
    if (!origin) return
    dispatch(fetchExploreDestinations(origin.iata_code))
    dispatch(fetchExploreDeals(origin.iata_code))
  }, [dispatch, origin])

  useEffect(() => {
    if (!origin) return
    dispatch(fetchExploreDates({ originCode: origin.iata_code, dateRange }))
  }, [dispatch, origin, dateRange])

  const handleOriginChange = useCallback((airport: Airport | null) => {
    dispatch(setExploreOrigin(airport))
  }, [dispatch])

  const handleDateRangeChange = useCallback((range: DateRange) => {
    dispatch(setDateRange(range))
  }, [dispatch])

  return (
    <div className="explore-page" data-testid="explore-page">
      <div className="explore-page__header">
        <h1 className="explore-page__title">Explore destinations</h1>
        <p className="explore-page__subtitle">Find cheap flights from your airport</p>
      </div>

      <div className="explore-page__origin-selector" data-testid="explore-origin-selector">
        <label className="explore-page__origin-label">From</label>
        <AirportAutocomplete
          value={origin}
          onChange={handleOriginChange}
          placeholder="Select origin airport"
          testIdPrefix="explore-origin"
        />
      </div>

      <div className="explore-page__sections">
        <section className="explore-page__map-section">
          <DestinationMap
            destinations={destinations}
            loading={destinationsLoading}
            originCode={origin?.iata_code || null}
          />
        </section>

        <section className="explore-page__dates-section">
          <FlexibleDatesGrid
            datePrices={datePrices}
            loading={datePricesLoading}
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            originCode={origin?.iata_code || null}
          />
        </section>

        <section className="explore-page__deals-section">
          <DealsSection
            deals={deals}
            loading={dealsLoading}
            originCode={origin?.iata_code || null}
          />
        </section>
      </div>
    </div>
  )
}

export default ExplorePage
