# App Revisions

## 2026-03-16: Complete UI Overhaul to Clone Airbnb.com

### Color Theme (index.css)
- Updated primary color from #FF5A5F to #FF385C (Airbnb's actual brand pink)
- Updated primary-dark and primary-light to match
- Added footer CSS styles (app-footer, footer-inner, footer-grid, footer-bottom, footer-section)
- Added header-host-link and header-globe-btn styles
- Updated header-avatar background to #717171 (gray, matching Airbnb's default)
- Removed header-dropdown border, using shadow only

### CategoryFilter
- Replaced text-only chips with icon+label vertical layout matching Airbnb's category bar
- Added SVG icons for each property type (Apartment, House, Cabin, Villa, Condo, Loft, Cottage, Townhouse)
- Changed active state from filled background to underline border-bottom-2 style
- Added horizontal scroll arrows (ChevronLeft/ChevronRight) that appear when content overflows
- Added opacity transitions for inactive icons

### PropertyCard
- Added bedroom count alongside bed count ("2 beds · 1 bedroom")
- Changed price label from "/ night" to "night" (no slash, matching Airbnb)
- Removed property type badge overlay from cards

### Sidebar/Header
- Added "Airbnb your home" link for hosts in header-right section
- Added Globe icon button for language (decorative, matching Airbnb header)
- Improved dropdown styling with larger padding and transitions

### SearchBar
- Split "When" into separate "Check in" and "Check out" sections (matching Airbnb)
- Updated font weight to bold for section labels
- Refined padding and spacing for the pill shape
- Changed placeholder to "Search destinations"

### Login Page
- Redesigned as Airbnb-style modal card with header bar
- Added mini header with logo at top of page
- Added modal-style card with centered "Log in" / "Sign up" header
- Added "Welcome to Airbnb" heading
- Changed buttons to Airbnb gradient (from-[#E61E4D] to-[#BD1E59])
- Added "or" divider between form and auth toggle

### PropertyDetail Page
- Moved title and location above the image gallery (matching Airbnb layout)
- Updated max-width to 1120px (Airbnb's content width)
- Increased spacing between sections

### PropertyHeader
- Removed title/location (moved to page level above gallery)
- Simplified to show review summary and hosted-by section
- Increased host avatar size to 48px

### ImageGallery
- Increased gallery height to 420px
- Moved rounded corners to outer grid container instead of individual images

### ReviewsSection
- Increased heading size to 22px
- Changed "Show all reviews" from underline text to bordered button (Airbnb style)
- Increased spacing between review cards
- Updated review avatar to use dark background with white text for initials
- Increased avatar size to 48px

### HostInfoCard
- Redesigned as card with border and shadow (Airbnb's host card style)
- Added stats grid (reviews count, rating with star, years hosting)
- Centered avatar with "Host" label below name

### Pagination
- Refined sizing and added font-semibold
- Changed hover state to underline (matching Airbnb)

### Footer (new component)
- Added Airbnb-style footer with three-column grid
- Sections: Support, Hosting, Airbnb
- Bottom row with copyright and links
- Responsive: collapses to single column on mobile

### App.tsx
- Added Footer component to app layout

### All Pages
- Updated max-width containers to use 1120px (Airbnb content width)
- Increased heading sizes to 32px for page titles
- Standardized padding and spacing patterns

### MyTrips
- Changed title to "Trips" (Airbnb naming)
- Updated layout spacing

### HostDashboard
- Changed tab active state from primary color to text color with border-text (Airbnb style)
- Updated heading and spacing

### TripCard
- Increased image size to 180x140px
- Updated button styles to use bordered/dark buttons instead of colored ones

## 2026-03-15: UI Improvements to Match Airbnb Reference

### SearchBar
- Combined check-in/check-out into a single "When" section with date range display
- Kept all existing data-testids and input types for test compatibility

### PropertyCard
- Simplified property info to show just bed count (e.g., "2 beds") instead of full property type/bedrooms/beds breakdown
- Matches Airbnb's compact card style

### PropertyDetail Page
- Removed back button, moved title and Share/Save above the image gallery
- Matches Airbnb's property detail layout where title is prominent above photos

### ImageGallery
- Added rounded corners to left side of main image (rounded-l-xl) to match Airbnb's gallery style
- Individual image corners on grid maintained

### PropertyHeader
- Added separate "Hosted by" section with host avatar, name, and years hosting
- Moved host info below the property details with a border separator
- Shows "N years hosting" duration

### HostInfoCard
- Added "N years hosting" display alongside existing "Member since" date
- Kept "Member since" text for test compatibility

### BookingCard
- Increased webServer timeout in playwright config for more reliable test execution

### netlify.toml
- Added dev configuration with custom framework command and targetPort
