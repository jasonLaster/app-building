# Google Flights Clone — Test Specification

## Page: Search Page (Home)

### Components
- TripTypeSelector
- PassengerCountSelector
- CabinClassSelector
- AirportAutocomplete
- DatePicker
- SearchButton
- RecentSearches
- PopularDestinations

### TripTypeSelector

#### Test: TripTypeSelector displays default "Round trip" selection
- **Components**: TripTypeSelector
- **Initial state**: Search page loads with default settings
- **Action**: User observes the trip type selector
- **Expected**: The selector displays "Round trip" as the default selected option. It is rendered as a custom dropdown (not a native select element).

#### Test: TripTypeSelector opens dropdown and shows all options
- **Components**: TripTypeSelector
- **Initial state**: Search page loaded, trip type selector is closed
- **Action**: User clicks the trip type selector
- **Expected**: A dropdown menu opens showing three options: "Round trip", "One way", and "Multi-city". Each option is clickable.

#### Test: TripTypeSelector selects "One way" and hides return date
- **Components**: TripTypeSelector, DatePicker
- **Initial state**: Search page loaded with "Round trip" selected, return date picker is visible
- **Action**: User clicks the trip type selector and selects "One way"
- **Expected**: The selector updates to show "One way". The return date picker is hidden. The dropdown closes.

#### Test: TripTypeSelector selects "Multi-city" option
- **Components**: TripTypeSelector
- **Initial state**: Search page loaded with "Round trip" selected
- **Action**: User clicks the trip type selector and selects "Multi-city"
- **Expected**: The selector updates to show "Multi-city". The search form adjusts to support multi-city input (multiple origin/destination pairs).

#### Test: TripTypeSelector switches back to "Round trip" from "One way"
- **Components**: TripTypeSelector, DatePicker
- **Initial state**: "One way" is currently selected, return date picker is hidden
- **Action**: User clicks the trip type selector and selects "Round trip"
- **Expected**: The selector updates to show "Round trip". The return date picker becomes visible again.

#### Test: TripTypeSelector closes dropdown when clicking outside
- **Components**: TripTypeSelector
- **Initial state**: Trip type dropdown is open
- **Action**: User clicks outside the dropdown
- **Expected**: The dropdown closes without changing the selection.

#### Test: TripTypeSelector can be used multiple times in sequence
- **Components**: TripTypeSelector
- **Initial state**: Search page loaded with default "Round trip"
- **Action**: User selects "One way", then interacts with another element (e.g., clicks airport field), then opens the trip type selector again and selects "Round trip"
- **Expected**: Each interaction correctly updates the selector. The dropdown opens and closes properly on each use. The final state shows "Round trip" selected.

### PassengerCountSelector

#### Test: PassengerCountSelector displays default "1 Adult"
- **Components**: PassengerCountSelector
- **Initial state**: Search page loads with default settings
- **Action**: User observes the passenger count selector
- **Expected**: The selector displays "1" or "1 Adult" as the default.

#### Test: PassengerCountSelector opens dropdown with passenger categories
- **Components**: PassengerCountSelector
- **Initial state**: Search page loaded, passenger selector is closed
- **Action**: User clicks the passenger count selector
- **Expected**: A dropdown opens showing three categories: Adults, Children, and Infants. Each category has a label, a current count, and "+" and "−" buttons.

#### Test: PassengerCountSelector increments adult count
- **Components**: PassengerCountSelector
- **Initial state**: Passenger dropdown is open, Adults count is 1
- **Action**: User clicks the "+" button next to Adults
- **Expected**: Adults count increases to 2. The selector label updates to reflect the new total (e.g., "2 passengers" or "2 Adults").

#### Test: PassengerCountSelector decrements adult count with minimum of 1
- **Components**: PassengerCountSelector
- **Initial state**: Passenger dropdown is open, Adults count is 1
- **Action**: User clicks the "−" button next to Adults
- **Expected**: Adults count remains at 1. The "−" button is disabled or has no effect since at least 1 adult is required.

#### Test: PassengerCountSelector increments and decrements children
- **Components**: PassengerCountSelector
- **Initial state**: Passenger dropdown is open, Children count is 0
- **Action**: User clicks "+" next to Children twice, then clicks "−" once
- **Expected**: Children count goes to 1. The total passenger display updates accordingly.

#### Test: PassengerCountSelector increments and decrements infants
- **Components**: PassengerCountSelector
- **Initial state**: Passenger dropdown is open, Infants count is 0
- **Action**: User clicks "+" next to Infants
- **Expected**: Infants count increases to 1. The total passenger display updates accordingly.

#### Test: PassengerCountSelector prevents infants exceeding adults
- **Components**: PassengerCountSelector
- **Initial state**: Passenger dropdown is open, Adults = 1, Infants = 1
- **Action**: User clicks "+" next to Infants
- **Expected**: Infants count remains at 1 (cannot exceed number of adults). The "+" button is disabled or has no effect.

#### Test: PassengerCountSelector closes dropdown and retains values
- **Components**: PassengerCountSelector
- **Initial state**: Passenger dropdown is open, Adults = 2, Children = 1, Infants = 0
- **Action**: User clicks outside the dropdown to close it
- **Expected**: Dropdown closes. The selector label shows the updated total (e.g., "3 passengers"). Reopening the dropdown shows the same values (2 Adults, 1 Child, 0 Infants).

#### Test: PassengerCountSelector can be used repeatedly
- **Components**: PassengerCountSelector
- **Initial state**: Search page with default passenger counts
- **Action**: User opens the selector, adds 1 adult, closes it, interacts with another element (e.g., selects cabin class), then reopens the passenger selector and adds 1 child
- **Expected**: All values persist correctly between opens. Final state shows 2 Adults, 1 Child. The selector works correctly on each subsequent use.

### CabinClassSelector

#### Test: CabinClassSelector displays default "Economy"
- **Components**: CabinClassSelector
- **Initial state**: Search page loads with default settings
- **Action**: User observes the cabin class selector
- **Expected**: The selector displays "Economy" as the default selected cabin class. It is rendered as a custom dropdown.

#### Test: CabinClassSelector opens dropdown showing all cabin classes
- **Components**: CabinClassSelector
- **Initial state**: Search page loaded, cabin class selector is closed
- **Action**: User clicks the cabin class selector
- **Expected**: A dropdown opens showing four options: "Economy", "Premium Economy", "Business", and "First".

#### Test: CabinClassSelector selects "Business" class
- **Components**: CabinClassSelector
- **Initial state**: Cabin class dropdown is open with "Economy" selected
- **Action**: User clicks "Business"
- **Expected**: The dropdown closes. The selector label updates to "Business".

#### Test: CabinClassSelector selects "Premium Economy" class
- **Components**: CabinClassSelector
- **Initial state**: Cabin class dropdown is open
- **Action**: User clicks "Premium Economy"
- **Expected**: The dropdown closes. The selector label updates to "Premium Economy".

#### Test: CabinClassSelector selects "First" class
- **Components**: CabinClassSelector
- **Initial state**: Cabin class dropdown is open
- **Action**: User clicks "First"
- **Expected**: The dropdown closes. The selector label updates to "First".

#### Test: CabinClassSelector closes dropdown when clicking outside
- **Components**: CabinClassSelector
- **Initial state**: Cabin class dropdown is open
- **Action**: User clicks outside the dropdown
- **Expected**: The dropdown closes without changing the selection.

#### Test: CabinClassSelector can be changed multiple times
- **Components**: CabinClassSelector
- **Initial state**: Search page with "Economy" selected
- **Action**: User selects "Business", interacts with another element, then reopens and selects "First", then reopens and selects "Economy"
- **Expected**: Each selection correctly updates the label. The final state shows "Economy". The dropdown works correctly on each use.

### AirportAutocomplete

#### Test: AirportAutocomplete origin field shows placeholder text
- **Components**: AirportAutocomplete
- **Initial state**: Search page loads with empty origin field
- **Action**: User observes the origin airport field
- **Expected**: The field displays placeholder text indicating the user should enter an origin (e.g., "Where from?").

#### Test: AirportAutocomplete destination field shows placeholder text
- **Components**: AirportAutocomplete
- **Initial state**: Search page loads with empty destination field
- **Action**: User observes the destination airport field
- **Expected**: The field displays placeholder text indicating the user should enter a destination (e.g., "Where to?").

#### Test: AirportAutocomplete shows suggestions when typing airport name
- **Components**: AirportAutocomplete
- **Initial state**: Origin field is focused and empty
- **Action**: User types "Los Angeles" into the origin field
- **Expected**: A suggestion dropdown appears showing matching airports, including "Los Angeles International Airport (LAX)". Each suggestion shows the airport name and IATA code.

#### Test: AirportAutocomplete shows suggestions when typing IATA code
- **Components**: AirportAutocomplete
- **Initial state**: Origin field is focused and empty
- **Action**: User types "JFK" into the origin field
- **Expected**: A suggestion dropdown appears showing "John F. Kennedy International Airport (JFK)" as a match.

#### Test: AirportAutocomplete shows suggestions when typing city name
- **Components**: AirportAutocomplete
- **Initial state**: Destination field is focused and empty
- **Action**: User types "London" into the destination field
- **Expected**: A suggestion dropdown appears showing London-area airports (e.g., "London Heathrow (LHR)").

#### Test: AirportAutocomplete selects a suggestion and populates the field
- **Components**: AirportAutocomplete
- **Initial state**: User has typed "Los" in the origin field, suggestions are visible
- **Action**: User clicks on "Los Angeles International Airport (LAX)" from the suggestions
- **Expected**: The origin field is populated with the selected airport (showing name and/or code). The suggestion dropdown closes.

#### Test: AirportAutocomplete swap button exchanges origin and destination
- **Components**: AirportAutocomplete
- **Initial state**: Origin is set to "LAX" and destination is set to "JFK"
- **Action**: User clicks the swap button between origin and destination fields
- **Expected**: Origin becomes "JFK" and destination becomes "LAX". Both fields update their displayed values.

#### Test: AirportAutocomplete swap button works with empty fields
- **Components**: AirportAutocomplete
- **Initial state**: Origin is set to "LAX", destination is empty
- **Action**: User clicks the swap button
- **Expected**: Origin becomes empty, destination becomes "LAX".

#### Test: AirportAutocomplete clears field and shows new suggestions
- **Components**: AirportAutocomplete
- **Initial state**: Origin field has "LAX" selected
- **Action**: User clears the origin field and types "San"
- **Expected**: The field clears the previous selection. New suggestions appear for airports matching "San" (e.g., "San Francisco International Airport (SFO)", "San Diego International Airport (SAN)").

#### Test: AirportAutocomplete shows no results for invalid query
- **Components**: AirportAutocomplete
- **Initial state**: Origin field is focused
- **Action**: User types "xyznonexistent" into the origin field
- **Expected**: The suggestion dropdown shows a "No airports found" message or similar empty state.

#### Test: AirportAutocomplete destination works after using origin
- **Components**: AirportAutocomplete
- **Initial state**: Origin is set to "LAX"
- **Action**: User clicks the destination field and types "New York"
- **Expected**: Suggestions appear for New York area airports. Selecting one populates the destination. Both origin and destination retain their values.

#### Test: AirportAutocomplete can be used repeatedly
- **Components**: AirportAutocomplete
- **Initial state**: Origin and destination are both populated
- **Action**: User clears origin, types a new airport, selects it, then clears destination, types a new airport, and selects it
- **Expected**: Both fields update correctly. Autocomplete suggestions work properly on each subsequent use.

### DatePicker

#### Test: DatePicker departure field shows placeholder
- **Components**: DatePicker
- **Initial state**: Search page loads with no date selected
- **Action**: User observes the departure date picker
- **Expected**: The departure date field shows a placeholder (e.g., "Departure" or a date format hint).

#### Test: DatePicker return field shows placeholder when Round trip
- **Components**: DatePicker, TripTypeSelector
- **Initial state**: Search page loads with "Round trip" selected
- **Action**: User observes the return date picker
- **Expected**: The return date field is visible and shows a placeholder (e.g., "Return" or a date format hint).

#### Test: DatePicker opens calendar on departure field click
- **Components**: DatePicker
- **Initial state**: Search page loaded, departure date field is not focused
- **Action**: User clicks the departure date field
- **Expected**: A calendar popup opens showing the current month. Past dates are disabled/grayed out. Users can navigate between months.

#### Test: DatePicker selects a departure date
- **Components**: DatePicker
- **Initial state**: Departure date calendar is open
- **Action**: User clicks a future date (e.g., March 25)
- **Expected**: The date is selected and displayed in the departure field (e.g., "Mar 25" or "2026-03-25"). The calendar closes or shifts focus to the return date.

#### Test: DatePicker selects a return date after departure
- **Components**: DatePicker
- **Initial state**: Departure date is set to March 25, return date calendar is open
- **Action**: User clicks a date after the departure date (e.g., April 1)
- **Expected**: The return date is set and displayed. Dates before the departure date are disabled in the return calendar.

#### Test: DatePicker prevents selecting return date before departure
- **Components**: DatePicker
- **Initial state**: Departure date is set to March 25, return date calendar is open
- **Action**: User attempts to click March 20 (before departure)
- **Expected**: The date cannot be selected. It appears disabled/grayed out.

#### Test: DatePicker navigates to next month
- **Components**: DatePicker
- **Initial state**: Calendar is open showing the current month
- **Action**: User clicks the "next month" arrow button
- **Expected**: The calendar displays the next month's dates.

#### Test: DatePicker navigates to previous month (not before current)
- **Components**: DatePicker
- **Initial state**: Calendar is open showing the current month
- **Action**: User clicks the "previous month" arrow button
- **Expected**: If current month is shown, the previous button is disabled or has no effect (cannot navigate to past months). If a future month is shown, it navigates back.

#### Test: DatePicker return field hidden when One way selected
- **Components**: DatePicker, TripTypeSelector
- **Initial state**: "One way" trip type is selected
- **Action**: User observes the date picker area
- **Expected**: Only the departure date picker is visible. The return date picker is not rendered.

#### Test: DatePicker retains departure date when switching trip types
- **Components**: DatePicker, TripTypeSelector
- **Initial state**: "Round trip" selected with departure date March 25 and return date April 1
- **Action**: User switches to "One way" then back to "Round trip"
- **Expected**: The departure date (March 25) is retained. The return date may be cleared or retained depending on implementation.

#### Test: DatePicker can be used repeatedly
- **Components**: DatePicker
- **Initial state**: Departure date is set to March 25
- **Action**: User clicks the departure date field again and selects a different date (e.g., March 28)
- **Expected**: The departure date updates to March 28. The calendar opens and closes correctly on subsequent uses.

### SearchButton

#### Test: SearchButton is displayed with prominent styling
- **Components**: SearchButton
- **Initial state**: Search page is loaded
- **Action**: User observes the search button
- **Expected**: A prominent search button is visible with the primary blue color (#1A73E8) and clear text (e.g., "Search" or a search icon). The button has a hover effect.

#### Test: SearchButton navigates to results page with valid inputs
- **Components**: SearchButton, AirportAutocomplete, DatePicker
- **Initial state**: Origin is "LAX", destination is "JFK", departure date is March 25, return date is April 1, trip type is "Round trip"
- **Action**: User clicks the Search button
- **Expected**: The app navigates to the Search Results page. The search parameters are passed to the results page. A recent search entry is saved to the database.

#### Test: SearchButton shows validation error when origin is missing
- **Components**: SearchButton, AirportAutocomplete
- **Initial state**: Origin is empty, destination is "JFK", dates are set
- **Action**: User clicks the Search button
- **Expected**: The search is not executed. A validation error is shown near the origin field indicating it is required.

#### Test: SearchButton shows validation error when destination is missing
- **Components**: SearchButton, AirportAutocomplete
- **Initial state**: Origin is "LAX", destination is empty, dates are set
- **Action**: User clicks the Search button
- **Expected**: The search is not executed. A validation error is shown near the destination field indicating it is required.

#### Test: SearchButton shows validation error when departure date is missing
- **Components**: SearchButton, DatePicker
- **Initial state**: Origin and destination are set, departure date is empty
- **Action**: User clicks the Search button
- **Expected**: The search is not executed. A validation error is shown near the departure date field.

#### Test: SearchButton shows validation error when return date is missing for round trip
- **Components**: SearchButton, DatePicker, TripTypeSelector
- **Initial state**: "Round trip" selected, origin and destination set, departure date set, return date empty
- **Action**: User clicks the Search button
- **Expected**: The search is not executed. A validation error is shown near the return date field.

#### Test: SearchButton works for One way trip without return date
- **Components**: SearchButton, TripTypeSelector
- **Initial state**: "One way" selected, origin is "LAX", destination is "JFK", departure date is set
- **Action**: User clicks the Search button
- **Expected**: The search executes successfully and navigates to the results page. No validation error for missing return date.

#### Test: SearchButton saves search to recent searches
- **Components**: SearchButton, RecentSearches
- **Initial state**: Valid search parameters filled in, no recent searches
- **Action**: User clicks Search, then navigates back to the Search page
- **Expected**: The search appears in the recent searches section showing origin → destination, dates, and passenger count.

### RecentSearches

#### Test: RecentSearches shows empty state when no searches exist
- **Components**: RecentSearches
- **Initial state**: New session with no previous searches
- **Action**: User observes the area below the search form
- **Expected**: The recent searches section is either hidden or displays an empty state message (e.g., "No recent searches").

#### Test: RecentSearches displays a recent search entry
- **Components**: RecentSearches
- **Initial state**: User has performed one search (LAX → JFK, Mar 25 – Apr 1, 1 adult)
- **Action**: User navigates back to the search page and observes recent searches
- **Expected**: One recent search entry is displayed showing "LAX → JFK", the dates "Mar 25 – Apr 1", and "1 passenger".

#### Test: RecentSearches clicking a recent search re-populates the form
- **Components**: RecentSearches, AirportAutocomplete, DatePicker, PassengerCountSelector, TripTypeSelector, CabinClassSelector
- **Initial state**: A recent search exists (LAX → JFK, Mar 25 – Apr 1, 2 adults, Business class, Round trip)
- **Action**: User clicks on the recent search entry
- **Expected**: The search form is populated with the recent search parameters: origin = LAX, destination = JFK, departure = Mar 25, return = Apr 1, passengers = 2 adults, cabin class = Business, trip type = Round trip. The search is executed and the app navigates to the results page.

#### Test: RecentSearches displays multiple recent searches in order
- **Components**: RecentSearches
- **Initial state**: User has performed 3 searches in order: (1) LAX→JFK, (2) SFO→ORD, (3) LAX→LHR
- **Action**: User navigates back to the search page
- **Expected**: All three recent searches are displayed with the most recent (LAX→LHR) shown first.

#### Test: RecentSearches updates after a new search
- **Components**: RecentSearches, SearchButton
- **Initial state**: One recent search exists (LAX → JFK)
- **Action**: User performs a new search (SFO → ORD) and returns to the search page
- **Expected**: Two recent searches are displayed. The new search (SFO → ORD) appears first, followed by the older one (LAX → JFK).

### PopularDestinations

#### Test: PopularDestinations grid is displayed on search page
- **Components**: PopularDestinations
- **Initial state**: Search page loads
- **Action**: User scrolls to see the popular destinations section below the search form
- **Expected**: A grid of destination cards is visible. Each card shows a city name, country, a colored gradient placeholder image, and a "from $X" starting price.

#### Test: PopularDestinations card shows city, country, and price
- **Components**: PopularDestinations
- **Initial state**: Popular destinations section is visible
- **Action**: User examines a destination card
- **Expected**: The card displays the destination city name, country name, a colored gradient image placeholder, and a starting price (e.g., "from $199").

#### Test: PopularDestinations clicking a card initiates a search
- **Components**: PopularDestinations, AirportAutocomplete, SearchButton
- **Initial state**: Popular destinations section is visible, user has no origin set
- **Action**: User clicks on a destination card (e.g., "Tokyo, Japan")
- **Expected**: The destination field is populated with the corresponding airport. A search is initiated to that destination (the origin may use a default or prompt the user to enter one).

#### Test: PopularDestinations displays multiple cards in grid layout
- **Components**: PopularDestinations
- **Initial state**: Search page loads
- **Action**: User observes the popular destinations section
- **Expected**: Multiple destination cards are displayed in a responsive grid layout (e.g., 3-4 cards per row on desktop).

#### Test: PopularDestinations cards have hover effect
- **Components**: PopularDestinations
- **Initial state**: Popular destinations section is visible
- **Action**: User hovers over a destination card
- **Expected**: The card shows a visual hover effect (e.g., shadow increase, slight scale, or color change) indicating it is interactive/clickable.

## Page: Search Results

### Components
- SearchSummaryBar
- FilterSidebar
- FlightResultCard
- TrackPricesToggle
- Pagination

_(Test entries to be added by PlanPage tasks)_

## Page: Flight Details / Booking

### Components
- FlightSummary
- PriceBreakdown
- PassengerForm
- BookingAction

_(Test entries to be added by PlanPage tasks)_

## Page: My Trips

### Components
- TripsTabs
- TripCard
- TrackedRouteCard
- CancelBookingModal

_(Test entries to be added by PlanPage tasks)_

## Page: Explore

### Components
- DestinationMap
- FlexibleDatesGrid
- DealsSection

_(Test entries to be added by PlanPage tasks)_
