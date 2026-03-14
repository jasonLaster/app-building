import { neon } from '@neondatabase/serverless'

export async function truncateAndSeed(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl)

  // Truncate in dependency order (leaf tables first)
  await sql`TRUNCATE favorites CASCADE`
  await sql`TRUNCATE reviews CASCADE`
  await sql`TRUNCATE bookings CASCADE`
  await sql`TRUNCATE property_amenities CASCADE`
  await sql`TRUNCATE property_images CASCADE`
  await sql`TRUNCATE amenities CASCADE`
  await sql`TRUNCATE properties CASCADE`
  await sql`TRUNCATE users CASCADE`

  await seedDatabase(databaseUrl)
}

export async function seedDatabase(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl)

  // Users
  const hostUser = await sql`
    INSERT INTO users (id, email, name, avatar_url, bio, phone, is_host, created_at)
    VALUES (
      'a1111111-1111-1111-1111-111111111111',
      'sarah@example.com',
      'Sarah Chen',
      'https://i.pravatar.cc/150?u=sarah',
      'Superhost with 5 years of experience. I love creating memorable stays for my guests.',
      '+1-555-0101',
      true,
      '2021-03-15'
    )
    RETURNING *
  `
  void hostUser

  await sql`
    INSERT INTO users (id, email, name, avatar_url, bio, phone, is_host, created_at)
    VALUES (
      'a2222222-2222-2222-2222-222222222222',
      'mike@example.com',
      'Mike Johnson',
      'https://i.pravatar.cc/150?u=mike',
      'Travel enthusiast and occasional host. Based in Austin, TX.',
      '+1-555-0102',
      true,
      '2022-06-01'
    )
  `

  await sql`
    INSERT INTO users (id, email, name, avatar_url, bio, phone, is_host, created_at)
    VALUES (
      'a3333333-3333-3333-3333-333333333333',
      'emma@example.com',
      'Emma Wilson',
      'https://i.pravatar.cc/150?u=emma',
      'Frequent traveler who loves finding unique places to stay.',
      '+1-555-0103',
      false,
      '2023-01-10'
    )
  `

  await sql`
    INSERT INTO users (id, email, name, avatar_url, bio, phone, is_host, created_at)
    VALUES (
      'a4444444-4444-4444-4444-444444444444',
      'alex@example.com',
      'Alex Rivera',
      'https://i.pravatar.cc/150?u=alex',
      'Digital nomad exploring the world one rental at a time.',
      '+1-555-0104',
      false,
      '2023-05-20'
    )
  `

  // Properties
  await sql`
    INSERT INTO properties (id, host_id, title, description, property_type, price_per_night, cleaning_fee, max_guests, bedrooms, beds, bathrooms, address, city, state, country, latitude, longitude)
    VALUES (
      'b1111111-1111-1111-1111-111111111111',
      'a1111111-1111-1111-1111-111111111111',
      'Cozy Downtown Loft with City Views',
      'Enjoy stunning city views from this beautifully renovated loft in the heart of downtown. Features exposed brick walls, hardwood floors, and floor-to-ceiling windows. Walking distance to restaurants, shops, and public transit.',
      'Loft',
      150,
      75,
      4,
      1,
      2,
      1,
      '123 Main St, Unit 4A',
      'New York',
      'NY',
      'United States',
      40.7128,
      -74.0060
    )
  `

  await sql`
    INSERT INTO properties (id, host_id, title, description, property_type, price_per_night, cleaning_fee, max_guests, bedrooms, beds, bathrooms, address, city, state, country, latitude, longitude)
    VALUES (
      'b2222222-2222-2222-2222-222222222222',
      'a1111111-1111-1111-1111-111111111111',
      'Beachfront Villa with Private Pool',
      'Wake up to ocean views in this stunning beachfront villa. Features a private infinity pool, outdoor dining area, and direct beach access. Perfect for families or groups looking for a luxury getaway. The villa is situated on a pristine stretch of coastline with crystal-clear waters and white sandy beaches. Enjoy breathtaking sunsets from the expansive terrace while sipping your favorite drinks.',
      'Villa',
      450,
      150,
      8,
      4,
      5,
      3,
      '789 Ocean Blvd',
      'Miami',
      'FL',
      'United States',
      25.7617,
      -80.1918
    )
  `

  await sql`
    INSERT INTO properties (id, host_id, title, description, property_type, price_per_night, cleaning_fee, max_guests, bedrooms, beds, bathrooms, address, city, state, country, latitude, longitude)
    VALUES (
      'b3333333-3333-3333-3333-333333333333',
      'a2222222-2222-2222-2222-222222222222',
      'Mountain Cabin Retreat',
      'Escape to this charming cabin nestled in the mountains. Features a wood-burning fireplace, hot tub on the deck, and panoramic mountain views. Ideal for a romantic weekend or a peaceful solo retreat.',
      'Cabin',
      200,
      50,
      6,
      3,
      4,
      2,
      '45 Pine Ridge Rd',
      'Asheville',
      'NC',
      'United States',
      35.5951,
      -82.5515
    )
  `

  await sql`
    INSERT INTO properties (id, host_id, title, description, property_type, price_per_night, cleaning_fee, max_guests, bedrooms, beds, bathrooms, address, city, state, country, latitude, longitude)
    VALUES (
      'b4444444-4444-4444-4444-444444444444',
      'a2222222-2222-2222-2222-222222222222',
      'Modern Austin Apartment',
      'Stylish apartment in the vibrant South Congress neighborhood. Walking distance to live music venues, restaurants, and boutiques. Features a rooftop pool and gym access.',
      'Apartment',
      120,
      40,
      2,
      1,
      1,
      1,
      '567 S Congress Ave, #302',
      'Austin',
      'TX',
      'United States',
      30.2472,
      -97.7494
    )
  `

  await sql`
    INSERT INTO properties (id, host_id, title, description, property_type, price_per_night, cleaning_fee, max_guests, bedrooms, beds, bathrooms, address, city, state, country, latitude, longitude)
    VALUES (
      'b5555555-5555-5555-5555-555555555555',
      'a1111111-1111-1111-1111-111111111111',
      'Historic Townhouse in Georgetown',
      'Charming 19th-century townhouse with modern amenities. Features original woodwork, a private garden, and is steps away from Georgetown''s shops and waterfront. Three floors of living space.',
      'Townhouse',
      275,
      100,
      6,
      3,
      3,
      2,
      '234 N St NW',
      'Washington',
      'DC',
      'United States',
      38.9072,
      -77.0369
    )
  `

  // Property images
  await sql`
    INSERT INTO property_images (property_id, url, caption, display_order) VALUES
    ('b1111111-1111-1111-1111-111111111111', 'https://picsum.photos/seed/loft1/800/600', 'Living area with city view', 0),
    ('b1111111-1111-1111-1111-111111111111', 'https://picsum.photos/seed/loft2/800/600', 'Kitchen', 1),
    ('b1111111-1111-1111-1111-111111111111', 'https://picsum.photos/seed/loft3/800/600', 'Bedroom', 2),
    ('b2222222-2222-2222-2222-222222222222', 'https://picsum.photos/seed/villa1/800/600', 'Pool overlooking ocean', 0),
    ('b2222222-2222-2222-2222-222222222222', 'https://picsum.photos/seed/villa2/800/600', 'Master bedroom', 1),
    ('b2222222-2222-2222-2222-222222222222', 'https://picsum.photos/seed/villa3/800/600', 'Outdoor dining', 2),
    ('b2222222-2222-2222-2222-222222222222', 'https://picsum.photos/seed/villa4/800/600', 'Beach access', 3),
    ('b3333333-3333-3333-3333-333333333333', 'https://picsum.photos/seed/cabin1/800/600', 'Cabin exterior', 0),
    ('b3333333-3333-3333-3333-333333333333', 'https://picsum.photos/seed/cabin2/800/600', 'Fireplace room', 1),
    ('b3333333-3333-3333-3333-333333333333', 'https://picsum.photos/seed/cabin3/800/600', 'Mountain view from deck', 2),
    ('b4444444-4444-4444-4444-444444444444', 'https://picsum.photos/seed/apt1/800/600', 'Living room', 0),
    ('b4444444-4444-4444-4444-444444444444', 'https://picsum.photos/seed/apt2/800/600', 'Bedroom', 1),
    ('b5555555-5555-5555-5555-555555555555', 'https://picsum.photos/seed/town1/800/600', 'Front facade', 0),
    ('b5555555-5555-5555-5555-555555555555', 'https://picsum.photos/seed/town2/800/600', 'Garden', 1),
    ('b5555555-5555-5555-5555-555555555555', 'https://picsum.photos/seed/town3/800/600', 'Main living area', 2)
  `

  // Amenities
  await sql`
    INSERT INTO amenities (id, name, icon, category) VALUES
    ('c1111111-1111-1111-1111-111111111111', 'WiFi', 'wifi', 'Essentials'),
    ('c2222222-2222-2222-2222-222222222222', 'Kitchen', 'cooking-pot', 'Essentials'),
    ('c3333333-3333-3333-3333-333333333333', 'Air conditioning', 'snowflake', 'Essentials'),
    ('c4444444-4444-4444-4444-444444444444', 'Heating', 'flame', 'Essentials'),
    ('c5555555-5555-5555-5555-555555555555', 'Washer', 'shirt', 'Essentials'),
    ('c6666666-6666-6666-6666-666666666666', 'TV', 'tv', 'Essentials'),
    ('c7777777-7777-7777-7777-777777777777', 'Pool', 'waves', 'Features'),
    ('c8888888-8888-8888-8888-888888888888', 'Hot tub', 'bath', 'Features'),
    ('c9999999-9999-9999-9999-999999999999', 'Free parking', 'car', 'Features'),
    ('ca111111-1111-1111-1111-111111111111', 'Gym', 'dumbbell', 'Features'),
    ('cb111111-1111-1111-1111-111111111111', 'EV charger', 'plug-zap', 'Features'),
    ('cc111111-1111-1111-1111-111111111111', 'Smoke alarm', 'bell-ring', 'Safety'),
    ('cd111111-1111-1111-1111-111111111111', 'Carbon monoxide alarm', 'shield-alert', 'Safety'),
    ('ce111111-1111-1111-1111-111111111111', 'First aid kit', 'cross', 'Safety'),
    ('cf111111-1111-1111-1111-111111111111', 'Fire extinguisher', 'flame-kindling', 'Safety'),
    ('d1111111-1111-1111-1111-111111111111', 'Beachfront', 'umbrella', 'Location'),
    ('d2222222-2222-2222-2222-222222222222', 'Waterfront', 'ship', 'Location'),
    ('d3333333-3333-3333-3333-333333333333', 'Ski-in/Ski-out', 'mountain-snow', 'Location')
  `

  // Property amenities
  await sql`
    INSERT INTO property_amenities (property_id, amenity_id) VALUES
    ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111'),
    ('b1111111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222'),
    ('b1111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333'),
    ('b1111111-1111-1111-1111-111111111111', 'c4444444-4444-4444-4444-444444444444'),
    ('b1111111-1111-1111-1111-111111111111', 'c6666666-6666-6666-6666-666666666666'),
    ('b1111111-1111-1111-1111-111111111111', 'cc111111-1111-1111-1111-111111111111'),
    ('b2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111'),
    ('b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222'),
    ('b2222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333'),
    ('b2222222-2222-2222-2222-222222222222', 'c7777777-7777-7777-7777-777777777777'),
    ('b2222222-2222-2222-2222-222222222222', 'c9999999-9999-9999-9999-999999999999'),
    ('b2222222-2222-2222-2222-222222222222', 'd1111111-1111-1111-1111-111111111111'),
    ('b2222222-2222-2222-2222-222222222222', 'c4444444-4444-4444-4444-444444444444'),
    ('b2222222-2222-2222-2222-222222222222', 'c5555555-5555-5555-5555-555555555555'),
    ('b2222222-2222-2222-2222-222222222222', 'c6666666-6666-6666-6666-666666666666'),
    ('b2222222-2222-2222-2222-222222222222', 'c8888888-8888-8888-8888-888888888888'),
    ('b2222222-2222-2222-2222-222222222222', 'ca111111-1111-1111-1111-111111111111'),
    ('b2222222-2222-2222-2222-222222222222', 'cb111111-1111-1111-1111-111111111111'),
    ('b2222222-2222-2222-2222-222222222222', 'cc111111-1111-1111-1111-111111111111'),
    ('b2222222-2222-2222-2222-222222222222', 'cd111111-1111-1111-1111-111111111111'),
    ('b2222222-2222-2222-2222-222222222222', 'ce111111-1111-1111-1111-111111111111'),
    ('b2222222-2222-2222-2222-222222222222', 'cf111111-1111-1111-1111-111111111111'),
    ('b2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222'),
    ('b2222222-2222-2222-2222-222222222222', 'd3333333-3333-3333-3333-333333333333'),
    ('b3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111'),
    ('b3333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222'),
    ('b3333333-3333-3333-3333-333333333333', 'c4444444-4444-4444-4444-444444444444'),
    ('b3333333-3333-3333-3333-333333333333', 'c8888888-8888-8888-8888-888888888888'),
    ('b3333333-3333-3333-3333-333333333333', 'c9999999-9999-9999-9999-999999999999'),
    ('b3333333-3333-3333-3333-333333333333', 'cc111111-1111-1111-1111-111111111111'),
    ('b3333333-3333-3333-3333-333333333333', 'ce111111-1111-1111-1111-111111111111'),
    ('b4444444-4444-4444-4444-444444444444', 'c1111111-1111-1111-1111-111111111111'),
    ('b4444444-4444-4444-4444-444444444444', 'c2222222-2222-2222-2222-222222222222'),
    ('b4444444-4444-4444-4444-444444444444', 'c3333333-3333-3333-3333-333333333333'),
    ('b4444444-4444-4444-4444-444444444444', 'ca111111-1111-1111-1111-111111111111'),
    ('b4444444-4444-4444-4444-444444444444', 'c7777777-7777-7777-7777-777777777777'),
    ('b4444444-4444-4444-4444-444444444444', 'cc111111-1111-1111-1111-111111111111'),
    ('b5555555-5555-5555-5555-555555555555', 'c1111111-1111-1111-1111-111111111111'),
    ('b5555555-5555-5555-5555-555555555555', 'c2222222-2222-2222-2222-222222222222'),
    ('b5555555-5555-5555-5555-555555555555', 'c3333333-3333-3333-3333-333333333333'),
    ('b5555555-5555-5555-5555-555555555555', 'c4444444-4444-4444-4444-444444444444'),
    ('b5555555-5555-5555-5555-555555555555', 'c5555555-5555-5555-5555-555555555555'),
    ('b5555555-5555-5555-5555-555555555555', 'c6666666-6666-6666-6666-666666666666'),
    ('b5555555-5555-5555-5555-555555555555', 'cc111111-1111-1111-1111-111111111111'),
    ('b5555555-5555-5555-5555-555555555555', 'cd111111-1111-1111-1111-111111111111')
  `

  // Bookings
  await sql`
    INSERT INTO bookings (id, property_id, guest_id, check_in, check_out, num_guests, total_price, status, special_requests) VALUES
    ('e1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', '2025-12-15', '2025-12-20', 2, 825, 'completed', 'Late check-in please'),
    ('e2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'a4444444-4444-4444-4444-444444444444', '2026-04-01', '2026-04-07', 6, 2850, 'confirmed', NULL),
    ('e3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', '2026-05-10', '2026-05-13', 2, 650, 'pending', 'Celebrating anniversary'),
    ('e4444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', '2025-11-01', '2025-11-05', 1, 520, 'completed', NULL),
    ('e5555555-5555-5555-5555-555555555555', 'b1111111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444', '2025-10-20', '2025-10-22', 2, 375, 'cancelled', NULL),
    ('e6666666-6666-6666-6666-666666666666', 'b5555555-5555-5555-5555-555555555555', 'a3333333-3333-3333-3333-333333333333', '2026-06-15', '2026-06-20', 4, 1475, 'confirmed', 'Need parking info')
  `

  // Reviews
  await sql`
    INSERT INTO reviews (booking_id, property_id, guest_id, rating, cleanliness, accuracy, communication, location, value, comment) VALUES
    ('e1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 5, 5, 5, 5, 5, 4, 'Absolutely loved this loft! The city views are even better than the photos. Sarah was a wonderful host. Would definitely stay again.'),
    ('e4444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 4, 4, 4, 5, 5, 4, 'Great location in SoCo. The apartment was clean and well-equipped. The rooftop pool was a nice bonus. Only wish the bedroom was a bit larger.')
  `

  // Favorites
  await sql`
    INSERT INTO favorites (user_id, property_id) VALUES
    ('a3333333-3333-3333-3333-333333333333', 'b2222222-2222-2222-2222-222222222222'),
    ('a3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333'),
    ('a4444444-4444-4444-4444-444444444444', 'b1111111-1111-1111-1111-111111111111'),
    ('a4444444-4444-4444-4444-444444444444', 'b5555555-5555-5555-5555-555555555555')
  `
}

// Allow running directly: npx tsx scripts/seed-db.ts <DATABASE_URL>
const isMain = process.argv[1] && import.meta.filename && process.argv[1] === import.meta.filename
if (isMain) {
  const url = process.argv[2]
  if (url) {
    truncateAndSeed(url).then(() => {
      console.log('Database seeded successfully')
      process.exit(0)
    }).catch((err) => {
      console.error('Seeding failed:', err)
      process.exit(1)
    })
  }
}
