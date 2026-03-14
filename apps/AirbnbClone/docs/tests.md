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

## Page: Host Dashboard (`/hosting`)

<!-- Components: StatsOverview, ListingsTab, BookingsTab, AddListingForm -->

## Page: User Profile (`/profile`)

<!-- Components: ProfileForm, BecomeHostButton, UserReviewsList -->

## Page: Write Review (`/trips/:bookingId/review`)

<!-- Components: ReviewForm, RatingSliders, PropertyBookingContext -->
