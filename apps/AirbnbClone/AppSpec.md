# AirbnbClone - Vacation Rental Marketplace

## Overview

A vacation rental marketplace where hosts can list properties and guests can browse, search, and book stays. The app features property listings with photos, search and filtering, a booking system, user profiles, reviews, and a host dashboard.

## Data Model

### Users
- `id` (UUID, PK)
- `email` (text, unique, not null)
- `name` (text, not null)
- `avatar_url` (text, nullable)
- `bio` (text, nullable)
- `phone` (text, nullable)
- `is_host` (boolean, default false)
- `created_at` (timestamp, default now)

### Properties
- `id` (UUID, PK)
- `host_id` (UUID, FK → users.id, not null)
- `title` (text, not null)
- `description` (text, not null)
- `property_type` (text, not null) — "Apartment", "House", "Cabin", "Villa", "Condo", "Loft", "Cottage", "Townhouse"
- `price_per_night` (numeric, not null)
- `cleaning_fee` (numeric, default 0)
- `max_guests` (integer, not null)
- `bedrooms` (integer, not null)
- `beds` (integer, not null)
- `bathrooms` (integer, not null)
- `address` (text, not null)
- `city` (text, not null)
- `state` (text, nullable)
- `country` (text, not null)
- `latitude` (numeric, nullable)
- `longitude` (numeric, nullable)
- `check_in_time` (text, default '15:00')
- `check_out_time` (text, default '11:00')
- `is_active` (boolean, default true)
- `created_at` (timestamp, default now)
- `updated_at` (timestamp, default now)

### Property Images
- `id` (UUID, PK)
- `property_id` (UUID, FK → properties.id, not null)
- `url` (text, not null)
- `caption` (text, nullable)
- `display_order` (integer, default 0)

### Amenities
- `id` (UUID, PK)
- `name` (text, unique, not null)
- `icon` (text, nullable)
- `category` (text, not null) — "Essentials", "Features", "Safety", "Location"

### Property Amenities (join table)
- `property_id` (UUID, FK → properties.id)
- `amenity_id` (UUID, FK → amenities.id)
- PK: (property_id, amenity_id)

### Bookings
- `id` (UUID, PK)
- `property_id` (UUID, FK → properties.id, not null)
- `guest_id` (UUID, FK → users.id, not null)
- `check_in` (date, not null)
- `check_out` (date, not null)
- `num_guests` (integer, not null)
- `total_price` (numeric, not null)
- `status` (text, not null) — "pending", "confirmed", "cancelled", "completed"
- `special_requests` (text, nullable)
- `created_at` (timestamp, default now)

### Reviews
- `id` (UUID, PK)
- `booking_id` (UUID, FK → bookings.id, unique, not null)
- `property_id` (UUID, FK → properties.id, not null)
- `guest_id` (UUID, FK → users.id, not null)
- `rating` (integer, not null, check 1-5)
- `cleanliness` (integer, not null, check 1-5)
- `accuracy` (integer, not null, check 1-5)
- `communication` (integer, not null, check 1-5)
- `location` (integer, not null, check 1-5)
- `value` (integer, not null, check 1-5)
- `comment` (text, nullable)
- `created_at` (timestamp, default now)

### Favorites
- `user_id` (UUID, FK → users.id)
- `property_id` (UUID, FK → properties.id)
- `created_at` (timestamp, default now)
- PK: (user_id, property_id)

## Pages

### 1. Login / Register Page (`/login`)
- Simple email-based login (no password for simplicity — enter email, get logged in)
- Registration form with name, email fields
- Toggle between login and register modes
- After login, redirect to home page
- Store current user in Redux state

### 2. Home / Search Page (`/`)
- **Search bar** at top: location text input, check-in date, check-out date, number of guests
- **Category filter bar**: horizontal scrollable chips for property types (Apartment, House, Cabin, Villa, etc.)
- **Property grid**: responsive grid of property cards
  - Each card shows: main image, property type badge, title, city/country, price per night, average rating with review count
  - Heart icon to favorite/unfavorite (if logged in)
  - Clicking card navigates to property detail page
- **Filters panel** (toggle open/close): price range slider, bedrooms min, beds min, bathrooms min, amenity checkboxes
- Pagination or infinite scroll for results

### 3. Property Detail Page (`/properties/:id`)
- **Image gallery**: grid layout showing property images (main large image + smaller thumbnails)
- **Property header**: title, city/country, rating summary, review count, host name with avatar
- **Property info section**: property type, guests, bedrooms, beds, bathrooms
- **Description**: full property description text
- **Amenities list**: grouped by category with icons
- **Booking card** (sticky sidebar on desktop):
  - Price per night display
  - Check-in / check-out date pickers
  - Guest count selector
  - Price breakdown: nightly rate x nights, cleaning fee, total
  - "Reserve" button (must be logged in, cannot book own property)
- **Reviews section**: average ratings by category (cleanliness, accuracy, communication, location, value), individual review cards with guest name, date, rating, comment
- **Host info card**: host name, avatar, bio, member since date, number of listings

### 4. My Trips Page (`/trips`)
- Requires login
- Tabs: "Upcoming", "Past", "Cancelled"
- Each trip card shows: property image, property title, city, dates, status badge, total price
- Click trip card to see booking details
- Cancel button for pending/confirmed bookings (with confirmation dialog)
- "Write Review" button for completed bookings without a review

### 5. Host Dashboard (`/hosting`)
- Requires login and host status
- **Stats overview**: total listings, active bookings, total earnings, average rating
- **Listings tab**: grid of host's properties with edit/deactivate actions
- **Bookings tab**: table of bookings for host's properties with status filters
  - Host can confirm or cancel pending bookings
- **Add Listing button**: opens a multi-step form to create a new property
  - Step 1: Property type and title
  - Step 2: Location (address, city, state, country)
  - Step 3: Details (guests, bedrooms, beds, bathrooms)
  - Step 4: Amenities selection (checkboxes grouped by category)
  - Step 5: Photos (URL input for image URLs)
  - Step 6: Pricing (price per night, cleaning fee)
  - Step 7: Review and publish

### 6. User Profile Page (`/profile`)
- Requires login
- View/edit name, bio, phone, avatar URL
- "Become a Host" button (if not already a host)
- List of user's reviews they've written

### 7. Write Review Page (`/trips/:bookingId/review`)
- Requires login
- Rating sliders for: overall, cleanliness, accuracy, communication, location, value
- Text comment area
- Submit button
- Shows property info and booking dates for context

## API Endpoints (Netlify Functions)

### Auth
- `POST /api/auth` — Login/register by email. Returns user object.

### Users
- `GET /api/users/:id` — Get user profile
- `PUT /api/users/:id` — Update user profile
- `POST /api/users/:id/become-host` — Set is_host to true

### Properties
- `GET /api/properties` — List properties with search/filter query params (city, check_in, check_out, guests, property_type, min_price, max_price, min_bedrooms, min_beds, min_bathrooms, amenities, page, limit)
- `GET /api/properties/:id` — Get property detail with images, amenities, host info
- `POST /api/properties` — Create property (host only)
- `PUT /api/properties/:id` — Update property (owner only)
- `DELETE /api/properties/:id` — Deactivate property (owner only)

### Property Images
- `POST /api/property-images` — Add image to property
- `DELETE /api/property-images/:id` — Remove image

### Bookings
- `GET /api/bookings` — Get current user's bookings (as guest)
- `GET /api/host-bookings` — Get bookings for host's properties
- `POST /api/bookings` — Create booking
- `PUT /api/bookings/:id` — Update booking status (confirm/cancel)

### Reviews
- `GET /api/reviews?property_id=X` — Get reviews for a property
- `POST /api/reviews` — Create review for a completed booking

### Favorites
- `GET /api/favorites` — Get current user's favorites
- `POST /api/favorites` — Add favorite
- `DELETE /api/favorites/:propertyId` — Remove favorite

### Amenities
- `GET /api/amenities` — List all amenities

## Visual Design

- Clean, modern design inspired by Airbnb's aesthetic
- White/light gray background with coral/red accent color (#FF5A5F)
- Rounded cards with subtle shadows
- Clean typography using system fonts
- Responsive layout: 1 column mobile, 2 columns tablet, 3-4 columns desktop for property grid
- Property cards with rounded corners, image at top, info below
- Sticky booking sidebar on property detail page (desktop)
- Collapsible navigation sidebar with icons for: Home/Search, My Trips, Hosting, Profile
- Star ratings displayed with filled/unfilled stars
- Status badges: pending (yellow), confirmed (green), cancelled (red), completed (blue)
