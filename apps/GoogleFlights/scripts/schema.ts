import { neon } from '@neondatabase/serverless'

export async function initSchema(databaseUrl: string) {
  const sql = neon(databaseUrl)

  await sql`
    CREATE TABLE IF NOT EXISTS airports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      iata_code VARCHAR(3) UNIQUE NOT NULL,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      latitude DECIMAL,
      longitude DECIMAL,
      timezone TEXT
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS airlines (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      iata_code VARCHAR(2) UNIQUE NOT NULL,
      name TEXT NOT NULL,
      logo_color VARCHAR(7)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS flights (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      airline_id UUID REFERENCES airlines(id),
      flight_number TEXT NOT NULL,
      origin_airport_id UUID REFERENCES airports(id),
      destination_airport_id UUID REFERENCES airports(id),
      departure_time TIMESTAMP NOT NULL,
      arrival_time TIMESTAMP NOT NULL,
      duration_minutes INTEGER NOT NULL,
      aircraft_type TEXT,
      has_wifi BOOLEAN DEFAULT false,
      has_power BOOLEAN DEFAULT false,
      has_entertainment BOOLEAN DEFAULT false,
      co2_kg INTEGER
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS flight_legs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      flight_id UUID REFERENCES flights(id) ON DELETE CASCADE,
      leg_order INTEGER NOT NULL,
      origin_airport_id UUID REFERENCES airports(id),
      destination_airport_id UUID REFERENCES airports(id),
      departure_time TIMESTAMP NOT NULL,
      arrival_time TIMESTAMP NOT NULL,
      duration_minutes INTEGER NOT NULL,
      airline_id UUID REFERENCES airlines(id),
      flight_number TEXT,
      aircraft_type TEXT,
      terminal_departure TEXT,
      terminal_arrival TEXT
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS prices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      flight_id UUID REFERENCES flights(id) ON DELETE CASCADE,
      cabin_class TEXT NOT NULL,
      base_price_cents INTEGER NOT NULL,
      taxes_cents INTEGER NOT NULL,
      total_price_cents INTEGER NOT NULL,
      available_seats INTEGER,
      created_at TIMESTAMP DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_token TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS recent_searches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
      origin_airport_id UUID REFERENCES airports(id),
      destination_airport_id UUID REFERENCES airports(id),
      departure_date DATE NOT NULL,
      return_date DATE,
      passengers_adults INTEGER DEFAULT 1,
      passengers_children INTEGER DEFAULT 0,
      passengers_infants INTEGER DEFAULT 0,
      cabin_class TEXT DEFAULT 'economy',
      trip_type TEXT DEFAULT 'round_trip',
      searched_at TIMESTAMP DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
      flight_id UUID REFERENCES flights(id),
      return_flight_id UUID REFERENCES flights(id),
      booking_reference TEXT UNIQUE NOT NULL,
      cabin_class TEXT NOT NULL,
      total_price_cents INTEGER NOT NULL,
      status TEXT DEFAULT 'confirmed',
      created_at TIMESTAMP DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS booking_passengers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      date_of_birth DATE,
      gender TEXT,
      email TEXT,
      phone TEXT,
      passenger_type TEXT DEFAULT 'adult'
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS tracked_routes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
      origin_airport_id UUID REFERENCES airports(id),
      destination_airport_id UUID REFERENCES airports(id),
      departure_date_start DATE,
      departure_date_end DATE,
      cabin_class TEXT DEFAULT 'economy',
      created_at TIMESTAMP DEFAULT now()
    )
  `

  // Indices
  await sql`CREATE INDEX IF NOT EXISTS idx_flights_origin ON flights(origin_airport_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_flights_destination ON flights(destination_airport_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_flights_departure ON flights(departure_time)`
  await sql`CREATE INDEX IF NOT EXISTS idx_prices_flight ON prices(flight_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_prices_cabin ON prices(cabin_class)`
  await sql`CREATE INDEX IF NOT EXISTS idx_recent_searches_session ON recent_searches(session_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_bookings_session ON bookings(session_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_airports_iata ON airports(iata_code)`
}

// CLI entry point
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const dbUrl = process.argv[2]
  if (!dbUrl) {
    console.error('Usage: tsx scripts/schema.ts <DATABASE_URL>')
    process.exit(1)
  }
  initSchema(dbUrl).then(() => console.log('Schema initialized')).catch(e => { console.error(e); process.exit(1) })
}
