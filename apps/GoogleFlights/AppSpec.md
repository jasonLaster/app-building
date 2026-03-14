# Google Flights Clone — AppSpec

## Overview

A flight search and booking application inspired by Google Flights. Users can search for flights between airports, view results with pricing, filter and sort results, view flight details, select flights, and track saved/watched flights. The app provides a clean, modern UI with an intuitive search experience.

## Pages

### 1. Search Page (Home)

The main landing page with a prominent flight search form.

**Search Form:**
- **Trip type selector**: Round trip, One way, Multi-city (custom dropdown, not native select)
- **Passenger count selector**: Adults, Children, Infants (dropdown with +/- controls)
- **Cabin class selector**: Economy, Premium Economy, Business, First (custom dropdown)
- **Origin airport field**: Autocomplete text input that searches airports by name, city, or IATA code. Shows airport name and code in suggestions (e.g., "Los Angeles International Airport (LAX)"). Includes a swap button to exchange origin/destination.
- **Destination airport field**: Same autocomplete behavior as origin.
- **Departure date picker**: Calendar date picker for selecting departure date.
- **Return date picker**: Calendar date picker for return date (hidden when "One way" is selected).
- **Search button**: Prominent button that triggers the flight search.

**Below the search form:**
- **Recent searches**: Shows the user's recent search history (stored in the database per user session). Each recent search shows origin → destination, dates, and passenger count. Clicking a recent search re-populates and executes the search.
- **Popular destinations**: A grid of destination cards showing city name, country, image placeholder (colored gradient), and a "from $X" starting price. Clicking a card starts a search to that destination.

### 2. Search Results Page

Displays flight results after a search is performed.

**Search Summary Bar (top):**
- Editable search parameters (origin, destination, dates, passengers, cabin class) displayed inline. Clicking any parameter opens an inline editor to modify and re-search.

**Filter Sidebar (left):**
- **Stops filter**: Nonstop, 1 stop, 2+ stops (checkboxes)
- **Airlines filter**: List of airlines with checkboxes, showing count of flights per airline
- **Price range slider**: Min/max price range filter with a histogram showing price distribution
- **Duration range slider**: Min/max flight duration filter
- **Departure time filter**: Morning, Afternoon, Evening, Night (checkbox groups for departure and arrival)
- **Sort by dropdown**: Best (default), Price (lowest), Duration (shortest), Departure time (earliest), Arrival time (earliest)

**Results List (main area):**
- Each flight result card shows:
  - Airline logo (colored circle with airline initials) and airline name
  - Departure time → Arrival time (with +1 day indicator if overnight)
  - Flight duration (e.g., "5h 30m")
  - Number of stops and layover airports (e.g., "1 stop · DFW")
  - Price (prominent, right-aligned)
  - CO₂ emissions estimate (e.g., "130 kg CO₂")
  - Expandable details section showing:
    - Each leg of the journey with departure/arrival times, airports, terminal info
    - Layover duration and airport
    - Aircraft type
    - Amenities (Wi-Fi, power, entertainment icons)
    - Baggage allowance info

- **"Track prices" toggle**: Button to watch this route for price changes

**Pagination**: Load more results button at the bottom.

### 3. Flight Details / Booking Page

Shown when a user selects a specific flight from results.

**Flight Summary:**
- Full itinerary display with all legs
- Departure and return flights (for round trips)
- Timeline visualization of the journey
- Total duration and number of stops

**Price Breakdown:**
- Base fare per passenger
- Taxes and fees
- Total price
- Price per passenger type (adult, child, infant)

**Passenger Information Form:**
- For each passenger:
  - First name, Last name
  - Date of birth (date picker)
  - Gender (dropdown)
  - Email address (for primary passenger)
  - Phone number (for primary passenger)

**Booking Action:**
- "Book Flight" button that saves the booking to the database
- Confirmation message with booking reference number

### 4. My Trips Page

Shows the user's booked flights and tracked routes.

**Tabs:**
- **Upcoming**: Flights with future departure dates, sorted by departure date
- **Past**: Completed flights
- **Tracked**: Routes the user is tracking for price changes

**Each trip card shows:**
- Route (origin → destination)
- Dates
- Airline and flight info
- Status badge (Confirmed, Completed, Cancelled)
- Price paid
- Booking reference
- Cancel button (for upcoming flights, with confirmation modal)

**Each tracked route shows:**
- Route (origin → destination)
- Date range being tracked
- Current lowest price
- Price trend indicator (up/down arrow with percentage)
- "Search" button to view current flights
- "Untrack" button

### 5. Explore Page

A discovery page for finding cheap flights.

**Map View:**
- An interactive display showing destinations from a selected origin
- Each destination shows the lowest available price
- Clicking a destination initiates a search

**Flexible Dates Grid:**
- A calendar-style grid showing prices for different departure dates
- Color-coded cells: green (cheap), yellow (moderate), red (expensive)
- Selectable date range (weekend trips, 1 week, 2 weeks)

**Deals Section:**
- Cards showing flight deals from the user's nearest/preferred airport
- Each deal shows destination, dates, price, and percentage savings vs average

## Database Schema

### Tables

**airports**
- id (UUID, PK)
- iata_code (VARCHAR(3), unique, not null)
- name (TEXT, not null)
- city (TEXT, not null)
- country (TEXT, not null)
- latitude (DECIMAL)
- longitude (DECIMAL)
- timezone (TEXT)

**airlines**
- id (UUID, PK)
- iata_code (VARCHAR(2), unique, not null)
- name (TEXT, not null)
- logo_color (VARCHAR(7)) — hex color for the airline circle logo

**flights**
- id (UUID, PK)
- airline_id (UUID, FK → airlines)
- flight_number (TEXT, not null)
- origin_airport_id (UUID, FK → airports)
- destination_airport_id (UUID, FK → airports)
- departure_time (TIMESTAMP, not null)
- arrival_time (TIMESTAMP, not null)
- duration_minutes (INTEGER, not null)
- aircraft_type (TEXT)
- has_wifi (BOOLEAN, default false)
- has_power (BOOLEAN, default false)
- has_entertainment (BOOLEAN, default false)
- co2_kg (INTEGER)

**flight_legs**
- id (UUID, PK)
- flight_id (UUID, FK → flights)
- leg_order (INTEGER, not null)
- origin_airport_id (UUID, FK → airports)
- destination_airport_id (UUID, FK → airports)
- departure_time (TIMESTAMP, not null)
- arrival_time (TIMESTAMP, not null)
- duration_minutes (INTEGER, not null)
- airline_id (UUID, FK → airlines)
- flight_number (TEXT)
- aircraft_type (TEXT)
- terminal_departure (TEXT)
- terminal_arrival (TEXT)

**prices**
- id (UUID, PK)
- flight_id (UUID, FK → flights)
- cabin_class (TEXT, not null) — economy, premium_economy, business, first
- base_price_cents (INTEGER, not null)
- taxes_cents (INTEGER, not null)
- total_price_cents (INTEGER, not null)
- available_seats (INTEGER)
- created_at (TIMESTAMP, default now())

**sessions**
- id (UUID, PK)
- session_token (TEXT, unique, not null)
- created_at (TIMESTAMP, default now())

**recent_searches**
- id (UUID, PK)
- session_id (UUID, FK → sessions)
- origin_airport_id (UUID, FK → airports)
- destination_airport_id (UUID, FK → airports)
- departure_date (DATE, not null)
- return_date (DATE)
- passengers_adults (INTEGER, default 1)
- passengers_children (INTEGER, default 0)
- passengers_infants (INTEGER, default 0)
- cabin_class (TEXT, default 'economy')
- trip_type (TEXT, default 'round_trip')
- searched_at (TIMESTAMP, default now())

**bookings**
- id (UUID, PK)
- session_id (UUID, FK → sessions)
- flight_id (UUID, FK → flights)
- return_flight_id (UUID, FK → flights, nullable)
- booking_reference (TEXT, unique, not null)
- cabin_class (TEXT, not null)
- total_price_cents (INTEGER, not null)
- status (TEXT, default 'confirmed') — confirmed, cancelled, completed
- created_at (TIMESTAMP, default now())

**booking_passengers**
- id (UUID, PK)
- booking_id (UUID, FK → bookings)
- first_name (TEXT, not null)
- last_name (TEXT, not null)
- date_of_birth (DATE)
- gender (TEXT)
- email (TEXT)
- phone (TEXT)
- passenger_type (TEXT, default 'adult') — adult, child, infant

**tracked_routes**
- id (UUID, PK)
- session_id (UUID, FK → sessions)
- origin_airport_id (UUID, FK → airports)
- destination_airport_id (UUID, FK → airports)
- departure_date_start (DATE)
- departure_date_end (DATE)
- cabin_class (TEXT, default 'economy')
- created_at (TIMESTAMP, default now())

## Seed Data

The database should be seeded with:
- ~50 major international airports (LAX, JFK, LHR, NRT, CDG, DXB, SIN, SYD, etc.)
- ~20 airlines (American, Delta, United, Southwest, JetBlue, British Airways, Lufthansa, Emirates, Singapore Airlines, ANA, etc.)
- ~200 flights with realistic routes, times, and multiple legs for connecting flights
- Prices for each cabin class for each flight
- A few sample bookings and tracked routes

## UI/UX Requirements

- Modern, clean design with a blue/white color scheme (inspired by Google's Material Design)
- Primary color: #1A73E8 (Google Blue)
- Background: #F8F9FA (light gray)
- Card backgrounds: white with subtle shadows
- Text: #202124 (dark gray) for primary, #5F6368 for secondary
- Responsive layout that works on desktop (primary target)
- Smooth transitions and hover effects on interactive elements
- Loading skeletons while data is being fetched
- Empty states with helpful messaging
- Collapsible navigation sidebar with icons for: Search, Explore, My Trips
- All interactive elements must have data-testid attributes
