# App Revisions

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
