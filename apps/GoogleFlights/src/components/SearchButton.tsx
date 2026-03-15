import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setValidationErrors, saveRecentSearch } from '../slices/searchSlice'
import type { RootState, AppDispatch } from '../store'
import './SearchButton.css'

function SearchButton() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { origin, destination, departureDate, returnDate, tripType, passengers, cabinClass, sessionToken } =
    useSelector((state: RootState) => state.search)

  async function handleSearch() {
    const errors: Record<string, string> = {}

    if (!origin) errors['origin'] = 'Please select an origin airport'
    if (!destination) errors['destination'] = 'Please select a destination airport'
    if (!departureDate) errors['departureDate'] = 'Please select a departure date'
    if (tripType === 'round_trip' && !returnDate) errors['returnDate'] = 'Please select a return date'

    if (Object.keys(errors).length > 0) {
      dispatch(setValidationErrors(errors))
      return
    }

    // Save recent search and wait for it to complete before navigating
    await dispatch(saveRecentSearch({
      sessionToken,
      originCode: origin!.iata_code,
      destCode: destination!.iata_code,
      departureDate: departureDate!,
      returnDate: returnDate,
      adults: passengers.adults,
      children: passengers.children,
      infants: passengers.infants,
      cabinClass,
      tripType,
    }))

    // Navigate to results
    const params = new URLSearchParams({
      origin: origin!.iata_code,
      destination: destination!.iata_code,
      departureDate: departureDate!,
      tripType,
      cabinClass,
      adults: String(passengers.adults),
      children: String(passengers.children),
      infants: String(passengers.infants),
    })
    if (returnDate) params.set('returnDate', returnDate)

    navigate(`/results?${params.toString()}`)
  }

  return (
    <button
      className="search-button"
      onClick={handleSearch}
      data-testid="search-button"
    >
      <span className="search-button__icon">🔍</span>
      <span>Search</span>
    </button>
  )
}

export default SearchButton
