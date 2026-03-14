import { neon } from '@neondatabase/serverless'

export async function initSchema(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl)

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      avatar_url TEXT,
      bio TEXT,
      phone TEXT,
      is_host BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS properties (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      host_id UUID NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      property_type TEXT NOT NULL,
      price_per_night NUMERIC NOT NULL,
      cleaning_fee NUMERIC DEFAULT 0,
      max_guests INTEGER NOT NULL,
      bedrooms INTEGER NOT NULL,
      beds INTEGER NOT NULL,
      bathrooms INTEGER NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT,
      country TEXT NOT NULL,
      latitude NUMERIC,
      longitude NUMERIC,
      check_in_time TEXT DEFAULT '15:00',
      check_out_time TEXT DEFAULT '11:00',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS property_images (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      caption TEXT,
      display_order INTEGER DEFAULT 0
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS amenities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT UNIQUE NOT NULL,
      icon TEXT,
      category TEXT NOT NULL
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS property_amenities (
      property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
      PRIMARY KEY (property_id, amenity_id)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      property_id UUID NOT NULL REFERENCES properties(id),
      guest_id UUID NOT NULL REFERENCES users(id),
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      num_guests INTEGER NOT NULL,
      total_price NUMERIC NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      special_requests TEXT,
      created_at TIMESTAMP DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id),
      property_id UUID NOT NULL REFERENCES properties(id),
      guest_id UUID NOT NULL REFERENCES users(id),
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      cleanliness INTEGER NOT NULL CHECK (cleanliness >= 1 AND cleanliness <= 5),
      accuracy INTEGER NOT NULL CHECK (accuracy >= 1 AND accuracy <= 5),
      communication INTEGER NOT NULL CHECK (communication >= 1 AND communication <= 5),
      location INTEGER NOT NULL CHECK (location >= 1 AND location <= 5),
      value INTEGER NOT NULL CHECK (value >= 1 AND value <= 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS favorites (
      user_id UUID NOT NULL REFERENCES users(id),
      property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT now(),
      PRIMARY KEY (user_id, property_id)
    )
  `

  // Indices for common queries
  await sql`CREATE INDEX IF NOT EXISTS idx_properties_host_id ON properties(host_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city)`
  await sql`CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type)`
  await sql`CREATE INDEX IF NOT EXISTS idx_properties_is_active ON properties(is_active)`
  await sql`CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_bookings_guest_id ON bookings(guest_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)`
  await sql`CREATE INDEX IF NOT EXISTS idx_reviews_property_id ON reviews(property_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_reviews_guest_id ON reviews(guest_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id)`
}

// Allow running directly: npx tsx scripts/schema.ts <DATABASE_URL>
const isMain = process.argv[1] && import.meta.filename && process.argv[1] === import.meta.filename
if (isMain) {
  const url = process.argv[2]
  if (url) {
    initSchema(url).then(() => {
      console.log('Schema initialized successfully')
      process.exit(0)
    }).catch((err) => {
      console.error('Schema initialization failed:', err)
      process.exit(1)
    })
  }
}
