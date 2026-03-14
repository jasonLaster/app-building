import { useDispatch, useSelector } from 'react-redux'
import {
  setOrigin,
  setDestination,
  swapAirports,
  setDepartureDate,
  setReturnDate,
} from '../slices/searchSlice'
import type { RootState } from '../store'
import TripTypeSelector from '../components/TripTypeSelector'
import PassengerCountSelector from '../components/PassengerCountSelector'
import CabinClassSelector from '../components/CabinClassSelector'
import AirportAutocomplete from '../components/AirportAutocomplete'
import DatePicker from '../components/DatePicker'
import SearchButton from '../components/SearchButton'
import RecentSearches from '../components/RecentSearches'
import PopularDestinations from '../components/PopularDestinations'
import './SearchPage.css'

function SearchPage() {
  const dispatch = useDispatch()
  const {
    tripType,
    origin,
    destination,
    departureDate,
    returnDate,
    validationErrors,
  } = useSelector((state: RootState) => state.search)

  return (
    <div className="search-page" data-testid="search-page">
      <div className="search-page__hero">
        <h1 className="search-page__title">Flights</h1>
        <div className="search-page__form" data-testid="search-form">
          <div className="search-page__selectors">
            <TripTypeSelector />
            <PassengerCountSelector />
            <CabinClassSelector />
          </div>

          <div className="search-page__airports">
            <AirportAutocomplete
              value={origin}
              onChange={(airport) => dispatch(setOrigin(airport))}
              placeholder="Where from?"
              error={validationErrors['origin']}
              testIdPrefix="origin"
            />
            <button
              className="search-page__swap-btn"
              onClick={() => dispatch(swapAirports())}
              data-testid="swap-airports-button"
              title="Swap origin and destination"
            >
              ⇄
            </button>
            <AirportAutocomplete
              value={destination}
              onChange={(airport) => dispatch(setDestination(airport))}
              placeholder="Where to?"
              error={validationErrors['destination']}
              testIdPrefix="destination"
            />
          </div>

          <div className="search-page__dates">
            <DatePicker
              value={departureDate}
              onChange={(date) => dispatch(setDepartureDate(date))}
              placeholder="Departure"
              error={validationErrors['departureDate']}
              testIdPrefix="departure-date"
            />
            {tripType === 'round_trip' && (
              <DatePicker
                value={returnDate}
                onChange={(date) => dispatch(setReturnDate(date))}
                placeholder="Return"
                minDate={departureDate}
                error={validationErrors['returnDate']}
                testIdPrefix="return-date"
              />
            )}
          </div>

          <div className="search-page__search-action">
            <SearchButton />
          </div>
        </div>
      </div>

      <div className="search-page__content">
        <RecentSearches />
        <PopularDestinations />
      </div>
    </div>
  )
}

export default SearchPage
