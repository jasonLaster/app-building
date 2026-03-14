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

### SearchSummaryBar

#### Test: SearchSummaryBar displays search parameters after search
- **Components**: SearchSummaryBar
- **Initial state**: User searched LAX → JFK, Mar 25 – Apr 1, 1 adult, Economy, Round trip
- **Action**: User observes the summary bar at the top of the results page
- **Expected**: The bar displays origin "LAX", destination "JFK", dates "Mar 25 – Apr 1", "1 adult", and "Economy" inline. Each parameter is visually distinct and clickable.

#### Test: SearchSummaryBar inline edit origin airport
- **Components**: SearchSummaryBar, AirportAutocomplete
- **Initial state**: Results page showing LAX → JFK search
- **Action**: User clicks the origin parameter ("LAX") in the summary bar
- **Expected**: An inline editor opens with an airport autocomplete field pre-filled with "LAX". User types "SFO", selects "San Francisco International Airport (SFO)" from suggestions, and confirms. The search re-executes with SFO → JFK and results update.

#### Test: SearchSummaryBar inline edit destination airport
- **Components**: SearchSummaryBar, AirportAutocomplete
- **Initial state**: Results page showing LAX → JFK search
- **Action**: User clicks the destination parameter ("JFK") in the summary bar
- **Expected**: An inline editor opens with an airport autocomplete field pre-filled with "JFK". User types "ORD", selects "O'Hare International Airport (ORD)" from suggestions, and confirms. The search re-executes with LAX → ORD and results update.

#### Test: SearchSummaryBar inline edit departure date
- **Components**: SearchSummaryBar, DatePicker
- **Initial state**: Results page showing search with departure Mar 25
- **Action**: User clicks the departure date parameter in the summary bar
- **Expected**: A date picker opens with Mar 25 selected. User selects Mar 28. The search re-executes with the new departure date and results update.

#### Test: SearchSummaryBar inline edit return date
- **Components**: SearchSummaryBar, DatePicker
- **Initial state**: Results page showing round trip search with return Apr 1
- **Action**: User clicks the return date parameter in the summary bar
- **Expected**: A date picker opens with Apr 1 selected. User selects Apr 5. The search re-executes with the new return date and results update.

#### Test: SearchSummaryBar inline edit passengers
- **Components**: SearchSummaryBar, PassengerCountSelector
- **Initial state**: Results page showing search with 1 adult
- **Action**: User clicks the passenger count parameter in the summary bar
- **Expected**: A passenger selector dropdown opens showing Adults: 1, Children: 0, Infants: 0. User increments adults to 2 and closes. The search re-executes with 2 adults and results update with new pricing.

#### Test: SearchSummaryBar inline edit cabin class
- **Components**: SearchSummaryBar, CabinClassSelector
- **Initial state**: Results page showing Economy search
- **Action**: User clicks the cabin class parameter in the summary bar
- **Expected**: A dropdown opens showing Economy, Premium Economy, Business, First. User selects "Business". The search re-executes with Business class and results update with new pricing.

#### Test: SearchSummaryBar inline editor closes without changes on outside click
- **Components**: SearchSummaryBar
- **Initial state**: User has clicked the origin parameter and the inline editor is open
- **Action**: User clicks outside the inline editor
- **Expected**: The inline editor closes. The original search parameters are unchanged. No re-search occurs.

#### Test: SearchSummaryBar can be edited multiple times in sequence
- **Components**: SearchSummaryBar
- **Initial state**: Results page showing LAX → JFK search
- **Action**: User edits origin to SFO (results update), then edits cabin class to Business (results update again)
- **Expected**: Each edit triggers a new search. The summary bar reflects all changes: SFO → JFK, Business. Results correspond to the updated parameters.

### FilterSidebar

#### Test: FilterSidebar displays all filter sections
- **Components**: FilterSidebar
- **Initial state**: Search results page loaded with results
- **Action**: User observes the left sidebar
- **Expected**: The sidebar displays filter sections: Stops, Airlines, Price range, Duration range, Departure time, and a Sort by dropdown. All sections are visible and labeled.

#### Test: FilterSidebar stops filter — check Nonstop
- **Components**: FilterSidebar, FlightResultCard
- **Initial state**: Results page with mix of nonstop and connecting flights
- **Action**: User checks the "Nonstop" checkbox in the Stops filter
- **Expected**: Only nonstop flights are displayed in the results list. Flights with 1+ stops are hidden.

#### Test: FilterSidebar stops filter — check 1 stop
- **Components**: FilterSidebar, FlightResultCard
- **Initial state**: Results page with mix of nonstop and connecting flights, no filters applied
- **Action**: User checks the "1 stop" checkbox
- **Expected**: Only 1-stop flights are displayed. Nonstop and 2+ stop flights are hidden.

#### Test: FilterSidebar stops filter — check multiple options
- **Components**: FilterSidebar, FlightResultCard
- **Initial state**: Results page with various flights
- **Action**: User checks both "Nonstop" and "1 stop" checkboxes
- **Expected**: Both nonstop and 1-stop flights are displayed. Only 2+ stop flights are hidden.

#### Test: FilterSidebar stops filter — uncheck to remove filter
- **Components**: FilterSidebar, FlightResultCard
- **Initial state**: "Nonstop" checkbox is checked, only nonstop flights shown
- **Action**: User unchecks "Nonstop"
- **Expected**: All flights are displayed again (no stops filter active).

#### Test: FilterSidebar airlines filter shows airlines with flight counts
- **Components**: FilterSidebar
- **Initial state**: Results page loaded with results from multiple airlines
- **Action**: User observes the Airlines filter section
- **Expected**: A list of airline names is shown, each with a checkbox and a count of how many flights that airline has in the results (e.g., "Delta (12)", "United (8)").

#### Test: FilterSidebar airlines filter — select specific airline
- **Components**: FilterSidebar, FlightResultCard
- **Initial state**: Results with flights from Delta, United, and American
- **Action**: User checks the "Delta" checkbox in the Airlines filter
- **Expected**: Only Delta flights are shown in results. United and American flights are hidden.

#### Test: FilterSidebar airlines filter — select multiple airlines
- **Components**: FilterSidebar, FlightResultCard
- **Initial state**: Results with flights from multiple airlines
- **Action**: User checks "Delta" and "United"
- **Expected**: Only Delta and United flights are shown. Other airline flights are hidden.

#### Test: FilterSidebar price range slider displays histogram
- **Components**: FilterSidebar
- **Initial state**: Results page loaded
- **Action**: User observes the Price range filter section
- **Expected**: A price range slider is displayed with min and max handles. Above or within the slider, a histogram shows the distribution of prices across the results. The min and max price labels are shown.

#### Test: FilterSidebar price range slider filters results
- **Components**: FilterSidebar, FlightResultCard
- **Initial state**: Results page with flights ranging from $150 to $800
- **Action**: User drags the max price handle to $400
- **Expected**: Only flights priced at $400 or below are displayed. Flights above $400 are hidden. The slider shows the updated max value.

#### Test: FilterSidebar price range slider — adjust min price
- **Components**: FilterSidebar, FlightResultCard
- **Initial state**: Results page with flights ranging from $150 to $800
- **Action**: User drags the min price handle to $300
- **Expected**: Only flights priced at $300 or above are displayed. Flights below $300 are hidden.

#### Test: FilterSidebar duration range slider filters results
- **Components**: FilterSidebar, FlightResultCard
- **Initial state**: Results page with flights of various durations
- **Action**: User adjusts the duration slider to max 6 hours
- **Expected**: Only flights with duration of 6 hours or less are displayed. Longer flights are hidden.

#### Test: FilterSidebar departure time filter — Morning checkbox
- **Components**: FilterSidebar, FlightResultCard
- **Initial state**: Results page with flights at various times
- **Action**: User checks "Morning" in the Departure time filter
- **Expected**: Only flights departing in the morning time window are displayed.

#### Test: FilterSidebar departure time filter — multiple time periods
- **Components**: FilterSidebar, FlightResultCard
- **Initial state**: Results page with flights at various times
- **Action**: User checks "Morning" and "Evening"
- **Expected**: Flights departing in either morning or evening time windows are displayed. Afternoon and night flights are hidden.

#### Test: FilterSidebar departure time filter — arrival time checkboxes
- **Components**: FilterSidebar, FlightResultCard
- **Initial state**: Results page loaded
- **Action**: User checks "Afternoon" in the arrival time checkbox group
- **Expected**: Only flights arriving in the afternoon are displayed.

#### Test: FilterSidebar sort by dropdown — default "Best"
- **Components**: FilterSidebar, FlightResultCard
- **Initial state**: Results page loaded, no sort selection made
- **Action**: User observes the Sort by dropdown
- **Expected**: The dropdown shows "Best" as the default selected sort option.

#### Test: FilterSidebar sort by Price (lowest)
- **Components**: FilterSidebar, FlightResultCard
- **Initial state**: Results page with multiple flights at different prices
- **Action**: User selects "Price (lowest)" from the Sort by dropdown
- **Expected**: Results are reordered with the cheapest flight first. Prices increase going down the list.

#### Test: FilterSidebar sort by Duration (shortest)
- **Components**: FilterSidebar, FlightResultCard
- **Initial state**: Results page with flights of various durations
- **Action**: User selects "Duration (shortest)" from the Sort by dropdown
- **Expected**: Results are reordered with the shortest flight first. Durations increase going down the list.

#### Test: FilterSidebar sort by Departure time (earliest)
- **Components**: FilterSidebar, FlightResultCard
- **Initial state**: Results page with flights at various departure times
- **Action**: User selects "Departure time (earliest)" from the Sort by dropdown
- **Expected**: Results are reordered with the earliest departure first.

#### Test: FilterSidebar sort by Arrival time (earliest)
- **Components**: FilterSidebar, FlightResultCard
- **Initial state**: Results page with flights at various arrival times
- **Action**: User selects "Arrival time (earliest)" from the Sort by dropdown
- **Expected**: Results are reordered with the earliest arrival first.

#### Test: FilterSidebar combining multiple filters
- **Components**: FilterSidebar, FlightResultCard
- **Initial state**: Results page with diverse flights
- **Action**: User checks "Nonstop" in Stops, selects "Delta" in Airlines, and sets max price to $500
- **Expected**: Only nonstop Delta flights priced at $500 or below are shown. All three filters are applied simultaneously.

#### Test: FilterSidebar filters can be used repeatedly
- **Components**: FilterSidebar, FlightResultCard
- **Initial state**: Results page with no filters
- **Action**: User checks "Nonstop", observes filtered results, then unchecks "Nonstop" and checks "1 stop", then changes sort to "Price (lowest)"
- **Expected**: Each filter change updates results correctly. The filters work properly on repeated use.

### FlightResultCard

#### Test: FlightResultCard displays airline info
- **Components**: FlightResultCard
- **Initial state**: Results page loaded with flights
- **Action**: User observes a flight result card
- **Expected**: The card shows a colored circle with the airline's initials (airline logo) and the airline name next to it.

#### Test: FlightResultCard displays departure and arrival times
- **Components**: FlightResultCard
- **Initial state**: Results page loaded
- **Action**: User observes a flight result card
- **Expected**: The card shows departure time → arrival time (e.g., "8:00 AM → 4:30 PM"). If the flight arrives on a different day, a "+1" day indicator is shown next to the arrival time.

#### Test: FlightResultCard displays flight duration
- **Components**: FlightResultCard
- **Initial state**: Results page loaded
- **Action**: User observes a flight result card
- **Expected**: The card shows the total flight duration in hours and minutes format (e.g., "5h 30m").

#### Test: FlightResultCard displays stops and layover info
- **Components**: FlightResultCard
- **Initial state**: Results page loaded with a connecting flight
- **Action**: User observes a flight result card for a connecting flight
- **Expected**: The card shows the number of stops and layover airport codes (e.g., "1 stop · DFW"). A nonstop flight shows "Nonstop".

#### Test: FlightResultCard displays price prominently
- **Components**: FlightResultCard
- **Initial state**: Results page loaded
- **Action**: User observes a flight result card
- **Expected**: The price is displayed prominently and right-aligned on the card (e.g., "$342").

#### Test: FlightResultCard displays CO₂ emissions
- **Components**: FlightResultCard
- **Initial state**: Results page loaded
- **Action**: User observes a flight result card
- **Expected**: A CO₂ emissions estimate is shown on the card (e.g., "130 kg CO₂").

#### Test: FlightResultCard expand to show details
- **Components**: FlightResultCard
- **Initial state**: Results page loaded, flight card is collapsed
- **Action**: User clicks on a flight result card to expand it
- **Expected**: The card expands to show a detailed section including: each leg of the journey with departure/arrival times and airports, terminal info, layover duration and airport (for connecting flights), aircraft type, amenities icons (Wi-Fi, power, entertainment), and baggage allowance information.

#### Test: FlightResultCard collapse details
- **Components**: FlightResultCard
- **Initial state**: A flight result card is expanded showing details
- **Action**: User clicks the card again to collapse it
- **Expected**: The expanded details section collapses. The card returns to its compact view.

#### Test: FlightResultCard details show leg-by-leg breakdown
- **Components**: FlightResultCard
- **Initial state**: A connecting flight card is expanded
- **Action**: User examines the expanded details
- **Expected**: Each leg is shown separately with: departure time and airport (with terminal), arrival time and airport (with terminal), flight number, and duration. Between legs, the layover duration and airport are displayed.

#### Test: FlightResultCard details show amenities icons
- **Components**: FlightResultCard
- **Initial state**: A flight card is expanded showing details
- **Action**: User examines the amenities section
- **Expected**: Icons for available amenities are shown: Wi-Fi icon (if has_wifi), power outlet icon (if has_power), entertainment icon (if has_entertainment). Only available amenities are shown or unavailable ones are visually muted.

#### Test: FlightResultCard details show baggage allowance
- **Components**: FlightResultCard
- **Initial state**: A flight card is expanded showing details
- **Action**: User examines the baggage section
- **Expected**: Baggage allowance information is displayed in the expanded details.

#### Test: FlightResultCard overnight flight shows +1 day indicator
- **Components**: FlightResultCard
- **Initial state**: Results include an overnight flight (e.g., departs 11:00 PM, arrives 6:00 AM next day)
- **Action**: User observes the overnight flight card
- **Expected**: The arrival time shows a "+1" indicator next to it (e.g., "6:00 AM +1") to indicate arrival on the next day.

#### Test: FlightResultCard clicking "Select" navigates to booking page
- **Components**: FlightResultCard
- **Initial state**: Results page with flight cards, a card is expanded
- **Action**: User clicks the select/book button on a flight card
- **Expected**: The app navigates to the Flight Details / Booking page with the selected flight's information.

#### Test: FlightResultCard expand and collapse multiple cards
- **Components**: FlightResultCard
- **Initial state**: Results page with multiple flight cards
- **Action**: User expands card A, then expands card B, then collapses card A
- **Expected**: Each card independently expands and collapses. Card B remains expanded when card A is collapsed.

### TrackPricesToggle

#### Test: TrackPricesToggle is displayed on results page
- **Components**: TrackPricesToggle
- **Initial state**: Search results page loaded
- **Action**: User observes the track prices control
- **Expected**: A "Track prices" toggle button is visible on the results page. It is initially in the off/untracked state.

#### Test: TrackPricesToggle enables price tracking
- **Components**: TrackPricesToggle
- **Initial state**: Results page for LAX → JFK, Mar 25 – Apr 1, toggle is off
- **Action**: User clicks the "Track prices" toggle
- **Expected**: The toggle switches to the on/tracked state with a visual indicator (e.g., filled toggle, checkmark, or color change). The route is saved to tracked_routes in the database for the current session.

#### Test: TrackPricesToggle disables price tracking
- **Components**: TrackPricesToggle
- **Initial state**: Price tracking is enabled (toggle is on) for the current route
- **Action**: User clicks the "Track prices" toggle again
- **Expected**: The toggle switches to the off/untracked state. The route is removed from tracked_routes in the database.

#### Test: TrackPricesToggle reflects existing tracked route
- **Components**: TrackPricesToggle
- **Initial state**: User previously tracked LAX → JFK route, then searches LAX → JFK again
- **Action**: User observes the toggle on the results page
- **Expected**: The toggle is in the on/tracked state, reflecting that this route is already being tracked.

#### Test: TrackPricesToggle tracked route appears in My Trips
- **Components**: TrackPricesToggle, TrackedRouteCard
- **Initial state**: User enables price tracking for LAX → JFK
- **Action**: User navigates to My Trips page and selects the "Tracked" tab
- **Expected**: The tracked route (LAX → JFK) appears in the Tracked tab with route details, date range, current lowest price, and untrack button.

#### Test: TrackPricesToggle can be toggled multiple times
- **Components**: TrackPricesToggle
- **Initial state**: Results page, toggle is off
- **Action**: User toggles on, interacts with filters, toggles off, then toggles on again
- **Expected**: Each toggle correctly switches state. The database is updated on each toggle. The final state is tracked (on).

### Pagination

#### Test: Pagination "Load more" button is displayed at bottom of results
- **Components**: Pagination
- **Initial state**: Search results page with more results available than initially displayed
- **Action**: User scrolls to the bottom of the results list
- **Expected**: A "Load more results" button is visible at the bottom of the results list.

#### Test: Pagination loading more results appends to list
- **Components**: Pagination, FlightResultCard
- **Initial state**: Results page showing initial set of results (e.g., 20 flights), more available
- **Action**: User clicks the "Load more results" button
- **Expected**: Additional flight results are appended below the existing results. The previously displayed results remain in place. The new results are visible.

#### Test: Pagination button hidden when all results loaded
- **Components**: Pagination
- **Initial state**: All available flight results have been loaded
- **Action**: User scrolls to the bottom of the results list
- **Expected**: The "Load more results" button is no longer displayed (or is disabled) since there are no more results to load.

#### Test: Pagination shows loading state while fetching
- **Components**: Pagination
- **Initial state**: Results page with more results available
- **Action**: User clicks the "Load more results" button
- **Expected**: The button shows a loading indicator (spinner or "Loading..." text) while additional results are being fetched. The button is not clickable during loading.

#### Test: Pagination preserves filters when loading more
- **Components**: Pagination, FilterSidebar, FlightResultCard
- **Initial state**: Results page with "Nonstop" filter active, showing filtered results
- **Action**: User clicks "Load more results"
- **Expected**: The newly loaded results also respect the active filters. Only nonstop flights are appended.

#### Test: Pagination can be used repeatedly
- **Components**: Pagination, FlightResultCard
- **Initial state**: Results page with many available results
- **Action**: User clicks "Load more" three times in sequence
- **Expected**: Each click appends more results. Results accumulate correctly without duplicates. The button disappears when no more results remain.

## Page: Flight Details / Booking

### Components
- FlightSummary
- PriceBreakdown
- PassengerForm
- BookingAction

### FlightSummary

#### Test: FlightSummary displays full outbound itinerary
- **Components**: FlightSummary
- **Initial state**: User selected a one-way flight (LAX → JFK, nonstop, 5h 30m, Delta DL100) from search results
- **Action**: User observes the Flight Details / Booking page
- **Expected**: The FlightSummary shows the outbound itinerary with airline name and logo (colored circle with "DL" initials), flight number "DL100", departure airport "LAX" with terminal info, arrival airport "JFK" with terminal info, departure time, arrival time, and total duration "5h 30m". A timeline visualization connects departure and arrival.

#### Test: FlightSummary displays outbound and return flights for round trip
- **Components**: FlightSummary
- **Initial state**: User selected a round-trip flight (LAX → JFK outbound, JFK → LAX return) from search results
- **Action**: User observes the FlightSummary section
- **Expected**: Two separate flight sections are displayed — one labeled for the outbound journey (LAX → JFK) and one for the return journey (JFK → LAX). Each section shows its own airline, flight number, times, duration, and timeline visualization.

#### Test: FlightSummary displays connecting flight with multiple legs
- **Components**: FlightSummary
- **Initial state**: User selected a connecting flight (LAX → DFW → JFK, 1 stop) from search results
- **Action**: User observes the FlightSummary section
- **Expected**: The itinerary displays both legs in order: Leg 1 (LAX → DFW) with its airline, flight number, departure/arrival times, terminal info, and duration; then a layover indicator showing layover duration and airport (e.g., "2h 15m layover at DFW"); then Leg 2 (DFW → JFK) with its details. The timeline visualization shows the full journey with the layover marked.

#### Test: FlightSummary shows total duration and stops count
- **Components**: FlightSummary
- **Initial state**: User selected a 1-stop flight with total duration 8h 45m
- **Action**: User observes the FlightSummary header area
- **Expected**: A summary line displays the total journey duration "8h 45m" and the number of stops "1 stop". For nonstop flights, it shows "Nonstop".

#### Test: FlightSummary shows overnight arrival indicator
- **Components**: FlightSummary
- **Initial state**: User selected a flight that arrives the next day (departs 11:00 PM, arrives 6:00 AM +1)
- **Action**: User observes the arrival time in FlightSummary
- **Expected**: The arrival time displays a "+1" indicator next to it, signaling the flight arrives the following day.

#### Test: FlightSummary shows aircraft type and amenities
- **Components**: FlightSummary
- **Initial state**: User selected a flight with aircraft_type "Boeing 737-800", has_wifi=true, has_power=true, has_entertainment=false
- **Action**: User observes the flight leg details in FlightSummary
- **Expected**: The aircraft type "Boeing 737-800" is displayed. Amenity icons are shown: Wi-Fi icon (present), power outlet icon (present). Entertainment icon is not shown or shown as unavailable.

#### Test: FlightSummary shows baggage allowance
- **Components**: FlightSummary
- **Initial state**: User selected a flight and the booking page is loaded
- **Action**: User observes the FlightSummary details
- **Expected**: Baggage allowance information is displayed for the selected cabin class (e.g., "1 carry-on bag, 1 checked bag included" for economy).

### PriceBreakdown

#### Test: PriceBreakdown displays base fare per passenger
- **Components**: PriceBreakdown
- **Initial state**: User selected a flight for 1 adult in economy class, base fare $250, taxes $45
- **Action**: User observes the PriceBreakdown section
- **Expected**: The breakdown shows a line item "Base fare" with "$250" for 1 adult. The line item is labeled with the passenger type "Adult × 1".

#### Test: PriceBreakdown displays taxes and fees
- **Components**: PriceBreakdown
- **Initial state**: User selected a flight with taxes_cents = 4500
- **Action**: User observes the PriceBreakdown section
- **Expected**: A "Taxes and fees" line item shows "$45.00". The taxes are listed as a separate line from the base fare.

#### Test: PriceBreakdown displays total price
- **Components**: PriceBreakdown
- **Initial state**: User selected a flight with base fare $250 and taxes $45
- **Action**: User observes the PriceBreakdown section
- **Expected**: A prominently displayed "Total" line shows "$295.00". It is visually distinct (bold, larger font, or separated by a divider) from the individual line items.

#### Test: PriceBreakdown shows per-passenger-type pricing for mixed group
- **Components**: PriceBreakdown
- **Initial state**: User searched with 2 adults, 1 child, 1 infant and selected a flight
- **Action**: User observes the PriceBreakdown section
- **Expected**: The breakdown shows separate line items for each passenger type: "Adult × 2" with the per-adult base fare and subtotal, "Child × 1" with the child base fare, "Infant × 1" with the infant base fare. Taxes and fees are shown. The grand total sums all passengers.

#### Test: PriceBreakdown updates for round-trip flights
- **Components**: PriceBreakdown
- **Initial state**: User selected a round-trip flight (outbound + return)
- **Action**: User observes the PriceBreakdown section
- **Expected**: The breakdown includes pricing for both the outbound and return flights. The total reflects the combined cost of both directions plus all taxes and fees.

#### Test: PriceBreakdown reflects selected cabin class pricing
- **Components**: PriceBreakdown
- **Initial state**: User searched for Business class and selected a flight
- **Action**: User observes the PriceBreakdown section
- **Expected**: The cabin class "Business" is indicated in the breakdown. The base fare reflects the business class pricing (higher than economy). The total price matches the business class total_price_cents from the database.

### PassengerForm

#### Test: PassengerForm displays correct number of passenger forms
- **Components**: PassengerForm
- **Initial state**: User searched with 2 adults and 1 child, then selected a flight
- **Action**: User observes the PassengerForm section
- **Expected**: Three separate passenger sub-forms are displayed, labeled "Passenger 1 (Adult)", "Passenger 2 (Adult)", and "Passenger 3 (Child)". Each form has fields for first name, last name, date of birth, and gender.

#### Test: PassengerForm shows primary passenger contact fields
- **Components**: PassengerForm
- **Initial state**: Booking page loaded with 2 adults
- **Action**: User observes Passenger 1 form
- **Expected**: Passenger 1 (primary passenger) has additional fields for email address and phone number that are not present on the other passenger forms.

#### Test: PassengerForm first name and last name input
- **Components**: PassengerForm
- **Initial state**: Booking page loaded, passenger forms are empty
- **Action**: User types "John" in the first name field and "Doe" in the last name field of Passenger 1
- **Expected**: The first name field displays "John" and the last name field displays "Doe". The input is reflected in the form state.

#### Test: PassengerForm date of birth picker
- **Components**: PassengerForm
- **Initial state**: Booking page loaded, Passenger 1 form visible
- **Action**: User clicks the date of birth field and selects a date (e.g., January 15, 1990)
- **Expected**: A date picker opens. After selecting the date, the field displays "01/15/1990" (or equivalent formatted date). The date picker closes.

#### Test: PassengerForm gender dropdown
- **Components**: PassengerForm
- **Initial state**: Booking page loaded, Passenger 1 form visible
- **Action**: User clicks the gender dropdown
- **Expected**: A dropdown opens with options (e.g., "Male", "Female", "Other", "Prefer not to say"). Selecting an option updates the field and closes the dropdown.

#### Test: PassengerForm email validation
- **Components**: PassengerForm
- **Initial state**: Booking page loaded, Passenger 1 form visible
- **Action**: User types "invalid-email" in the email field and attempts to submit
- **Expected**: A validation error appears on the email field indicating an invalid email format (e.g., "Please enter a valid email address"). The form does not submit.

#### Test: PassengerForm email accepts valid input
- **Components**: PassengerForm
- **Initial state**: Booking page loaded, Passenger 1 form visible
- **Action**: User types "john.doe@example.com" in the email field
- **Expected**: The email field displays "john.doe@example.com" with no validation errors.

#### Test: PassengerForm phone number input
- **Components**: PassengerForm
- **Initial state**: Booking page loaded, Passenger 1 form visible
- **Action**: User types "+1 555-123-4567" in the phone number field
- **Expected**: The phone number field accepts and displays the input. No validation error is shown.

#### Test: PassengerForm required field validation
- **Components**: PassengerForm, BookingAction
- **Initial state**: Booking page loaded, all passenger forms are empty
- **Action**: User clicks the "Book Flight" button without filling in any fields
- **Expected**: Validation errors appear on all required fields (first name, last name, date of birth, gender for each passenger; email and phone for primary passenger). The booking is not submitted. Error messages indicate which fields are required.

#### Test: PassengerForm infant passenger form
- **Components**: PassengerForm
- **Initial state**: User searched with 1 adult, 1 infant and selected a flight
- **Action**: User observes the passenger forms
- **Expected**: Two forms are displayed: "Passenger 1 (Adult)" with contact fields, and "Passenger 2 (Infant)" with first name, last name, date of birth, and gender but no email/phone fields.

#### Test: PassengerForm can be filled and edited multiple times
- **Components**: PassengerForm
- **Initial state**: Booking page loaded, passenger form is empty
- **Action**: User fills in first name "John", then changes it to "Jane", interacts with date of birth picker, then returns to first name and changes it to "Alex"
- **Expected**: Each edit is correctly reflected in the form. The final state shows "Alex" in the first name field. Other fields retain their entered values between edits.

### BookingAction

#### Test: BookingAction displays "Book Flight" button
- **Components**: BookingAction
- **Initial state**: Booking page loaded with flight selected
- **Action**: User observes the BookingAction section
- **Expected**: A prominent "Book Flight" button is displayed. The button text reads "Book Flight" and is styled as a primary action button (blue background, white text).

#### Test: BookingAction successfully books a flight
- **Components**: BookingAction, PassengerForm, PriceBreakdown
- **Initial state**: All passenger forms are filled out correctly (Passenger 1: John Doe, john@example.com, +1 555-123-4567, DOB 1990-01-15, Male)
- **Action**: User clicks the "Book Flight" button
- **Expected**: The booking is saved to the database. A confirmation message is displayed with a unique booking reference number (e.g., "Booking confirmed! Reference: ABC123"). The bookings table has a new row with status "confirmed", the correct flight_id, session_id, cabin_class, and total_price_cents. The booking_passengers table has corresponding passenger records.

#### Test: BookingAction shows booking reference number
- **Components**: BookingAction
- **Initial state**: User has just successfully booked a flight
- **Action**: User observes the confirmation
- **Expected**: A booking reference number is prominently displayed (e.g., "Your booking reference: GF-ABC123"). The reference is unique and can be used to identify the booking in the My Trips page.

#### Test: BookingAction prevents double booking
- **Components**: BookingAction
- **Initial state**: User has just successfully booked a flight and sees the confirmation
- **Action**: User attempts to click "Book Flight" again (e.g., via browser back or re-clicking)
- **Expected**: The button is either disabled after successful booking, or the system prevents duplicate bookings. No second booking is created in the database.

#### Test: BookingAction shows loading state during submission
- **Components**: BookingAction
- **Initial state**: All passenger forms filled, user clicks "Book Flight"
- **Action**: User observes the button during submission
- **Expected**: The button shows a loading indicator (spinner or "Booking..." text) while the request is being processed. The button is disabled during this time to prevent multiple clicks.

#### Test: BookingAction booking appears in My Trips
- **Components**: BookingAction, TripCard
- **Initial state**: User has just successfully booked a flight (LAX → JFK, Mar 25, Delta DL100, $295)
- **Action**: User navigates to the My Trips page
- **Expected**: The "Upcoming" tab shows the newly booked trip with route "LAX → JFK", date "Mar 25", airline "Delta", status badge "Confirmed", price "$295", and the booking reference number.

#### Test: BookingAction handles booking error gracefully
- **Components**: BookingAction
- **Initial state**: All passenger forms filled, but a network or server error occurs during booking
- **Action**: User clicks "Book Flight" and the request fails
- **Expected**: An error message is displayed (e.g., "Booking failed. Please try again."). The form data is preserved so the user does not need to re-enter information. The "Book Flight" button becomes clickable again.

## Page: My Trips

### Components
- TripsTabs
- TripCard
- TrackedRouteCard
- CancelBookingModal

### TripsTabs

#### Test: TripsTabs displays three tabs
- **Components**: TripsTabs
- **Initial state**: User navigates to the My Trips page
- **Action**: User observes the tab bar at the top of the page
- **Expected**: Three tabs are displayed: "Upcoming", "Past", and "Tracked". The "Upcoming" tab is selected by default and visually highlighted (e.g., underline or bold text with primary color #1A73E8).

#### Test: TripsTabs switches to Past tab
- **Components**: TripsTabs, TripCard
- **Initial state**: My Trips page loaded with "Upcoming" tab active, user has both upcoming and past bookings
- **Action**: User clicks the "Past" tab
- **Expected**: The "Past" tab becomes visually selected. The content area updates to show only trips with past departure dates (status "Completed" or "Cancelled"). Upcoming trips are no longer visible.

#### Test: TripsTabs switches to Tracked tab
- **Components**: TripsTabs, TrackedRouteCard
- **Initial state**: My Trips page loaded with "Upcoming" tab active, user has tracked routes
- **Action**: User clicks the "Tracked" tab
- **Expected**: The "Tracked" tab becomes visually selected. The content area updates to show tracked route cards instead of trip cards. Trip cards are no longer visible.

#### Test: TripsTabs switches back to Upcoming after visiting other tabs
- **Components**: TripsTabs, TripCard
- **Initial state**: User is on My Trips page viewing the "Tracked" tab
- **Action**: User clicks "Past" tab, then clicks "Upcoming" tab
- **Expected**: Each tab click updates the selected tab styling and displayed content correctly. After returning to "Upcoming", only upcoming trips are shown with the "Upcoming" tab visually selected.

#### Test: TripsTabs Upcoming tab shows empty state
- **Components**: TripsTabs, TripCard
- **Initial state**: User has no upcoming bookings
- **Action**: User views the "Upcoming" tab on My Trips page
- **Expected**: An empty state message is displayed (e.g., "No upcoming trips. Search for flights to plan your next trip!"). No trip cards are shown.

#### Test: TripsTabs Past tab shows empty state
- **Components**: TripsTabs, TripCard
- **Initial state**: User has no past bookings
- **Action**: User clicks the "Past" tab
- **Expected**: An empty state message is displayed (e.g., "No past trips yet."). No trip cards are shown.

#### Test: TripsTabs Tracked tab shows empty state
- **Components**: TripsTabs, TrackedRouteCard
- **Initial state**: User has no tracked routes
- **Action**: User clicks the "Tracked" tab
- **Expected**: An empty state message is displayed (e.g., "No tracked routes. Use the 'Track prices' button on search results to start tracking."). No tracked route cards are shown.

#### Test: TripsTabs Upcoming tab sorts trips by departure date ascending
- **Components**: TripsTabs, TripCard
- **Initial state**: User has 3 upcoming bookings with departure dates Mar 25, Apr 10, and Mar 30
- **Action**: User views the "Upcoming" tab
- **Expected**: Trip cards are sorted by departure date ascending: Mar 25 first, Mar 30 second, Apr 10 third. The soonest departure is at the top.

### TripCard

#### Test: TripCard displays route information
- **Components**: TripCard
- **Initial state**: User has an upcoming booking from LAX to JFK
- **Action**: User observes a trip card in the Upcoming tab
- **Expected**: The card displays the route as "LAX → JFK" showing the origin and destination airport IATA codes.

#### Test: TripCard displays travel dates
- **Components**: TripCard
- **Initial state**: User has a round-trip booking departing Mar 25, returning Mar 30
- **Action**: User observes the trip card
- **Expected**: The card displays the departure date "Mar 25" and return date "Mar 30". For one-way trips, only the departure date is shown.

#### Test: TripCard displays airline and flight info
- **Components**: TripCard
- **Initial state**: User has a booking on Delta flight DL100
- **Action**: User observes the trip card
- **Expected**: The card shows the airline name "Delta" and flight number "DL100". The airline logo (colored circle with airline initials) is displayed.

#### Test: TripCard displays Confirmed status badge
- **Components**: TripCard
- **Initial state**: User has an upcoming confirmed booking
- **Action**: User observes the trip card status
- **Expected**: A status badge reading "Confirmed" is displayed on the card. The badge has a visual style indicating active status (e.g., green or blue background with white text).

#### Test: TripCard displays Completed status badge
- **Components**: TripCard
- **Initial state**: User views the Past tab with a completed trip
- **Action**: User observes the trip card status
- **Expected**: A status badge reading "Completed" is displayed. The badge has a distinct style from Confirmed (e.g., gray background).

#### Test: TripCard displays Cancelled status badge
- **Components**: TripCard
- **Initial state**: User views trips that include a cancelled booking
- **Action**: User observes the cancelled trip card
- **Expected**: A status badge reading "Cancelled" is displayed. The badge has a distinct style (e.g., red or muted background) indicating the trip was cancelled.

#### Test: TripCard displays price paid
- **Components**: TripCard
- **Initial state**: User has a booking with total_price_cents = 29500
- **Action**: User observes the trip card
- **Expected**: The card displays the price as "$295.00" prominently on the card.

#### Test: TripCard displays booking reference
- **Components**: TripCard
- **Initial state**: User has a booking with booking_reference "GF-ABC123"
- **Action**: User observes the trip card
- **Expected**: The booking reference "GF-ABC123" is displayed on the card so the user can identify and reference their booking.

#### Test: TripCard shows cancel button for upcoming confirmed flights
- **Components**: TripCard, CancelBookingModal
- **Initial state**: User has an upcoming confirmed booking
- **Action**: User observes the trip card in the Upcoming tab
- **Expected**: A "Cancel" button is visible on the card. The button is styled as a secondary/destructive action (e.g., red text or outline).

#### Test: TripCard does not show cancel button for past flights
- **Components**: TripCard
- **Initial state**: User views the Past tab with completed trips
- **Action**: User observes trip cards in the Past tab
- **Expected**: No "Cancel" button is shown on any trip card in the Past tab. Completed and past trips cannot be cancelled.

#### Test: TripCard does not show cancel button for already cancelled flights
- **Components**: TripCard
- **Initial state**: User has a cancelled booking visible in any tab
- **Action**: User observes the cancelled trip card
- **Expected**: No "Cancel" button is shown. The card only displays the "Cancelled" status badge.

#### Test: TripCard displays one-way trip correctly
- **Components**: TripCard
- **Initial state**: User has a one-way booking from SFO to ORD on Apr 5
- **Action**: User observes the trip card
- **Expected**: The card shows route "SFO → ORD", a single departure date "Apr 5", and no return date. All other fields (airline, price, status, reference) are displayed normally.

#### Test: TripCard displays round-trip with return flight info
- **Components**: TripCard
- **Initial state**: User has a round-trip booking LAX → JFK departing Mar 25, returning Mar 30
- **Action**: User observes the trip card
- **Expected**: The card shows route "LAX → JFK", both dates "Mar 25 – Mar 30", and all booking details. The card indicates it is a round-trip booking.

### TrackedRouteCard

#### Test: TrackedRouteCard displays route
- **Components**: TrackedRouteCard
- **Initial state**: User has a tracked route from LAX to LHR, visible in the Tracked tab
- **Action**: User observes the tracked route card
- **Expected**: The card displays the route as "LAX → LHR" with origin and destination airport codes.

#### Test: TrackedRouteCard displays date range being tracked
- **Components**: TrackedRouteCard
- **Initial state**: User tracks a route with departure_date_start "2026-04-01" and departure_date_end "2026-04-15"
- **Action**: User observes the tracked route card
- **Expected**: The card displays the tracked date range as "Apr 1 – Apr 15" (or similar formatted date range).

#### Test: TrackedRouteCard displays current lowest price
- **Components**: TrackedRouteCard
- **Initial state**: User has a tracked route and there are flights available on that route with the lowest price being $320
- **Action**: User observes the tracked route card
- **Expected**: The card displays the current lowest price as "$320" prominently.

#### Test: TrackedRouteCard displays price trend indicator going up
- **Components**: TrackedRouteCard
- **Initial state**: User has a tracked route where prices have increased by 12% compared to when tracking started
- **Action**: User observes the tracked route card price trend
- **Expected**: An upward arrow icon is displayed with "+12%" text next to the current price, indicating prices have risen. The trend indicator is styled in a color indicating increase (e.g., red).

#### Test: TrackedRouteCard displays price trend indicator going down
- **Components**: TrackedRouteCard
- **Initial state**: User has a tracked route where prices have decreased by 8% compared to when tracking started
- **Action**: User observes the tracked route card price trend
- **Expected**: A downward arrow icon is displayed with "-8%" text next to the current price, indicating prices have dropped. The trend indicator is styled in a color indicating decrease (e.g., green).

#### Test: TrackedRouteCard Search button navigates to search results
- **Components**: TrackedRouteCard
- **Initial state**: User has a tracked route LAX → LHR, Apr 1 – Apr 15
- **Action**: User clicks the "Search" button on the tracked route card
- **Expected**: The user is navigated to the Search Results page with the route (LAX → LHR) and date range (Apr 1 – Apr 15) pre-populated. Current flights for this route are displayed.

#### Test: TrackedRouteCard Untrack button removes tracking
- **Components**: TrackedRouteCard
- **Initial state**: User has 2 tracked routes in the Tracked tab
- **Action**: User clicks the "Untrack" button on one of the tracked route cards
- **Expected**: The tracked route is removed from the database (tracked_routes table). The card is removed from the Tracked tab. Only 1 tracked route card remains. No confirmation modal is shown for untracking.

#### Test: TrackedRouteCard Untrack then re-check shows updated list
- **Components**: TrackedRouteCard, TripsTabs
- **Initial state**: User has 3 tracked routes in the Tracked tab
- **Action**: User clicks "Untrack" on the first card, then switches to "Upcoming" tab and back to "Tracked" tab
- **Expected**: The Tracked tab consistently shows only 2 remaining tracked route cards. The untracked route does not reappear.

#### Test: TrackedRouteCard Search button works for multiple cards
- **Components**: TrackedRouteCard
- **Initial state**: User has 2 tracked routes: LAX → LHR and SFO → NRT
- **Action**: User clicks "Search" on the SFO → NRT card, navigates back to My Trips, then clicks "Search" on the LAX → LHR card
- **Expected**: Each "Search" click navigates to the Search Results page with the correct route and dates pre-populated for that specific tracked route. The second search correctly shows LAX → LHR results, not the previous SFO → NRT search.

### CancelBookingModal

#### Test: CancelBookingModal opens when Cancel button is clicked
- **Components**: CancelBookingModal, TripCard
- **Initial state**: User has an upcoming confirmed booking in the Upcoming tab
- **Action**: User clicks the "Cancel" button on the trip card
- **Expected**: A modal dialog opens with a confirmation message (e.g., "Are you sure you want to cancel this booking?"). The modal displays the booking details: route, dates, airline, and booking reference. The modal has two buttons: "Cancel Booking" (destructive/confirm action) and "Keep Booking" (dismiss action).

#### Test: CancelBookingModal shows booking details
- **Components**: CancelBookingModal, TripCard
- **Initial state**: User clicks Cancel on a booking LAX → JFK, Mar 25, Delta DL100, ref GF-ABC123
- **Action**: User observes the modal content
- **Expected**: The modal displays the specific booking details: route "LAX → JFK", date "Mar 25", airline "Delta DL100", booking reference "GF-ABC123". This helps the user confirm they are cancelling the correct booking.

#### Test: CancelBookingModal confirms cancellation
- **Components**: CancelBookingModal, TripCard
- **Initial state**: Cancel modal is open for an upcoming booking
- **Action**: User clicks the "Cancel Booking" button in the modal
- **Expected**: The booking status is updated to "cancelled" in the database. The modal closes. The trip card updates to show a "Cancelled" status badge. The "Cancel" button is no longer visible on that trip card. The trip card remains visible in the list.

#### Test: CancelBookingModal dismiss keeps booking
- **Components**: CancelBookingModal, TripCard
- **Initial state**: Cancel modal is open for an upcoming booking
- **Action**: User clicks the "Keep Booking" button in the modal
- **Expected**: The modal closes. The booking remains unchanged with status "Confirmed". The trip card still shows the "Confirmed" badge and the "Cancel" button is still available.

#### Test: CancelBookingModal close via overlay click
- **Components**: CancelBookingModal
- **Initial state**: Cancel modal is open
- **Action**: User clicks the modal overlay/backdrop (outside the modal content)
- **Expected**: The modal closes without cancelling the booking. The booking status remains "Confirmed".

#### Test: CancelBookingModal shows loading state during cancellation
- **Components**: CancelBookingModal
- **Initial state**: Cancel modal is open, user clicks "Cancel Booking"
- **Action**: User observes the modal during the cancellation request
- **Expected**: The "Cancel Booking" button shows a loading indicator (spinner or "Cancelling..." text) while the request is processing. Both buttons are disabled during this time to prevent duplicate actions.

#### Test: CancelBookingModal cancellation error handling
- **Components**: CancelBookingModal
- **Initial state**: Cancel modal is open, a network error occurs during cancellation
- **Action**: User clicks "Cancel Booking" and the request fails
- **Expected**: An error message is displayed in the modal (e.g., "Failed to cancel booking. Please try again."). The modal remains open. The buttons become clickable again so the user can retry or dismiss.

#### Test: CancelBookingModal cancelled trip persists in correct tab
- **Components**: CancelBookingModal, TripCard, TripsTabs
- **Initial state**: User cancels an upcoming booking via the modal
- **Action**: User switches to "Past" tab and back to "Upcoming" tab
- **Expected**: The cancelled trip still appears in the "Upcoming" tab (since the departure date is still in the future) with the "Cancelled" status badge. It is not duplicated across tabs.

## Page: Explore

### Components
- DestinationMap
- FlexibleDatesGrid
- DealsSection

_(Test entries to be added by PlanPage tasks)_
