# AirbnbClone Test Specification

## Page: Login / Register (`/login`)

<!-- Components: LoginForm, RegisterForm, AuthToggle -->

### Component: AuthToggle

#### Test: Auth page defaults to login mode
- **Initial state:** User navigates to `/login` for the first time (not logged in).
- **Expected:** The page displays in login mode with the email input field visible, a "Log In" submit button, and a toggle link reading "Don't have an account? Register" at the bottom.

#### Test: Toggle from login to register mode
- **Initial state:** User is on `/login` in login mode.
- **Action:** User clicks the "Don't have an account? Register" link.
- **Expected:** The form switches to register mode showing name and email fields, a "Register" submit button, and the toggle link changes to "Already have an account? Log In".

#### Test: Toggle from register back to login mode
- **Initial state:** User is on `/login` in register mode.
- **Action:** User clicks the "Already have an account? Log In" link.
- **Expected:** The form switches back to login mode with only the email field and "Log In" button visible.

#### Test: Toggle preserves no stale input between modes
- **Initial state:** User is on `/login` in login mode.
- **Action:** User types "test@example.com" in the email field, then toggles to register mode.
- **Expected:** The register form fields are empty (no carried-over email value).

### Component: LoginForm

#### Test: Login with valid email redirects to home
- **Initial state:** User is on `/login` in login mode. A user with email "guest@example.com" exists in the database.
- **Action:** User types "guest@example.com" in the email input and clicks the "Log In" button.
- **Expected:** The app calls `POST /api/auth` with the email, stores the returned user object in Redux state, and redirects to the home page (`/`).

#### Test: Login with empty email shows validation error
- **Initial state:** User is on `/login` in login mode.
- **Action:** User clicks the "Log In" button without entering an email.
- **Expected:** A validation error message is displayed (e.g., "Email is required"). No API call is made.

#### Test: Login with invalid email format shows validation error
- **Initial state:** User is on `/login` in login mode.
- **Action:** User types "not-an-email" in the email field and clicks "Log In".
- **Expected:** A validation error message is displayed (e.g., "Please enter a valid email address"). No API call is made.

#### Test: Login with non-existent email shows error
- **Initial state:** User is on `/login` in login mode. No user with email "unknown@example.com" exists.
- **Action:** User types "unknown@example.com" and clicks "Log In".
- **Expected:** An error message is displayed (e.g., "No account found with this email"). The user remains on the login page.

#### Test: Login form email input is functional on repeated use
- **Initial state:** User is on `/login` in login mode.
- **Action:** User types "wrong@example.com", submits and gets an error, then clears the field, types "guest@example.com", and clicks "Log In" again.
- **Expected:** The second submission succeeds, the user is logged in and redirected to home.

### Component: RegisterForm

#### Test: Register with valid name and email creates account and redirects to home
- **Initial state:** User is on `/login` in register mode. No user with email "newuser@example.com" exists.
- **Action:** User types "New User" in the name field and "newuser@example.com" in the email field, then clicks "Register".
- **Expected:** The app calls `POST /api/auth` with name and email, stores the returned user object in Redux state, and redirects to the home page (`/`).

#### Test: Register with empty name shows validation error
- **Initial state:** User is on `/login` in register mode.
- **Action:** User types "newuser@example.com" in the email field but leaves the name field empty, then clicks "Register".
- **Expected:** A validation error is displayed (e.g., "Name is required"). No API call is made.

#### Test: Register with empty email shows validation error
- **Initial state:** User is on `/login` in register mode.
- **Action:** User types "New User" in the name field but leaves the email field empty, then clicks "Register".
- **Expected:** A validation error is displayed (e.g., "Email is required"). No API call is made.

#### Test: Register with invalid email format shows validation error
- **Initial state:** User is on `/login` in register mode.
- **Action:** User types "New User" in the name field and "bad-email" in the email field, then clicks "Register".
- **Expected:** A validation error is displayed (e.g., "Please enter a valid email address"). No API call is made.

#### Test: Register with already-existing email shows error
- **Initial state:** User is on `/login` in register mode. A user with email "existing@example.com" already exists.
- **Action:** User types "Some Name" in the name field and "existing@example.com" in the email field, then clicks "Register".
- **Expected:** An error message is displayed (e.g., "An account with this email already exists"). The user remains on the register form.

#### Test: Register form fields are functional on repeated use
- **Initial state:** User is on `/login` in register mode.
- **Action:** User fills in name and an already-existing email, submits and gets an error, then changes the email to a new unique email and clicks "Register" again.
- **Expected:** The second submission succeeds, the user is registered and redirected to home.

## Page: Home / Search (`/`)

<!-- Components: SearchBar, CategoryFilter, PropertyGrid, PropertyCard, FavoriteButton, FiltersPanel, Pagination -->

### Component: SearchBar

#### Test: Search bar displays all input fields on load
- **Initial state:** User navigates to the home page (`/`).
- **Expected:** The search bar is visible at the top of the page containing four inputs: a location text input with placeholder "Where are you going?", a check-in date picker, a check-out date picker, and a guest count selector. A search/submit button with a magnifying glass icon is visible.

#### Test: Search by location filters property results
- **Initial state:** User is on the home page. Properties exist in "Paris", "New York", and "Tokyo".
- **Action:** User types "Paris" into the location input and clicks the search button.
- **Expected:** The property grid updates to show only properties where the city matches "Paris". Properties in other cities are not displayed.

#### Test: Search by check-in and check-out dates filters results
- **Initial state:** User is on the home page. Some properties have bookings that overlap with the selected dates.
- **Action:** User selects a check-in date of "2026-04-01" and a check-out date of "2026-04-05" using the date pickers, then clicks the search button.
- **Expected:** The property grid updates to show only properties that are available (not fully booked) for the selected date range. The date pickers display the selected dates in a readable format.

#### Test: Search by guest count filters results
- **Initial state:** User is on the home page. Properties exist with max_guests values of 2, 4, and 8.
- **Action:** User sets the guest count to 5 and clicks the search button.
- **Expected:** The property grid updates to show only properties where max_guests >= 5. Properties with fewer guest capacity are hidden.

#### Test: Combined search with all fields filters results
- **Initial state:** User is on the home page. Multiple properties exist with varying locations, availability, and guest capacities.
- **Action:** User types "New York" in the location field, selects check-in "2026-05-10" and check-out "2026-05-15", sets guests to 3, and clicks the search button.
- **Expected:** The property grid shows only properties in New York that are available for those dates and accommodate at least 3 guests.

#### Test: Clearing search fields and re-searching shows all results
- **Initial state:** User has performed a search for "Paris" and the grid shows filtered results.
- **Action:** User clears the location field (making it empty) and clicks the search button.
- **Expected:** The property grid resets to show all properties (unfiltered by location).

#### Test: Search bar is functional on repeated use
- **Initial state:** User is on the home page.
- **Action:** User searches for "Paris", views results, then clears the location field, types "Tokyo", and searches again.
- **Expected:** The first search shows only Paris properties. After the second search, the grid updates to show only Tokyo properties. The location input correctly reflects "Tokyo".

#### Test: Check-in date picker prevents selecting past dates
- **Initial state:** User is on the home page.
- **Action:** User opens the check-in date picker.
- **Expected:** Dates before today are disabled/grayed out and cannot be selected.

#### Test: Check-out date must be after check-in date
- **Initial state:** User is on the home page and has selected a check-in date of "2026-04-10".
- **Action:** User opens the check-out date picker.
- **Expected:** Dates on or before "2026-04-10" are disabled/grayed out and cannot be selected. Only dates after the check-in date are selectable.

#### Test: Guest count selector enforces minimum of 1
- **Initial state:** User is on the home page.
- **Action:** User interacts with the guest count selector.
- **Expected:** The minimum selectable value is 1. The user cannot set the guest count to 0 or a negative number.

### Component: CategoryFilter

#### Test: Category filter bar displays all property type chips
- **Initial state:** User navigates to the home page (`/`).
- **Expected:** A horizontal scrollable bar of category chips is displayed below the search bar. Chips are shown for each property type: "Apartment", "House", "Cabin", "Villa", "Condo", "Loft", "Cottage", "Townhouse". No chip is selected by default (all properties are shown).

#### Test: Clicking a category chip filters properties by that type
- **Initial state:** User is on the home page. Properties of various types exist (apartments, houses, cabins, etc.).
- **Action:** User clicks the "Cabin" chip.
- **Expected:** The "Cabin" chip becomes visually selected/highlighted (e.g., bold outline or filled background). The property grid updates to show only properties with property_type "Cabin".

#### Test: Clicking the selected category chip deselects it and shows all properties
- **Initial state:** User is on the home page with the "Cabin" chip currently selected.
- **Action:** User clicks the "Cabin" chip again.
- **Expected:** The "Cabin" chip returns to its unselected appearance. The property grid shows all properties again (no category filter applied).

#### Test: Switching between category chips updates the filter
- **Initial state:** User is on the home page with the "Cabin" chip selected, showing only cabin properties.
- **Action:** User clicks the "Villa" chip.
- **Expected:** The "Cabin" chip becomes unselected and the "Villa" chip becomes selected/highlighted. The property grid updates to show only properties with property_type "Villa".

#### Test: Category filter works in combination with search bar
- **Initial state:** User is on the home page. Properties exist: a cabin in Paris, an apartment in Paris, and a cabin in Tokyo.
- **Action:** User types "Paris" in the search bar location field and clicks search, then clicks the "Cabin" chip.
- **Expected:** The property grid shows only cabin properties in Paris. Both the search and category filters are applied simultaneously.

#### Test: Category filter bar is horizontally scrollable when chips overflow
- **Initial state:** User is on the home page on a narrow viewport where all chips don't fit in one row.
- **Expected:** The category filter bar is horizontally scrollable. The user can scroll left/right to see all property type chips.

#### Test: Category chip is functional on repeated use
- **Initial state:** User is on the home page.
- **Action:** User clicks "Apartment" (filtered), then clicks "House" (switches filter), then clicks "House" again (deselects), then clicks "Cabin" (filtered again).
- **Expected:** Each click correctly updates the selected chip and the property grid filters. The final state shows only cabin properties with the "Cabin" chip highlighted.

### Component: PropertyGrid

#### Test: Property grid displays properties in a responsive grid layout
- **Initial state:** User navigates to the home page. Multiple properties exist in the database.
- **Expected:** Properties are displayed in a responsive grid: 1 column on mobile, 2 columns on tablet, 3-4 columns on desktop. Each property is rendered as a PropertyCard.

#### Test: Property grid shows message when no properties match filters
- **Initial state:** User is on the home page.
- **Action:** User searches for a location with no matching properties (e.g., "Atlantis").
- **Expected:** The property grid area displays a "No properties found" message instead of an empty grid. The message suggests adjusting filters or search criteria.

#### Test: Property grid loads and displays properties from API on initial page load
- **Initial state:** User navigates to the home page. Properties exist in the database.
- **Expected:** The grid fetches properties via `GET /api/properties` and displays property cards. While loading, a loading indicator is shown. Once loaded, the property cards appear with correct data.

### Component: PropertyCard

#### Test: Property card displays all required information
- **Initial state:** User is on the home page. A property exists with title "Cozy Cabin", city "Aspen", country "US", property_type "Cabin", price_per_night 150, an average rating of 4.5, and 12 reviews.
- **Expected:** The property card shows: the main property image at the top, a "Cabin" property type badge, the title "Cozy Cabin", location "Aspen, US", "$150 / night" price, and a star icon with "4.5 (12 reviews)" rating display.

#### Test: Property card shows property image
- **Initial state:** User is on the home page. A property exists with at least one image (the first image by display_order).
- **Expected:** The property card displays the main image (lowest display_order) at the top of the card with rounded top corners. If no image exists, a placeholder image is shown.

#### Test: Clicking a property card navigates to property detail page
- **Initial state:** User is on the home page. A property with id "abc-123" is displayed.
- **Action:** User clicks on the property card (not the favorite button).
- **Expected:** The app navigates to `/properties/abc-123` (the property detail page).

#### Test: Property card displays property type badge
- **Initial state:** User is on the home page. Properties of different types exist.
- **Expected:** Each property card shows a badge/label indicating the property type (e.g., "Apartment", "House", "Cabin"). The badge is visually distinct (e.g., small colored label overlaying or near the image).

#### Test: Property card displays average rating with review count
- **Initial state:** User is on the home page. A property has an average rating of 4.2 from 8 reviews.
- **Expected:** The card shows a star icon with "4.2" and "(8 reviews)" or "(8)" next to it. If the property has no reviews, the rating section shows "New" or is not displayed.

### Component: FavoriteButton

### Component: FavoriteButton

#### Test: Favorite button shows outline heart when property is not favorited
- **Initial state:** User is logged in and on the home page. The property is not in the user's favorites.
- **Expected:** The property card displays a heart icon with an outline (unfilled) style in the top-right corner of the card image.

#### Test: Clicking favorite button on unfavorited property adds it to favorites
- **Initial state:** User is logged in and on the home page. A property is not in their favorites.
- **Action:** User clicks the heart icon on the property card.
- **Expected:** The app calls `POST /api/favorites` with the property ID. The heart icon changes to a filled/solid red heart. The property is now in the user's favorites list.

#### Test: Clicking favorite button on favorited property removes it from favorites
- **Initial state:** User is logged in and on the home page. A property is already in their favorites (heart is filled/red).
- **Action:** User clicks the filled heart icon on the property card.
- **Expected:** The app calls `DELETE /api/favorites/:propertyId`. The heart icon changes back to an outline (unfilled) style. The property is removed from the user's favorites.

#### Test: Favorite button does not navigate to property detail page
- **Initial state:** User is logged in and on the home page.
- **Action:** User clicks the heart icon on a property card.
- **Expected:** The favorite is toggled but the user remains on the home page. The click does not propagate to the card's navigation handler.

#### Test: Favorite button is not shown when user is not logged in
- **Initial state:** User is not logged in and is on the home page.
- **Expected:** Property cards do not display the heart/favorite icon. Alternatively, clicking the heart redirects the user to the login page.

#### Test: Favorite button reflects correct state on page load
- **Initial state:** User is logged in and has previously favorited two properties. User navigates to the home page.
- **Expected:** The app calls `GET /api/favorites` to fetch the user's favorites. The two favorited properties show filled/red hearts. All other properties show outline hearts.

#### Test: Favorite button is functional on repeated use
- **Initial state:** User is logged in and on the home page with a property that is not favorited.
- **Action:** User clicks the heart icon (favorites it), then clicks it again (unfavorites it), then clicks it a third time (favorites it again).
- **Expected:** Each click correctly toggles the heart appearance and makes the appropriate API call. The final state is favorited (filled heart).

### Component: FiltersPanel

#### Test: Filters panel is hidden by default with a visible toggle button
- **Initial state:** User navigates to the home page (`/`).
- **Expected:** The filters panel is collapsed/hidden. A "Filters" button (with a filter icon) is visible that the user can click to open the panel.

#### Test: Clicking the Filters button opens the filters panel
- **Initial state:** User is on the home page with the filters panel hidden.
- **Action:** User clicks the "Filters" button.
- **Expected:** The filters panel opens/expands, revealing all filter controls: a price range slider, bedrooms minimum selector, beds minimum selector, bathrooms minimum selector, and amenity checkboxes grouped by category.

#### Test: Clicking the Filters button again closes the filters panel
- **Initial state:** User is on the home page with the filters panel open.
- **Action:** User clicks the "Filters" button again.
- **Expected:** The filters panel collapses/hides. The property grid remains showing the previously applied filters.

#### Test: Price range slider filters properties by price per night
- **Initial state:** User is on the home page with the filters panel open. Properties exist with prices $50, $100, $200, and $500 per night.
- **Action:** User adjusts the price range slider to a minimum of $75 and a maximum of $250.
- **Expected:** The property grid updates to show only properties with price_per_night between $75 and $250 (i.e., $100 and $200 properties). The slider visually reflects the selected range with labels showing the min and max values.

#### Test: Bedrooms minimum filter works correctly
- **Initial state:** User is on the home page with the filters panel open. Properties exist with 1, 2, 3, and 5 bedrooms.
- **Action:** User sets the bedrooms minimum selector to 3.
- **Expected:** The property grid updates to show only properties with 3 or more bedrooms.

#### Test: Beds minimum filter works correctly
- **Initial state:** User is on the home page with the filters panel open. Properties exist with varying bed counts.
- **Action:** User sets the beds minimum selector to 2.
- **Expected:** The property grid updates to show only properties with 2 or more beds.

#### Test: Bathrooms minimum filter works correctly
- **Initial state:** User is on the home page with the filters panel open. Properties exist with 1, 2, and 3 bathrooms.
- **Action:** User sets the bathrooms minimum selector to 2.
- **Expected:** The property grid updates to show only properties with 2 or more bathrooms.

#### Test: Amenity checkboxes filter properties by selected amenities
- **Initial state:** User is on the home page with the filters panel open. Amenities include "WiFi", "Pool", "Kitchen", "Parking". Properties have varying amenities.
- **Action:** User checks the "WiFi" and "Pool" amenity checkboxes.
- **Expected:** The property grid updates to show only properties that have both WiFi AND Pool amenities. The checked amenities remain visually checked.

#### Test: Amenity checkboxes are grouped by category
- **Initial state:** User is on the home page with the filters panel open.
- **Expected:** Amenity checkboxes are organized into groups labeled by category: "Essentials", "Features", "Safety", "Location". Each group contains the relevant amenities.

#### Test: Multiple filters combine with AND logic
- **Initial state:** User is on the home page with the filters panel open.
- **Action:** User sets price range to $100–$300, bedrooms minimum to 2, and checks the "WiFi" amenity.
- **Expected:** The property grid shows only properties that satisfy ALL three conditions: price between $100–$300, at least 2 bedrooms, and has WiFi amenity.

#### Test: Filters combine with search bar and category filter
- **Initial state:** User is on the home page. User has typed "Paris" in the search bar, selected "Apartment" category chip, and the filters panel is open.
- **Action:** User sets bedrooms minimum to 2 in the filters panel.
- **Expected:** The property grid shows only apartments in Paris with at least 2 bedrooms. All three filter mechanisms (search, category, filters panel) work together.

#### Test: Resetting filters shows all properties
- **Initial state:** User is on the home page with multiple filters applied (price range, bedrooms, amenities).
- **Action:** User resets or clears all filter values back to their defaults (e.g., via a "Clear Filters" or "Reset" button, or manually resetting each).
- **Expected:** The property grid returns to showing all properties (unfiltered). All filter controls return to their default states.

#### Test: Filters panel controls are functional on repeated use
- **Initial state:** User is on the home page with the filters panel open.
- **Action:** User sets bedrooms to 3 (filtered), then changes bedrooms back to 1, then sets bathrooms to 2, then unchecks and re-checks a "WiFi" amenity.
- **Expected:** Each change updates the property grid correctly. The final state reflects the last set of filter values (bedrooms >= 1, bathrooms >= 2, WiFi checked).

### Component: Pagination

#### Test: Pagination controls are displayed when results exceed one page
- **Initial state:** User is on the home page. More properties exist than can fit on one page (e.g., more than the page limit of 12 or 20 properties).
- **Expected:** Pagination controls are displayed below the property grid showing page numbers (e.g., "1 2 3 ... 5"), a "Previous" button (disabled on first page), and a "Next" button.

#### Test: Pagination controls are hidden when all results fit on one page
- **Initial state:** User is on the home page. Fewer properties exist than the page limit.
- **Expected:** No pagination controls are displayed below the property grid.

#### Test: Clicking Next page loads the next set of properties
- **Initial state:** User is on the home page viewing page 1 of results. Multiple pages of properties exist.
- **Action:** User clicks the "Next" button.
- **Expected:** The property grid updates to show the second page of properties. The URL or API call includes `page=2`. The current page indicator highlights "2". The "Previous" button becomes enabled.

#### Test: Clicking Previous page loads the previous set of properties
- **Initial state:** User is on page 2 of property results.
- **Action:** User clicks the "Previous" button.
- **Expected:** The property grid updates to show the first page of properties. The current page indicator highlights "1". The "Previous" button becomes disabled again.

#### Test: Clicking a specific page number navigates to that page
- **Initial state:** User is on page 1 of results. At least 3 pages of properties exist.
- **Action:** User clicks page number "3".
- **Expected:** The property grid updates to show the third page of properties. The current page indicator highlights "3".

#### Test: Next button is disabled on the last page
- **Initial state:** User is on the last page of property results.
- **Expected:** The "Next" button is disabled/grayed out and not clickable. The "Previous" button is enabled.

#### Test: Previous button is disabled on the first page
- **Initial state:** User is on page 1 of property results.
- **Expected:** The "Previous" button is disabled/grayed out and not clickable. The "Next" button is enabled (if more than one page exists).

#### Test: Applying filters resets pagination to page 1
- **Initial state:** User is on page 3 of property results.
- **Action:** User applies a category filter by clicking the "Cabin" chip.
- **Expected:** The pagination resets to page 1. The property grid shows the first page of filtered results. The page indicator highlights "1".

#### Test: Pagination is functional on repeated use
- **Initial state:** User is on page 1 of results with multiple pages available.
- **Action:** User clicks "Next" (goes to page 2), then clicks "Next" again (page 3), then clicks "Previous" (back to page 2), then clicks page "1" (back to page 1).
- **Expected:** Each navigation correctly updates the property grid and page indicator. The final state shows page 1 results.

## Page: Property Detail (`/properties/:id`)

<!-- Components: ImageGallery, PropertyHeader, PropertyInfo, PropertyDescription, AmenitiesList, BookingCard, ReviewsSection, HostInfoCard -->

### Component: ImageGallery

#### Test: Image gallery displays main large image and smaller thumbnails
- **Initial state:** User navigates to `/properties/:id` for a property with 5 images.
- **Expected:** The image gallery shows a grid layout with the first image (lowest display_order) displayed as a large main image, and the remaining images displayed as smaller thumbnails alongside or below it. All images have rounded corners.

#### Test: Image gallery displays single image when property has only one image
- **Initial state:** User navigates to a property detail page for a property with exactly 1 image.
- **Expected:** The single image is displayed as the main large image. No thumbnail grid is shown.

#### Test: Image gallery displays placeholder when property has no images
- **Initial state:** User navigates to a property detail page for a property with no images.
- **Expected:** A placeholder image or "No images available" message is displayed in the gallery area.

#### Test: Clicking a thumbnail image makes it the main displayed image
- **Initial state:** User is on a property detail page with 5 images. The first image is displayed as the main image.
- **Action:** User clicks on the third thumbnail image.
- **Expected:** The third image becomes the main large image. The previously main image moves to the thumbnail grid.

#### Test: Clicking thumbnails is functional on repeated use
- **Initial state:** User is on a property detail page with multiple images.
- **Action:** User clicks the second thumbnail, then the fourth thumbnail, then the first thumbnail.
- **Expected:** Each click updates the main image to the clicked thumbnail. The final state shows the first thumbnail as the main image.

#### Test: Image gallery shows image captions when available
- **Initial state:** User navigates to a property detail page. The property has images with caption text set.
- **Expected:** Captions are displayed below or overlaying their respective images.

### Component: PropertyHeader

#### Test: Property header displays title, location, rating summary, and host info
- **Initial state:** User navigates to `/properties/:id` for a property with title "Luxury Villa in Bali", city "Ubud", country "Indonesia", an average rating of 4.7 from 23 reviews, hosted by "Jane Host" with an avatar.
- **Expected:** The property header shows the title "Luxury Villa in Bali", location "Ubud, Indonesia", a star icon with "4.7" and "(23 reviews)", and the host name "Jane Host" with their avatar image.

#### Test: Property header shows "New" when property has no reviews
- **Initial state:** User navigates to a property detail page for a property with no reviews.
- **Expected:** The rating summary area shows "New" or no rating display instead of a numeric rating and review count.

#### Test: Clicking review count scrolls to or navigates to reviews section
- **Initial state:** User is on a property detail page with reviews.
- **Action:** User clicks the "(23 reviews)" link in the property header.
- **Expected:** The page scrolls down to the ReviewsSection on the same page.

#### Test: Property header displays host avatar as clickable element
- **Initial state:** User is on a property detail page. The host has an avatar_url set.
- **Expected:** The host's avatar image is displayed as a small circular image next to the host name. The host name is displayed next to the avatar.

### Component: PropertyInfo

#### Test: Property info section displays all property details
- **Initial state:** User navigates to `/properties/:id` for a property with property_type "Villa", max_guests 6, bedrooms 3, beds 4, bathrooms 2.
- **Expected:** The property info section displays: "Villa" as the property type, "6 guests", "3 bedrooms", "4 beds", and "2 bathrooms". Each detail has an appropriate icon.

#### Test: Property info section displays check-in and check-out times
- **Initial state:** User navigates to a property detail page for a property with check_in_time "15:00" and check_out_time "11:00".
- **Expected:** The property info section shows check-in time as "3:00 PM" (or "15:00") and check-out time as "11:00 AM" (or "11:00").

#### Test: Property info section handles singular and plural labels correctly
- **Initial state:** User navigates to a property detail page for a property with max_guests 1, bedrooms 1, beds 1, bathrooms 1.
- **Expected:** Labels display in singular form: "1 guest", "1 bedroom", "1 bed", "1 bathroom" (not "1 guests", etc.).

### Component: PropertyDescription

#### Test: Property description displays full description text
- **Initial state:** User navigates to `/properties/:id` for a property with a multi-paragraph description.
- **Expected:** The full property description text is displayed in a readable format with proper paragraph breaks.

#### Test: Long description shows a "Show more" toggle
- **Initial state:** User navigates to a property detail page for a property with a very long description (multiple paragraphs).
- **Expected:** The description is initially truncated after a reasonable length with a "Show more" link/button visible at the bottom.

#### Test: Clicking "Show more" expands the full description
- **Initial state:** User is on a property detail page with a truncated description and a visible "Show more" link.
- **Action:** User clicks the "Show more" link.
- **Expected:** The full description expands to show all text. The link changes to "Show less".

#### Test: Clicking "Show less" collapses the description back
- **Initial state:** User is on a property detail page with the description fully expanded and a "Show less" link visible.
- **Action:** User clicks the "Show less" link.
- **Expected:** The description collapses back to the truncated view with "Show more" visible again.

#### Test: Show more/less toggle is functional on repeated use
- **Initial state:** User is on a property detail page with a long description.
- **Action:** User clicks "Show more", then "Show less", then "Show more" again.
- **Expected:** Each click correctly toggles between the truncated and expanded states. The final state shows the full description.

### Component: AmenitiesList

#### Test: Amenities list displays amenities grouped by category with icons
- **Initial state:** User navigates to `/properties/:id` for a property with amenities including "WiFi" (Essentials), "Pool" (Features), "Smoke Detector" (Safety), "Near Beach" (Location).
- **Expected:** The amenities are displayed in groups with category headings: "Essentials", "Features", "Safety", "Location". Each amenity is shown with its icon and name.

#### Test: Amenities list only shows categories that have amenities
- **Initial state:** User navigates to a property detail page. The property has amenities only in "Essentials" and "Features" categories (none in "Safety" or "Location").
- **Expected:** Only the "Essentials" and "Features" category groups are displayed. Empty categories are not shown.

#### Test: Amenities list shows "Show all amenities" when there are many amenities
- **Initial state:** User navigates to a property detail page for a property with more than 10 amenities.
- **Expected:** An initial subset of amenities is displayed with a "Show all X amenities" button at the bottom (where X is the total count).

#### Test: Clicking "Show all amenities" reveals the complete list
- **Initial state:** User is on a property detail page with many amenities and a "Show all X amenities" button visible.
- **Action:** User clicks "Show all X amenities".
- **Expected:** All amenities are displayed, grouped by category. The button changes to "Show less" or disappears.

#### Test: Amenities list displays message when property has no amenities
- **Initial state:** User navigates to a property detail page for a property with no amenities.
- **Expected:** A message like "No amenities listed" is displayed, or the amenities section is not shown.

### Component: BookingCard

#### Test: Booking card displays price per night
- **Initial state:** User navigates to `/properties/:id` for a property with price_per_night $150.
- **Expected:** The booking card (sticky sidebar on desktop) shows "$150 / night" prominently at the top.

#### Test: Booking card displays check-in and check-out date pickers
- **Initial state:** User is on a property detail page.
- **Expected:** The booking card contains a check-in date picker and a check-out date picker. Both are initially empty or show placeholder text.

#### Test: Booking card displays guest count selector
- **Initial state:** User is on a property detail page for a property with max_guests 6.
- **Expected:** The booking card contains a guest count selector. The selector enforces a minimum of 1 and a maximum of 6 (the property's max_guests value).

#### Test: Selecting dates and guests shows price breakdown
- **Initial state:** User is on a property detail page for a property with price_per_night $150 and cleaning_fee $75.
- **Action:** User selects check-in "2026-05-01" and check-out "2026-05-04" (3 nights) and sets guests to 2.
- **Expected:** The booking card displays a price breakdown: "$150 x 3 nights = $450", "Cleaning fee: $75", "Total: $525". The breakdown appears after both dates are selected.

#### Test: Price breakdown updates when dates change
- **Initial state:** User is on a property detail page with check-in "2026-05-01" and check-out "2026-05-04" selected (3 nights).
- **Action:** User changes the check-out date to "2026-05-06" (5 nights).
- **Expected:** The price breakdown updates to reflect 5 nights: "$150 x 5 nights = $750", "Cleaning fee: $75", "Total: $825".

#### Test: Reserve button creates a booking when logged in
- **Initial state:** User is logged in, on a property detail page for another user's property. Check-in "2026-05-01", check-out "2026-05-04", and 2 guests are selected.
- **Action:** User clicks the "Reserve" button.
- **Expected:** The app calls `POST /api/bookings` with the property_id, check_in, check_out, num_guests, and total_price. A success message is displayed (e.g., "Booking confirmed!") and the user is redirected to the My Trips page (`/trips`), or a confirmation is shown on the same page.

#### Test: Reserve button is disabled when dates are not selected
- **Initial state:** User is logged in and on a property detail page. No dates have been selected.
- **Expected:** The "Reserve" button is disabled/grayed out and not clickable. A hint message like "Select dates to book" may be displayed.

#### Test: Reserve button prompts login when user is not logged in
- **Initial state:** User is not logged in and is on a property detail page with valid dates and guests selected.
- **Action:** User clicks the "Reserve" button.
- **Expected:** The user is redirected to the login page (`/login`). Alternatively, a message like "Please log in to book" is displayed.

#### Test: Reserve button is disabled for host's own property
- **Initial state:** User is logged in as the host of the current property. Dates and guests are selected.
- **Expected:** The "Reserve" button is disabled or hidden. A message like "You cannot book your own property" is displayed.

#### Test: Check-in date picker prevents selecting past dates
- **Initial state:** User is on a property detail page.
- **Action:** User opens the check-in date picker.
- **Expected:** Dates before today are disabled/grayed out and cannot be selected.

#### Test: Check-out date must be after check-in date
- **Initial state:** User is on a property detail page and has selected check-in "2026-05-01".
- **Action:** User opens the check-out date picker.
- **Expected:** Dates on or before "2026-05-01" are disabled/grayed out. Only dates after the check-in date are selectable.

#### Test: Guest count cannot exceed property max_guests
- **Initial state:** User is on a property detail page for a property with max_guests 4.
- **Action:** User tries to set the guest count higher than 4.
- **Expected:** The guest count selector prevents selecting more than 4 guests. The maximum is capped at 4.

#### Test: Guest count minimum is 1
- **Initial state:** User is on a property detail page.
- **Action:** User interacts with the guest count selector.
- **Expected:** The minimum selectable value is 1. The user cannot set guests to 0 or a negative number.

#### Test: Reserve button shows error for unavailable dates
- **Initial state:** User is logged in and on a property detail page. The property has an existing confirmed booking for "2026-05-01" to "2026-05-04".
- **Action:** User selects overlapping dates (e.g., check-in "2026-05-02", check-out "2026-05-06") and clicks "Reserve".
- **Expected:** An error message is displayed (e.g., "Property is not available for the selected dates"). The booking is not created.

#### Test: Booking card is sticky on desktop viewport
- **Initial state:** User is on a property detail page on a desktop viewport.
- **Action:** User scrolls down the page past the booking card's initial position.
- **Expected:** The booking card remains visible in a sticky sidebar position as the user scrolls through the property description, amenities, and reviews.

#### Test: Booking card date pickers and guest selector are functional on repeated use
- **Initial state:** User is on a property detail page.
- **Action:** User selects check-in "2026-05-01" and check-out "2026-05-04", then changes check-in to "2026-06-01" and check-out to "2026-06-05", then changes guest count from 2 to 4 and back to 2.
- **Expected:** Each change correctly updates the price breakdown. The final state shows "2026-06-01" to "2026-06-05" with 2 guests.

### Component: ReviewsSection

#### Test: Reviews section displays average ratings by category
- **Initial state:** User navigates to `/properties/:id` for a property with multiple reviews. The average ratings are: cleanliness 4.5, accuracy 4.2, communication 4.8, location 4.6, value 4.0.
- **Expected:** The reviews section shows a summary with average ratings for each category: "Cleanliness: 4.5", "Accuracy: 4.2", "Communication: 4.8", "Location: 4.6", "Value: 4.0". Each rating is displayed with a star icon or progress bar. An overall average rating is also displayed.

#### Test: Reviews section displays overall average rating and total review count
- **Initial state:** User navigates to a property detail page with 15 reviews and an overall average rating of 4.3.
- **Expected:** The reviews section header shows a star icon with "4.3" and "15 reviews" (or similar format like "4.3 · 15 reviews").

#### Test: Reviews section displays individual review cards
- **Initial state:** User navigates to a property detail page with reviews. A review exists from guest "Alice" dated "2026-01-15" with rating 5 and comment "Amazing place, loved every minute!".
- **Expected:** An individual review card is displayed showing the guest name "Alice", the date "January 2026" (or similar formatted date), a star rating of 5, and the comment text "Amazing place, loved every minute!".

#### Test: Review cards display guest avatar or initial
- **Initial state:** User navigates to a property detail page with reviews. A reviewer has an avatar_url set, another reviewer does not.
- **Expected:** Review cards show the guest's avatar image when available. When no avatar is set, a placeholder (e.g., first initial in a circle) is displayed.

#### Test: Reviews section shows message when property has no reviews
- **Initial state:** User navigates to a property detail page for a property with no reviews.
- **Expected:** The reviews section displays a message like "No reviews yet" instead of an empty review list. Category average ratings are not shown.

#### Test: Reviews section handles pagination or "Show more" for many reviews
- **Initial state:** User navigates to a property detail page with more than 6 reviews.
- **Expected:** An initial subset of reviews is displayed (e.g., 6 reviews). A "Show all X reviews" button is visible at the bottom (where X is the total count).

#### Test: Clicking "Show all reviews" reveals all review cards
- **Initial state:** User is on a property detail page with more than 6 reviews and a "Show all X reviews" button visible.
- **Action:** User clicks "Show all X reviews".
- **Expected:** All review cards are displayed. The button disappears or changes to "Show less".

#### Test: Reviews are ordered by most recent first
- **Initial state:** User navigates to a property detail page with multiple reviews created on different dates.
- **Expected:** Review cards are displayed in reverse chronological order, with the most recently created review appearing first.

### Component: HostInfoCard

#### Test: Host info card displays host name, avatar, bio, and member since date
- **Initial state:** User navigates to `/properties/:id`. The property host has name "Jane Host", an avatar_url, bio "Superhostess who loves sharing her properties", and created_at "2023-06-15".
- **Expected:** The host info card displays: the host's avatar image, name "Jane Host", bio text "Superhostess who loves sharing her properties", and "Member since June 2023" (formatted from created_at).

#### Test: Host info card displays number of listings
- **Initial state:** User navigates to a property detail page. The host has 5 active property listings.
- **Expected:** The host info card shows "5 listings" (or similar format like "5 properties").

#### Test: Host info card shows placeholder avatar when host has no avatar
- **Initial state:** User navigates to a property detail page. The host has avatar_url set to null.
- **Expected:** A placeholder avatar (e.g., first initial in a circle or a generic person icon) is displayed instead of a broken image.

#### Test: Host info card displays correctly when host has no bio
- **Initial state:** User navigates to a property detail page. The host has bio set to null.
- **Expected:** The host info card displays the host name, avatar, and member since date. The bio area is either not shown or displays a default message. No empty or broken layout.

## Page: My Trips (`/trips`)

<!-- Components: TripsTabs, TripCard, CancelBookingDialog -->

### Component: TripsTabs

#### Test: My Trips page requires login
- **Initial state:** User is not logged in.
- **Action:** User navigates to `/trips`.
- **Expected:** The user is redirected to the login page (`/login`). The My Trips page content is not displayed.

#### Test: My Trips page defaults to Upcoming tab
- **Initial state:** User is logged in and navigates to `/trips`.
- **Expected:** The page displays three tabs: "Upcoming", "Past", and "Cancelled". The "Upcoming" tab is selected/highlighted by default. The content area shows upcoming trips (bookings with status "pending" or "confirmed" and check_in date >= today).

#### Test: Upcoming tab shows pending and confirmed future bookings
- **Initial state:** User is logged in with bookings: a confirmed booking checking in next week, a pending booking checking in next month, a completed booking from last month, and a cancelled booking.
- **Action:** User is on the "Upcoming" tab.
- **Expected:** Only the confirmed and pending future bookings are displayed. Completed and cancelled bookings are not shown in this tab.

#### Test: Switching to Past tab shows completed bookings
- **Initial state:** User is logged in and on the My Trips page with the "Upcoming" tab selected. The user has completed bookings.
- **Action:** User clicks the "Past" tab.
- **Expected:** The "Past" tab becomes selected/highlighted. The content area updates to show only bookings with status "completed". Upcoming and cancelled bookings are not shown.

#### Test: Switching to Cancelled tab shows cancelled bookings
- **Initial state:** User is logged in and on the My Trips page with the "Upcoming" tab selected. The user has cancelled bookings.
- **Action:** User clicks the "Cancelled" tab.
- **Expected:** The "Cancelled" tab becomes selected/highlighted. The content area updates to show only bookings with status "cancelled". Upcoming and completed bookings are not shown.

#### Test: Switching back to Upcoming tab from another tab
- **Initial state:** User is on the My Trips page with the "Past" tab selected.
- **Action:** User clicks the "Upcoming" tab.
- **Expected:** The "Upcoming" tab becomes selected/highlighted. The content area updates to show upcoming bookings again.

#### Test: Tab shows empty state when no bookings exist for that category
- **Initial state:** User is logged in with no completed bookings.
- **Action:** User clicks the "Past" tab.
- **Expected:** The "Past" tab content area displays a message like "No past trips" or "You don't have any past trips yet." instead of an empty list.

#### Test: Upcoming tab empty state message
- **Initial state:** User is logged in with no pending or confirmed future bookings.
- **Action:** User views the "Upcoming" tab (default).
- **Expected:** The tab content area displays a message like "No upcoming trips" with a suggestion to browse properties (e.g., a link to the home page).

#### Test: Cancelled tab empty state message
- **Initial state:** User is logged in with no cancelled bookings.
- **Action:** User clicks the "Cancelled" tab.
- **Expected:** The tab content area displays a message like "No cancelled trips."

#### Test: Tabs are functional on repeated use
- **Initial state:** User is logged in and on the My Trips page.
- **Action:** User clicks "Past", then "Cancelled", then "Upcoming", then "Past" again.
- **Expected:** Each click correctly updates the selected tab highlight and displays the correct set of bookings. The final state shows the "Past" tab selected with completed bookings displayed.

### Component: TripCard

#### Test: Trip card displays all required information
- **Initial state:** User is logged in and on the My Trips page. A booking exists for property "Beach House" in "Malibu" with check_in "2026-05-01", check_out "2026-05-05", status "confirmed", and total_price $800. The property has an image.
- **Expected:** The trip card displays: the property's main image, property title "Beach House", city "Malibu", dates "May 1 – May 5, 2026" (or similar formatted date range), a status badge showing "Confirmed" in green, and the total price "$800".

#### Test: Trip card displays correct status badge colors
- **Initial state:** User is logged in and on the My Trips page. Bookings exist with different statuses.
- **Expected:** Status badges use the correct colors: "Pending" badge in yellow, "Confirmed" badge in green, "Cancelled" badge in red, "Completed" badge in blue.

#### Test: Trip card shows property image or placeholder
- **Initial state:** User is logged in and on the My Trips page. One booking has a property with images, another has a property with no images.
- **Expected:** The trip card for the property with images shows the main property image. The trip card for the property without images shows a placeholder image.

#### Test: Clicking trip card navigates to booking details
- **Initial state:** User is logged in and on the My Trips page. A trip card is displayed for a booking with id "booking-123".
- **Action:** User clicks on the trip card (not the cancel or review button).
- **Expected:** The app navigates to a booking detail view showing full booking information including property details, dates, guest count, price breakdown, and special requests.

#### Test: Cancel button appears on pending bookings
- **Initial state:** User is logged in and on the "Upcoming" tab. A booking with status "pending" is displayed.
- **Expected:** The trip card shows a "Cancel" button (or cancel icon button) that is clickable.

#### Test: Cancel button appears on confirmed bookings
- **Initial state:** User is logged in and on the "Upcoming" tab. A booking with status "confirmed" is displayed.
- **Expected:** The trip card shows a "Cancel" button that is clickable.

#### Test: Cancel button does not appear on completed bookings
- **Initial state:** User is logged in and on the "Past" tab. A booking with status "completed" is displayed.
- **Expected:** The trip card does not show a "Cancel" button.

#### Test: Cancel button does not appear on already cancelled bookings
- **Initial state:** User is logged in and on the "Cancelled" tab. A booking with status "cancelled" is displayed.
- **Expected:** The trip card does not show a "Cancel" button.

#### Test: Write Review button appears on completed bookings without a review
- **Initial state:** User is logged in and on the "Past" tab. A booking with status "completed" exists that does not have an associated review.
- **Expected:** The trip card shows a "Write Review" button that is clickable.

#### Test: Write Review button does not appear on completed bookings that already have a review
- **Initial state:** User is logged in and on the "Past" tab. A completed booking exists that already has an associated review.
- **Expected:** The trip card does not show a "Write Review" button. Instead, it may show "Reviewed" text or a checkmark indicating a review was already submitted.

#### Test: Clicking Write Review button navigates to review page
- **Initial state:** User is logged in and on the "Past" tab. A completed booking with id "booking-456" has no review.
- **Action:** User clicks the "Write Review" button on that trip card.
- **Expected:** The app navigates to `/trips/booking-456/review` (the Write Review page).

#### Test: Write Review button does not appear on pending, confirmed, or cancelled bookings
- **Initial state:** User is logged in. Bookings exist with statuses "pending", "confirmed", and "cancelled".
- **Expected:** None of these trip cards display a "Write Review" button. The button only appears for "completed" bookings.

#### Test: Trip cards are ordered by check-in date
- **Initial state:** User is logged in and on the "Upcoming" tab. Multiple upcoming bookings exist with different check-in dates.
- **Expected:** Trip cards are displayed in chronological order by check-in date, with the soonest upcoming trip first.

### Component: CancelBookingDialog

#### Test: Clicking Cancel button opens confirmation dialog
- **Initial state:** User is logged in and on the "Upcoming" tab. A booking with status "confirmed" is displayed with a "Cancel" button.
- **Action:** User clicks the "Cancel" button on the trip card.
- **Expected:** A confirmation dialog/modal appears asking the user to confirm the cancellation. The dialog displays text like "Are you sure you want to cancel this booking?" with the property name and dates for context. Two buttons are visible: "Confirm Cancel" (or "Yes, Cancel") and "Keep Booking" (or "No, Go Back").

#### Test: Confirming cancellation updates booking status to cancelled
- **Initial state:** The cancellation confirmation dialog is open for a confirmed booking.
- **Action:** User clicks the "Confirm Cancel" (or "Yes, Cancel") button.
- **Expected:** The app calls `PUT /api/bookings/:id` with status "cancelled". The dialog closes. The trip card is removed from the "Upcoming" tab (or its status badge updates to "Cancelled" in red). A success message is displayed (e.g., "Booking cancelled successfully"). The booking now appears in the "Cancelled" tab.

#### Test: Dismissing cancellation dialog keeps booking unchanged
- **Initial state:** The cancellation confirmation dialog is open for a pending booking.
- **Action:** User clicks the "Keep Booking" (or "No, Go Back") button.
- **Expected:** The dialog closes. The booking remains in its original status (pending). No API call is made. The trip card is unchanged.

#### Test: Closing the dialog via overlay click keeps booking unchanged
- **Initial state:** The cancellation confirmation dialog is open.
- **Action:** User clicks outside the dialog (on the overlay/backdrop).
- **Expected:** The dialog closes without making any changes to the booking.

#### Test: Cancel dialog shows property and date context
- **Initial state:** User clicks "Cancel" on a trip card for property "Mountain Cabin" with dates "June 10 – June 15, 2026".
- **Expected:** The confirmation dialog displays the property name "Mountain Cabin" and the booking dates "June 10 – June 15, 2026" so the user can confirm they are cancelling the correct booking.

#### Test: After cancellation, booking moves from Upcoming to Cancelled tab
- **Initial state:** User is on the "Upcoming" tab with a confirmed booking for "Beach House".
- **Action:** User clicks "Cancel" on the "Beach House" trip card, then confirms the cancellation in the dialog.
- **Expected:** The "Beach House" trip card is removed from the "Upcoming" tab. User switches to the "Cancelled" tab and sees the "Beach House" booking with a red "Cancelled" status badge.

#### Test: Cancel dialog is functional on repeated use
- **Initial state:** User is on the "Upcoming" tab with two cancellable bookings.
- **Action:** User clicks "Cancel" on the first booking, dismisses the dialog (clicks "Keep Booking"), then clicks "Cancel" on the second booking and confirms the cancellation.
- **Expected:** The first booking remains unchanged in the "Upcoming" tab. The second booking is cancelled and moves to the "Cancelled" tab. Each dialog open/close cycle works correctly.

## Page: Host Dashboard (`/hosting`)

<!-- Components: StatsOverview, ListingsTab, BookingsTab, AddListingForm -->

### Component: StatsOverview

#### Test: Host Dashboard requires login — redirects unauthenticated users
- **Initial state:** No user is logged in.
- **Action:** User navigates to `/hosting`.
- **Expected:** The app redirects the user to `/login`. The Host Dashboard is not rendered.

#### Test: Host Dashboard requires host status — shows upgrade prompt for non-hosts
- **Initial state:** A user is logged in with `is_host` set to false.
- **Action:** User navigates to `/hosting`.
- **Expected:** The page displays a message indicating the user is not a host (e.g., "You need to become a host to access this page") with a link or button to navigate to their profile page (`/profile`) where they can become a host.

#### Test: Stats overview displays total listings count
- **Initial state:** User is logged in as a host with 5 active properties and 1 inactive property in the database.
- **Action:** User navigates to `/hosting`.
- **Expected:** The StatsOverview section displays a "Total Listings" stat card showing "5" (only active listings counted). The card has a label "Total Listings" and a numeric value.

#### Test: Stats overview displays active bookings count
- **Initial state:** User is logged in as a host. Their properties have 3 bookings with status "confirmed", 2 with status "pending", and 4 with status "completed".
- **Action:** User navigates to `/hosting`.
- **Expected:** The StatsOverview section displays an "Active Bookings" stat card showing "5" (pending + confirmed bookings). The card has a label "Active Bookings" and a numeric value.

#### Test: Stats overview displays total earnings
- **Initial state:** User is logged in as a host. Their properties have completed bookings with total_price values of $500, $750, and $1200.
- **Action:** User navigates to `/hosting`.
- **Expected:** The StatsOverview section displays a "Total Earnings" stat card showing "$2,450" (sum of completed booking total prices). The value is formatted as currency.

#### Test: Stats overview displays average rating
- **Initial state:** User is logged in as a host. Their properties have reviews with overall ratings of 4, 5, 3, and 5.
- **Action:** User navigates to `/hosting`.
- **Expected:** The StatsOverview section displays an "Average Rating" stat card showing "4.3" (average of all review ratings, rounded to one decimal). A star icon is displayed next to the value.

#### Test: Stats overview shows zeros for a new host with no data
- **Initial state:** User is logged in as a host with no properties, no bookings, and no reviews.
- **Action:** User navigates to `/hosting`.
- **Expected:** All four stat cards display zero/empty values: "Total Listings: 0", "Active Bookings: 0", "Total Earnings: $0", and "Average Rating: —" (or "N/A" when no reviews exist).

#### Test: Host Dashboard displays navigation tabs for Listings and Bookings
- **Initial state:** User is logged in as a host.
- **Action:** User navigates to `/hosting`.
- **Expected:** Below the stats overview, two tabs are visible: "Listings" and "Bookings". The "Listings" tab is active/selected by default.

#### Test: Switching between Listings and Bookings tabs
- **Initial state:** User is logged in as a host and on `/hosting` with the "Listings" tab active.
- **Action:** User clicks the "Bookings" tab.
- **Expected:** The Bookings tab content is displayed (table of bookings). The "Bookings" tab appears active/selected. User clicks "Listings" tab again and the listings grid is displayed.

### Component: ListingsTab

#### Test: Listings tab displays host's properties in a grid
- **Initial state:** User is logged in as a host with 3 active properties: "Beach House" ($150/night), "Mountain Cabin" ($200/night), "City Loft" ($120/night).
- **Action:** User navigates to `/hosting` (Listings tab is active by default).
- **Expected:** A grid of 3 property cards is displayed. Each card shows the property title, main image, price per night, and status (active/inactive).

#### Test: Listing card shows property details
- **Initial state:** User is logged in as a host with a property: title "Beach House", price $150/night, city "Malibu", 4.5 average rating, 10 reviews, active status.
- **Expected:** The listing card displays the property title "Beach House", price "$150/night", location "Malibu", average rating "4.5" with star icon, review count "10 reviews", and a green "Active" badge.

#### Test: Listing card has Edit button that navigates to property detail
- **Initial state:** User is logged in as a host with a property (id "prop-123").
- **Action:** User clicks the "Edit" button on the property card.
- **Expected:** The app navigates to `/properties/prop-123` where the host can view and edit their property details.

#### Test: Listing card has Deactivate button for active properties
- **Initial state:** User is logged in as a host with an active property "Beach House".
- **Action:** User clicks the "Deactivate" button on the "Beach House" card.
- **Expected:** A confirmation dialog appears asking "Are you sure you want to deactivate this listing?". The dialog shows the property name "Beach House".

#### Test: Confirming deactivation sets property to inactive
- **Initial state:** The deactivation confirmation dialog is open for "Beach House".
- **Action:** User clicks the confirm button (e.g., "Yes, Deactivate").
- **Expected:** The app calls `DELETE /api/properties/:id` (which sets `is_active` to false). The dialog closes. The property card updates to show an "Inactive" status badge (gray or muted). A success message is displayed (e.g., "Listing deactivated"). The stats overview updates the "Total Listings" count to reflect the change.

#### Test: Dismissing deactivation dialog keeps property active
- **Initial state:** The deactivation confirmation dialog is open for "Beach House".
- **Action:** User clicks the dismiss/cancel button.
- **Expected:** The dialog closes. The property remains active with no changes.

#### Test: Listing card shows Activate button for inactive properties
- **Initial state:** User is logged in as a host with an inactive property "Old Cabin".
- **Action:** User clicks the "Activate" button on the "Old Cabin" card.
- **Expected:** The app calls `PUT /api/properties/:id` to set `is_active` to true. The property card updates to show a green "Active" badge. The "Total Listings" stat updates.

#### Test: Listings tab shows empty state for host with no properties
- **Initial state:** User is logged in as a host with no properties.
- **Expected:** The Listings tab displays an empty state message (e.g., "You don't have any listings yet") and a prominent "Add Listing" button or call-to-action.

#### Test: Add Listing button is visible on the Listings tab
- **Initial state:** User is logged in as a host.
- **Expected:** An "Add Listing" button is prominently displayed on the Listings tab (e.g., in the header area or as a floating action button). The button has clear text "Add Listing" or a "+" icon with label.

#### Test: Deactivate and activate actions work on repeated use
- **Initial state:** User is logged in as a host with two active properties.
- **Action:** User deactivates the first property (confirms dialog), then activates it again, then deactivates the second property.
- **Expected:** Each action updates the correct property's status. The stats overview correctly reflects the current count of active listings after each action.

### Component: BookingsTab

#### Test: Bookings tab displays table of bookings for host's properties
- **Initial state:** User is logged in as a host. Their properties have bookings from various guests.
- **Action:** User clicks the "Bookings" tab.
- **Expected:** A table is displayed with columns: Property, Guest, Check-in, Check-out, Guests, Total, Status, and Actions. Each booking is a row in the table.

#### Test: Bookings table shows correct data for each booking
- **Initial state:** User is logged in as a host. A booking exists: property "Beach House", guest "Alice Smith", check-in "2026-07-01", check-out "2026-07-05", 2 guests, total $750, status "confirmed".
- **Expected:** The table row displays: "Beach House", "Alice Smith", "Jul 1, 2026", "Jul 5, 2026", "2", "$750", a green "Confirmed" status badge.

#### Test: Bookings tab has status filter controls
- **Initial state:** User is logged in as a host on the Bookings tab.
- **Expected:** Filter controls are visible above the table allowing the host to filter by status: "All", "Pending", "Confirmed", "Cancelled", "Completed". "All" is selected by default.

#### Test: Filtering bookings by Pending status
- **Initial state:** User is logged in as a host on the Bookings tab. Bookings exist with statuses "pending", "confirmed", and "completed".
- **Action:** User clicks the "Pending" status filter.
- **Expected:** Only bookings with status "pending" are displayed in the table. The "Pending" filter appears active/selected.

#### Test: Filtering bookings by Confirmed status
- **Initial state:** User is logged in as a host on the Bookings tab with various bookings.
- **Action:** User clicks the "Confirmed" status filter.
- **Expected:** Only bookings with status "confirmed" are shown. Other bookings are hidden.

#### Test: Filtering bookings by Completed status
- **Initial state:** User is logged in as a host on the Bookings tab with various bookings.
- **Action:** User clicks the "Completed" status filter.
- **Expected:** Only bookings with status "completed" are shown.

#### Test: Filtering bookings by Cancelled status
- **Initial state:** User is logged in as a host on the Bookings tab with various bookings.
- **Action:** User clicks the "Cancelled" status filter.
- **Expected:** Only bookings with status "cancelled" are shown.

#### Test: Resetting filter to All shows all bookings
- **Initial state:** User is on the Bookings tab with the "Pending" filter active.
- **Action:** User clicks the "All" filter.
- **Expected:** All bookings across all statuses are displayed again.

#### Test: Status filters work on repeated use
- **Initial state:** User is on the Bookings tab with various bookings.
- **Action:** User clicks "Pending", then "Confirmed", then "All", then "Completed".
- **Expected:** Each filter correctly shows the appropriate subset of bookings. The active filter indicator updates correctly each time.

#### Test: Host can confirm a pending booking
- **Initial state:** User is logged in as a host on the Bookings tab. A booking with status "pending" for guest "Bob" at property "Beach House" is displayed.
- **Action:** User clicks the "Confirm" button on that booking row.
- **Expected:** The app calls `PUT /api/bookings/:id` with status "confirmed". The booking's status badge changes from yellow "Pending" to green "Confirmed". The "Confirm" button is no longer visible for that booking. A success message is displayed (e.g., "Booking confirmed"). The "Active Bookings" stat in StatsOverview remains accurate.

#### Test: Host can cancel a pending booking
- **Initial state:** User is logged in as a host on the Bookings tab. A pending booking is displayed.
- **Action:** User clicks the "Cancel" button on the pending booking row.
- **Expected:** A confirmation dialog appears asking the host to confirm cancellation. The dialog shows the guest name, property, and dates for context.

#### Test: Confirming cancellation of a booking updates status
- **Initial state:** The cancellation confirmation dialog is open for a pending booking.
- **Action:** User clicks the confirm button in the dialog.
- **Expected:** The app calls `PUT /api/bookings/:id` with status "cancelled". The dialog closes. The booking's status badge changes to red "Cancelled". The "Cancel" and "Confirm" action buttons are removed for that booking. A success message is displayed. The "Active Bookings" stat decreases by 1.

#### Test: Dismissing booking cancellation dialog keeps booking unchanged
- **Initial state:** The cancellation confirmation dialog is open for a booking.
- **Action:** User clicks the dismiss button or clicks outside the dialog.
- **Expected:** The dialog closes. The booking status remains unchanged.

#### Test: Host can cancel a confirmed booking
- **Initial state:** User is logged in as a host on the Bookings tab. A booking with status "confirmed" is displayed.
- **Action:** User clicks the "Cancel" button on the confirmed booking row and confirms in the dialog.
- **Expected:** The app calls `PUT /api/bookings/:id` with status "cancelled". The status badge changes to red "Cancelled". The "Active Bookings" stat decreases.

#### Test: Completed and cancelled bookings have no action buttons
- **Initial state:** User is logged in as a host on the Bookings tab. Bookings exist with statuses "completed" and "cancelled".
- **Expected:** Booking rows with "completed" or "cancelled" status do not display "Confirm" or "Cancel" action buttons. Only pending and confirmed bookings show action buttons.

#### Test: Bookings tab shows empty state when no bookings exist
- **Initial state:** User is logged in as a host with properties but no bookings.
- **Action:** User clicks the "Bookings" tab.
- **Expected:** The tab displays an empty state message (e.g., "No bookings yet").

#### Test: Status badges display correct colors
- **Initial state:** User is on the Bookings tab with bookings in all four statuses.
- **Expected:** Status badges use the correct colors: "Pending" has a yellow badge, "Confirmed" has a green badge, "Cancelled" has a red badge, "Completed" has a blue badge.

#### Test: Confirm and cancel actions work on repeated use
- **Initial state:** User is on the Bookings tab with three pending bookings.
- **Action:** User confirms the first booking, cancels the second booking (confirming the dialog), and then confirms the third booking.
- **Expected:** Each action updates the correct booking. The first and third show "Confirmed" badges, the second shows "Cancelled". Stats update correctly after each action.

### Component: AddListingForm

#### Test: Clicking Add Listing button opens the multi-step form
- **Initial state:** User is logged in as a host on the Listings tab.
- **Action:** User clicks the "Add Listing" button.
- **Expected:** A multi-step form opens (modal or full-page). Step 1 is displayed with fields for property type and title. A step indicator shows progress (Step 1 of 7). "Next" and "Cancel" buttons are visible.

#### Test: Step 1 — Property type selection and title input
- **Initial state:** The Add Listing form is open on Step 1.
- **Expected:** A dropdown or selection control lists property types: "Apartment", "House", "Cabin", "Villa", "Condo", "Loft", "Cottage", "Townhouse". A text input field for the property title is visible. Both fields are required.

#### Test: Step 1 — Selecting property type and entering title
- **Initial state:** The Add Listing form is on Step 1.
- **Action:** User selects "Cabin" from the property type selector and types "Cozy Mountain Retreat" in the title field.
- **Expected:** The property type shows "Cabin" selected. The title field displays "Cozy Mountain Retreat". The "Next" button becomes enabled (or was already enabled).

#### Test: Step 1 — Validation prevents proceeding without required fields
- **Initial state:** The Add Listing form is on Step 1 with no selections made.
- **Action:** User clicks "Next" without selecting a property type or entering a title.
- **Expected:** Validation errors are displayed for both fields (e.g., "Property type is required", "Title is required"). The form does not advance to Step 2.

#### Test: Step 2 — Location fields displayed
- **Initial state:** User completed Step 1 and clicked "Next".
- **Expected:** Step 2 is displayed with fields for: address (with geocoding/autocomplete), city, state, and country. A "Back" button and "Next" button are visible. The step indicator shows Step 2 of 7.

#### Test: Step 2 — Address field uses autocomplete
- **Initial state:** The Add Listing form is on Step 2.
- **Action:** User types "123 Main" in the address field.
- **Expected:** An autocomplete dropdown appears with address suggestions from a geocoding API (e.g., OpenStreetMap Nominatim). Selecting a suggestion populates the address field with the full address.

#### Test: Step 2 — Address autocomplete populates related fields
- **Initial state:** The Add Listing form is on Step 2.
- **Action:** User types in the address field and selects an autocomplete suggestion for "123 Main St, Denver, CO, USA".
- **Expected:** The address field is populated with "123 Main St". The city field is auto-filled with "Denver". The state field is auto-filled with "CO". The country field is auto-filled with "USA".

#### Test: Step 2 — Validation requires city and country
- **Initial state:** The Add Listing form is on Step 2 with address filled but city and country empty.
- **Action:** User clicks "Next".
- **Expected:** Validation errors appear for city and country (e.g., "City is required", "Country is required"). The form does not advance.

#### Test: Step 3 — Details fields displayed
- **Initial state:** User completed Step 2 and clicked "Next".
- **Expected:** Step 3 is displayed with numeric input fields for: max guests, bedrooms, beds, and bathrooms. Each field has increment/decrement controls or is a number input. The step indicator shows Step 3 of 7.

#### Test: Step 3 — Setting property details
- **Initial state:** The Add Listing form is on Step 3.
- **Action:** User sets max guests to 4, bedrooms to 2, beds to 3, bathrooms to 1.
- **Expected:** All fields display the entered values. The "Next" button is enabled.

#### Test: Step 3 — Validation requires all detail fields
- **Initial state:** The Add Listing form is on Step 3 with all fields at 0 or empty.
- **Action:** User clicks "Next".
- **Expected:** Validation errors appear (e.g., "Max guests must be at least 1"). The form does not advance.

#### Test: Step 4 — Amenities selection displayed
- **Initial state:** User completed Step 3 and clicked "Next".
- **Expected:** Step 4 is displayed with checkboxes for amenities grouped by category: "Essentials", "Features", "Safety", "Location". Each category heading is visible with its amenities listed below. The step indicator shows Step 4 of 7.

#### Test: Step 4 — Selecting amenities
- **Initial state:** The Add Listing form is on Step 4 with amenities loaded from `GET /api/amenities`.
- **Action:** User checks "WiFi" and "Kitchen" under Essentials, and "Pool" under Features.
- **Expected:** The selected amenities show as checked. The user can proceed to the next step. Amenities are optional (no validation error if none selected).

#### Test: Step 4 — Amenities are toggleable
- **Initial state:** The Add Listing form is on Step 4 with "WiFi" already checked.
- **Action:** User clicks "WiFi" to uncheck it, then checks it again.
- **Expected:** The checkbox toggles correctly on each click.

#### Test: Step 5 — Photo URL input displayed
- **Initial state:** User completed Step 4 and clicked "Next".
- **Expected:** Step 5 is displayed with an input field for image URLs and an "Add Photo" button. A list/grid of added photos is shown below (initially empty). The step indicator shows Step 5 of 7.

#### Test: Step 5 — Adding a photo URL
- **Initial state:** The Add Listing form is on Step 5.
- **Action:** User types "https://example.com/photo1.jpg" in the URL input and clicks "Add Photo".
- **Expected:** The photo URL is added to the list. A preview or thumbnail of the image is displayed. The URL input is cleared for the next entry. An optional caption field may be shown for the added photo.

#### Test: Step 5 — Adding multiple photo URLs
- **Initial state:** The Add Listing form is on Step 5 with one photo already added.
- **Action:** User adds two more photo URLs.
- **Expected:** All three photos are displayed in the list/grid. Each photo can be reordered or removed.

#### Test: Step 5 — Removing a photo
- **Initial state:** The Add Listing form is on Step 5 with 3 photos added.
- **Action:** User clicks the remove/delete button on the second photo.
- **Expected:** The second photo is removed from the list. The remaining 2 photos are displayed.

#### Test: Step 5 — Validation requires at least one photo
- **Initial state:** The Add Listing form is on Step 5 with no photos added.
- **Action:** User clicks "Next".
- **Expected:** A validation error appears (e.g., "At least one photo is required"). The form does not advance.

#### Test: Step 6 — Pricing fields displayed
- **Initial state:** User completed Step 5 and clicked "Next".
- **Expected:** Step 6 is displayed with numeric input fields for: price per night and cleaning fee. The price per night field is required. The cleaning fee defaults to 0. Currency formatting or prefix ($) is shown. The step indicator shows Step 6 of 7.

#### Test: Step 6 — Entering pricing information
- **Initial state:** The Add Listing form is on Step 6.
- **Action:** User enters 150 for price per night and 50 for cleaning fee.
- **Expected:** The fields display $150 and $50 respectively.

#### Test: Step 6 — Validation requires price per night
- **Initial state:** The Add Listing form is on Step 6 with price per night empty or 0.
- **Action:** User clicks "Next".
- **Expected:** A validation error appears (e.g., "Price per night is required and must be greater than 0"). The form does not advance.

#### Test: Step 7 — Review and publish page displayed
- **Initial state:** User completed Step 6 and clicked "Next".
- **Expected:** Step 7 displays a summary of all entered information: property type, title, full address (address, city, state, country), details (guests, bedrooms, beds, bathrooms), selected amenities, photo thumbnails, price per night, and cleaning fee. A "Publish" button and "Back" button are visible. The step indicator shows Step 7 of 7.

#### Test: Step 7 — Review page shows all entered data correctly
- **Initial state:** User has filled out all steps: type "Cabin", title "Cozy Mountain Retreat", address "123 Pine Rd, Aspen, CO, USA", 4 guests, 2 bedrooms, 2 beds, 1 bathroom, amenities "WiFi" and "Kitchen", 2 photos, price $200/night, cleaning fee $75.
- **Expected:** The review page displays all of these values accurately. No data is missing or incorrect.

#### Test: Publishing a new listing creates the property
- **Initial state:** User is on Step 7 (Review) with all data entered correctly.
- **Action:** User clicks the "Publish" button.
- **Expected:** The app calls `POST /api/properties` with the property data, then `POST /api/property-images` for each photo. A success message is displayed (e.g., "Listing published successfully!"). The form closes. The new property appears in the Listings tab grid. The "Total Listings" stat increments by 1.

#### Test: Back button navigates to the previous step
- **Initial state:** User is on Step 3 of the Add Listing form.
- **Action:** User clicks the "Back" button.
- **Expected:** The form navigates to Step 2. All previously entered data in Step 2 is preserved (city, address, etc. are still filled).

#### Test: Cancel button closes the form without saving
- **Initial state:** User is on Step 4 of the Add Listing form with data entered in Steps 1–3.
- **Action:** User clicks the "Cancel" button.
- **Expected:** A confirmation dialog appears asking "Discard your listing? All entered information will be lost." with "Discard" and "Keep Editing" buttons.

#### Test: Confirming cancel discards the listing form
- **Initial state:** The discard confirmation dialog is open.
- **Action:** User clicks "Discard".
- **Expected:** The form closes. No API calls are made. The user returns to the Listings tab. No new property is created.

#### Test: Dismissing cancel keeps the form open
- **Initial state:** The discard confirmation dialog is open.
- **Action:** User clicks "Keep Editing".
- **Expected:** The dialog closes. The form remains on the current step with all data preserved.

#### Test: Step indicator shows correct progress throughout the form
- **Initial state:** User opens the Add Listing form.
- **Action:** User navigates through all 7 steps using Next/Back buttons.
- **Expected:** The step indicator accurately shows the current step (e.g., "Step 1 of 7", "Step 2 of 7", etc.) at each stage. Completed steps may show a checkmark or different styling.

#### Test: Data persistence across steps when navigating back and forth
- **Initial state:** User has filled out Steps 1–5 and is on Step 5.
- **Action:** User clicks "Back" twice to Step 3, then "Next" twice to Step 5.
- **Expected:** All data entered in Steps 3, 4, and 5 is preserved after navigating back and forth. No data is lost.

#### Test: Add Listing form works correctly on repeated use
- **Initial state:** User is logged in as a host. User has already published one listing successfully.
- **Action:** User clicks "Add Listing" again, fills out all steps, and publishes.
- **Expected:** A second property is created successfully. Both properties appear in the Listings tab. The "Total Listings" stat shows the correct total.

## Page: User Profile (`/profile`)

<!-- Components: ProfileForm, BecomeHostButton, UserReviewsList -->

### Component: ProfileForm

#### Test: Profile page requires login
- **Initial state:** User is not logged in.
- **Action:** User navigates to `/profile`.
- **Expected:** The user is redirected to `/login`. The profile page is not displayed.

#### Test: Profile page displays current user info
- **Initial state:** User is logged in with name "Alice Smith", email "alice@example.com", bio "Love traveling!", phone "555-1234", avatar URL "https://example.com/avatar.jpg".
- **Action:** User navigates to `/profile`.
- **Expected:** The profile form displays the current values: name "Alice Smith", email "alice@example.com" (read-only), bio "Love traveling!", phone "555-1234", and avatar URL "https://example.com/avatar.jpg". The avatar image is displayed using the URL.

#### Test: Edit name field inline
- **Initial state:** User is logged in and on `/profile` with name "Alice Smith".
- **Action:** User clicks the name field, clears it, types "Alice Johnson", and clicks the "Save" button.
- **Expected:** A `PUT /api/users/:id` request is sent with the updated name. The name field displays "Alice Johnson". A success message (e.g., "Profile updated") is shown. The Redux user state is updated with the new name.

#### Test: Edit bio field inline
- **Initial state:** User is logged in and on `/profile` with bio "Love traveling!".
- **Action:** User clicks the bio textarea, clears it, types "Digital nomad and foodie", and clicks "Save".
- **Expected:** A `PUT /api/users/:id` request is sent with the updated bio. The bio field displays "Digital nomad and foodie". A success message is shown.

#### Test: Edit phone field inline
- **Initial state:** User is logged in and on `/profile` with phone "555-1234".
- **Action:** User clicks the phone field, clears it, types "555-9876", and clicks "Save".
- **Expected:** A `PUT /api/users/:id` request is sent with the updated phone. The phone field displays "555-9876". A success message is shown.

#### Test: Edit avatar URL field inline
- **Initial state:** User is logged in and on `/profile` with avatar URL "https://example.com/old-avatar.jpg".
- **Action:** User clicks the avatar URL field, clears it, types "https://example.com/new-avatar.jpg", and clicks "Save".
- **Expected:** A `PUT /api/users/:id` request is sent with the updated avatar URL. The avatar image preview updates to show the new image from "https://example.com/new-avatar.jpg". A success message is shown.

#### Test: Save with empty name shows validation error
- **Initial state:** User is logged in and on `/profile`.
- **Action:** User clears the name field (leaving it empty) and clicks "Save".
- **Expected:** A validation error message is displayed (e.g., "Name is required"). No API call is made. The name field is highlighted as invalid.

#### Test: Save with invalid avatar URL shows validation error
- **Initial state:** User is logged in and on `/profile`.
- **Action:** User enters "not-a-url" in the avatar URL field and clicks "Save".
- **Expected:** A validation error message is displayed (e.g., "Please enter a valid URL"). No API call is made.

#### Test: Profile form fields are functional on repeated edits
- **Initial state:** User is logged in and on `/profile` with name "Alice Smith".
- **Action:** User changes the name to "Alice Johnson" and clicks "Save". After the success message, user changes the name again to "Alice Williams" and clicks "Save".
- **Expected:** Both saves succeed with separate `PUT /api/users/:id` requests. After the second save, the name field displays "Alice Williams". Both updates are persisted.

#### Test: Email field is displayed but not editable
- **Initial state:** User is logged in and on `/profile` with email "alice@example.com".
- **Action:** User views the profile form.
- **Expected:** The email "alice@example.com" is displayed but the field is read-only / disabled and cannot be edited.

#### Test: Profile update persists across navigation
- **Initial state:** User is logged in and on `/profile` with bio "Old bio".
- **Action:** User changes bio to "New bio", clicks "Save", then navigates to `/` (home page), then navigates back to `/profile`.
- **Expected:** The bio field displays "New bio", confirming the change was persisted to the database and Redux state.

### Component: BecomeHostButton

#### Test: Become a Host button is visible for non-host users
- **Initial state:** User is logged in with `is_host` set to `false`.
- **Action:** User navigates to `/profile`.
- **Expected:** A "Become a Host" button is visible on the profile page.

#### Test: Become a Host button is hidden for existing hosts
- **Initial state:** User is logged in with `is_host` set to `true`.
- **Action:** User navigates to `/profile`.
- **Expected:** The "Become a Host" button is NOT visible on the profile page.

#### Test: Clicking Become a Host sets user as host
- **Initial state:** User is logged in with `is_host` set to `false` and on `/profile`.
- **Action:** User clicks the "Become a Host" button.
- **Expected:** A confirmation dialog appears (e.g., "Are you sure you want to become a host?"). User confirms. A `POST /api/users/:id/become-host` request is sent. Upon success, the button disappears, a success message is shown (e.g., "You are now a host!"), and the Redux user state updates `is_host` to `true`. The "Hosting" link becomes available in the navigation sidebar.

#### Test: Cancel Become a Host confirmation dialog
- **Initial state:** User is logged in with `is_host` set to `false` and on `/profile`. The "Become a Host" button is visible.
- **Action:** User clicks the "Become a Host" button, then clicks "Cancel" in the confirmation dialog.
- **Expected:** The dialog closes. No API call is made. The "Become a Host" button remains visible. `is_host` remains `false`.

#### Test: Become a Host button appearance
- **Initial state:** User is logged in with `is_host` set to `false` and on `/profile`.
- **Action:** User views the profile page.
- **Expected:** The "Become a Host" button is styled with the coral/red accent color (#FF5A5F), has clear text reading "Become a Host", and is visually prominent on the page.

### Component: UserReviewsList

#### Test: Reviews list displays user's written reviews
- **Initial state:** User is logged in and has written 3 reviews for different properties (e.g., "Cozy Cabin" rated 5, "City Apartment" rated 3, "Beach Villa" rated 4).
- **Action:** User navigates to `/profile`.
- **Expected:** A "My Reviews" section is visible showing all 3 reviews. Each review card displays: the property title, the overall rating (with filled/unfilled stars), the comment text, and the date the review was written.

#### Test: Reviews list shows empty state for user with no reviews
- **Initial state:** User is logged in but has not written any reviews.
- **Action:** User navigates to `/profile`.
- **Expected:** The "My Reviews" section displays an empty state message (e.g., "You haven't written any reviews yet") instead of review cards.

#### Test: Review card shows rating with star display
- **Initial state:** User is logged in and has written a review with overall rating 4 out of 5.
- **Action:** User navigates to `/profile`.
- **Expected:** The review card displays 4 filled stars and 1 unfilled star, matching the rating value.

#### Test: Review card links to the reviewed property
- **Initial state:** User is logged in and has written a review for property "Cozy Cabin" (property ID "abc-123").
- **Action:** User clicks on the property title "Cozy Cabin" in a review card.
- **Expected:** The user is navigated to `/properties/abc-123` (the property detail page for "Cozy Cabin").

#### Test: Reviews list shows review details correctly
- **Initial state:** User is logged in and has written a review with rating 5, comment "Amazing stay! The host was very welcoming.", for property "Beach Villa", dated "2026-01-15".
- **Action:** User navigates to `/profile`.
- **Expected:** The review card displays: property title "Beach Villa", 5 filled stars, comment text "Amazing stay! The host was very welcoming.", and date "Jan 15, 2026".

#### Test: Reviews list updates after writing a new review
- **Initial state:** User is logged in, on `/profile`, and has 2 existing reviews displayed.
- **Action:** User navigates to a completed booking, writes a new review, submits it, then navigates back to `/profile`.
- **Expected:** The "My Reviews" section now displays 3 reviews, including the newly written review with the correct property title, rating, and comment.

#### Test: Reviews list shows multiple reviews in chronological order
- **Initial state:** User is logged in and has written reviews on different dates: "Beach Villa" on 2026-01-15, "City Apartment" on 2026-02-10, "Cozy Cabin" on 2026-03-05.
- **Action:** User navigates to `/profile`.
- **Expected:** The reviews are displayed in reverse chronological order (newest first): "Cozy Cabin" (Mar 5, 2026), "City Apartment" (Feb 10, 2026), "Beach Villa" (Jan 15, 2026).

## Page: Write Review (`/trips/:bookingId/review`)

<!-- Components: ReviewForm, RatingSliders, PropertyBookingContext -->

### Component: PropertyBookingContext

#### Test: Property info displays for the booking being reviewed
- **Initial state:** User "guest@example.com" is logged in and has a completed booking (booking-789) for "Oceanfront Villa" in Malibu, CA with check-in 2026-01-10 and check-out 2026-01-15.
- **Action:** User navigates to `/trips/booking-789/review`.
- **Expected:** The page displays the property context section showing the property title "Oceanfront Villa", the location "Malibu, CA", the property's main image, check-in date "Jan 10, 2026", check-out date "Jan 15, 2026", and the number of nights (5 nights).

#### Test: Property booking context shows guest count
- **Initial state:** User is logged in with a completed booking (booking-789) for 3 guests at "Oceanfront Villa".
- **Action:** User navigates to `/trips/booking-789/review`.
- **Expected:** The property booking context section displays "3 guests" alongside the booking dates.

#### Test: Property booking context shows total price paid
- **Initial state:** User is logged in with a completed booking (booking-789) with a total_price of $1,250.
- **Action:** User navigates to `/trips/booking-789/review`.
- **Expected:** The property booking context displays the total price "$1,250" that was paid for the booking.

#### Test: Redirect to login if not authenticated
- **Initial state:** No user is logged in.
- **Action:** User navigates to `/trips/booking-789/review`.
- **Expected:** The app redirects the user to `/login`. The Write Review page is not displayed.

#### Test: Error state when booking does not exist
- **Initial state:** User "guest@example.com" is logged in.
- **Action:** User navigates to `/trips/nonexistent-booking-id/review`.
- **Expected:** The page displays an error message such as "Booking not found" and does not show the review form.

#### Test: Error state when booking belongs to another user
- **Initial state:** User "other@example.com" is logged in. Booking booking-789 belongs to "guest@example.com".
- **Action:** User navigates to `/trips/booking-789/review`.
- **Expected:** The page displays an error message such as "You cannot review this booking" and does not show the review form.

#### Test: Error state when booking is not completed
- **Initial state:** User "guest@example.com" is logged in with a booking (booking-pending) that has status "pending".
- **Action:** User navigates to `/trips/booking-pending/review`.
- **Expected:** The page displays an error message such as "You can only review completed bookings" and does not show the review form.

#### Test: Error state when review already exists for booking
- **Initial state:** User "guest@example.com" is logged in with a completed booking (booking-reviewed) that already has a review submitted.
- **Action:** User navigates to `/trips/booking-reviewed/review`.
- **Expected:** The page displays a message such as "You have already reviewed this booking" and does not show the review form. Optionally shows a link back to My Trips.

### Component: RatingSliders

#### Test: All six rating sliders display with default values
- **Initial state:** User is logged in and navigates to `/trips/booking-789/review` for a completed booking.
- **Expected:** Six rating sliders are visible with labels: "Overall", "Cleanliness", "Accuracy", "Communication", "Location", and "Value". Each slider defaults to a mid-range value (e.g., 3 out of 5) or is unset, and shows the current numeric value.

#### Test: Adjust overall rating slider
- **Initial state:** User is on the Write Review page with all sliders at default.
- **Action:** User drags the "Overall" slider to 5.
- **Expected:** The "Overall" slider displays value 5. The numeric display next to the slider updates to "5". Other sliders remain at their previous values.

#### Test: Adjust cleanliness rating slider
- **Initial state:** User is on the Write Review page with all sliders at default.
- **Action:** User drags the "Cleanliness" slider to 4.
- **Expected:** The "Cleanliness" slider displays value 4. The numeric display updates to "4".

#### Test: Adjust accuracy rating slider
- **Initial state:** User is on the Write Review page with all sliders at default.
- **Action:** User drags the "Accuracy" slider to 2.
- **Expected:** The "Accuracy" slider displays value 2. The numeric display updates to "2".

#### Test: Adjust communication rating slider
- **Initial state:** User is on the Write Review page with all sliders at default.
- **Action:** User drags the "Communication" slider to 5.
- **Expected:** The "Communication" slider displays value 5. The numeric display updates to "5".

#### Test: Adjust location rating slider
- **Initial state:** User is on the Write Review page with all sliders at default.
- **Action:** User drags the "Location" slider to 3.
- **Expected:** The "Location" slider displays value 3. The numeric display updates to "3".

#### Test: Adjust value rating slider
- **Initial state:** User is on the Write Review page with all sliders at default.
- **Action:** User drags the "Value" slider to 1.
- **Expected:** The "Value" slider displays value 1. The numeric display updates to "1".

#### Test: Rating sliders enforce 1-5 range
- **Initial state:** User is on the Write Review page.
- **Action:** User interacts with any rating slider.
- **Expected:** The slider only allows integer values from 1 to 5 inclusive. The slider cannot go below 1 or above 5.

#### Test: Multiple sliders can be set independently
- **Initial state:** User is on the Write Review page with all sliders at default.
- **Action:** User sets "Overall" to 5, "Cleanliness" to 4, "Accuracy" to 3, "Communication" to 5, "Location" to 4, "Value" to 2.
- **Expected:** Each slider displays its independently set value. No slider affects another slider's value.

#### Test: Rating slider visual feedback shows filled stars or highlighted segments
- **Initial state:** User is on the Write Review page.
- **Action:** User sets the "Overall" slider to 4.
- **Expected:** The slider visually indicates the selected rating (e.g., filled stars up to 4 out of 5, or a highlighted slider track up to the 4 position). The visual feedback clearly distinguishes selected vs unselected portions.

### Component: ReviewForm

#### Test: Review form displays comment text area
- **Initial state:** User is logged in and navigates to `/trips/booking-789/review` for a completed booking.
- **Expected:** A text area is visible with a placeholder such as "Write your review..." or "Tell others about your experience" for entering the review comment.

#### Test: Submit button is visible
- **Initial state:** User is on the Write Review page.
- **Expected:** A "Submit Review" button is visible at the bottom of the form.

#### Test: Type a comment in the text area
- **Initial state:** User is on the Write Review page with an empty comment text area.
- **Action:** User types "Amazing stay! The villa was beautiful and the host was very responsive." in the comment text area.
- **Expected:** The text area displays the typed text "Amazing stay! The villa was beautiful and the host was very responsive."

#### Test: Submit review with all ratings and comment
- **Initial state:** User is on the Write Review page. User has set Overall to 5, Cleanliness to 5, Accuracy to 4, Communication to 5, Location to 4, Value to 4, and typed "Wonderful experience, would definitely come back!" in the comment area.
- **Action:** User clicks the "Submit Review" button.
- **Expected:** The review is submitted successfully via `POST /api/reviews`. The app navigates back to `/trips` (My Trips page). A success notification or message such as "Review submitted successfully" appears.

#### Test: Submitted review appears on property detail page
- **Initial state:** User just submitted a review for booking-789 (property "Oceanfront Villa") with Overall rating 5 and comment "Wonderful experience, would definitely come back!".
- **Action:** User navigates to the property detail page for "Oceanfront Villa" (`/properties/:id`).
- **Expected:** The reviews section shows the newly submitted review with the guest's name, the rating of 5, and the comment "Wonderful experience, would definitely come back!". The property's average rating and review count are updated.

#### Test: Submitted review appears in user profile reviews list
- **Initial state:** User just submitted a review for "Oceanfront Villa".
- **Action:** User navigates to `/profile`.
- **Expected:** The user's reviews list includes the newly submitted review for "Oceanfront Villa" with the correct rating and comment.

#### Test: Submit review with ratings but no comment
- **Initial state:** User is on the Write Review page. User has set all six rating sliders (Overall: 3, Cleanliness: 3, Accuracy: 3, Communication: 3, Location: 3, Value: 3) but left the comment text area empty.
- **Action:** User clicks the "Submit Review" button.
- **Expected:** The review is submitted successfully (comment is optional per the data model). The app navigates back to `/trips`.

#### Test: Submit button is disabled when ratings are not set
- **Initial state:** User navigates to the Write Review page. No rating sliders have been adjusted from their unset/default state.
- **Expected:** The "Submit Review" button is disabled or grayed out, preventing submission without ratings.

#### Test: Form validation prevents submission without all ratings
- **Initial state:** User is on the Write Review page. User has set Overall to 5 but left other rating sliders unset.
- **Action:** User clicks the "Submit Review" button.
- **Expected:** The form shows a validation error indicating all ratings are required (e.g., "Please rate all categories"). The review is not submitted.

#### Test: Write Review button on My Trips disappears after submitting review
- **Initial state:** User has a completed booking for "Oceanfront Villa" showing a "Write Review" button on the My Trips page.
- **Action:** User clicks "Write Review", fills out all ratings (all set to 4) and a comment "Great stay!", and clicks "Submit Review". User is redirected to `/trips`.
- **Expected:** The trip card for "Oceanfront Villa" no longer shows the "Write Review" button. It may show "Reviewed" text or a checkmark instead.

#### Test: Navigate back from review page without submitting
- **Initial state:** User is on the Write Review page and has set some ratings and typed partial comment text.
- **Action:** User clicks the browser back button or a "Cancel" / back navigation link on the page.
- **Expected:** The user is taken back to `/trips`. No review is submitted. The "Write Review" button still appears on the trip card.

#### Test: Comment text area allows multi-line input
- **Initial state:** User is on the Write Review page.
- **Action:** User types a multi-line comment: "First line.\nSecond line.\nThird line." using Enter/Return key to create line breaks.
- **Expected:** The text area displays the comment with line breaks preserved across all three lines.

#### Test: Re-visiting review page after submission shows already-reviewed state
- **Initial state:** User "guest@example.com" has already submitted a review for booking-789.
- **Action:** User navigates to `/trips/booking-789/review` directly via URL.
- **Expected:** The page displays a message such as "You have already reviewed this booking" instead of the review form. A link to return to My Trips is available.
