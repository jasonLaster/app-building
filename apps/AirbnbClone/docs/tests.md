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

## Page: Property Detail (`/properties/:id`)

<!-- Components: ImageGallery, PropertyHeader, PropertyInfo, PropertyDescription, AmenitiesList, BookingCard, ReviewsSection, HostInfoCard -->

## Page: My Trips (`/trips`)

<!-- Components: TripsTabs, TripCard, CancelBookingDialog -->

## Page: Host Dashboard (`/hosting`)

<!-- Components: StatsOverview, ListingsTab, BookingsTab, AddListingForm -->

## Page: User Profile (`/profile`)

<!-- Components: ProfileForm, BecomeHostButton, UserReviewsList -->

## Page: Write Review (`/trips/:bookingId/review`)

<!-- Components: ReviewForm, RatingSliders, PropertyBookingContext -->
