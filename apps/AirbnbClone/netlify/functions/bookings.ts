import type { Context } from '@netlify/functions'
import { getSql } from './db.js'

export default async (request: Request, _context: Context) => {
  const sql = getSql()
  const url = new URL(request.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const funcIdx = segments.indexOf('bookings')
  const bookingId = funcIdx >= 0 ? segments[funcIdx + 1] : undefined

  const headers = { 'Content-Type': 'application/json' }

  try {
  if (request.method === 'POST') {
    const body = await request.json() as {
      property_id: string
      guest_id: string
      check_in: string
      check_out: string
      num_guests: number
      total_price: number
      special_requests?: string
    }

    const { property_id, guest_id, check_in, check_out, num_guests, total_price, special_requests } = body

    if (!property_id || !guest_id || !check_in || !check_out || !num_guests || !total_price) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers })
    }

    const overlap = await sql`
      SELECT id FROM bookings
      WHERE property_id = ${property_id}
      AND status IN ('confirmed', 'pending')
      AND check_in < ${check_out}
      AND check_out > ${check_in}
    `
    if (overlap.length > 0) {
      return new Response(JSON.stringify({ error: 'Property is not available for the selected dates' }), { status: 409, headers })
    }

    const result = await sql`
      INSERT INTO bookings (id, property_id, guest_id, check_in, check_out, num_guests, total_price, status, special_requests, created_at)
      VALUES (gen_random_uuid(), ${property_id}, ${guest_id}, ${check_in}, ${check_out}, ${num_guests}, ${total_price}, 'pending', ${special_requests || null}, now())
      RETURNING *
    `
    const booking = result[0]
    return new Response(JSON.stringify(booking), { status: 201, headers })
  }

  if (request.method === 'PUT' && bookingId) {
    const body = await request.json() as { status: string }
    const { status } = body

    if (!['confirmed', 'cancelled'].includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid status' }), { status: 400, headers })
    }

    const result = await sql`
      UPDATE bookings SET status = ${status} WHERE id = ${bookingId} RETURNING *
    `
    const booking = result[0]
    if (!booking) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), { status: 404, headers })
    }
    return new Response(JSON.stringify(booking), { status: 200, headers })
  }

  if (request.method === 'DELETE' && bookingId) {
    const result = await sql`
      DELETE FROM bookings WHERE id = ${bookingId} RETURNING *
    `
    const booking = result[0]
    if (!booking) {
      return new Response(JSON.stringify({ error: 'Booking not found' }), { status: 404, headers })
    }
    return new Response(JSON.stringify(booking), { status: 200, headers })
  }

  if (request.method === 'DELETE' && !bookingId) {
    // Delete all non-seed bookings (seed IDs follow pattern e*-*-*-*-*)
    const seedIds = [
      'e1111111-1111-1111-1111-111111111111',
      'e2222222-2222-2222-2222-222222222222',
      'e3333333-3333-3333-3333-333333333333',
      'e4444444-4444-4444-4444-444444444444',
      'e5555555-5555-5555-5555-555555555555',
      'e6666666-6666-6666-6666-666666666666',
      'e7777777-7777-7777-7777-777777777777',
    ]
    await sql`DELETE FROM bookings WHERE id != ALL(${seedIds})`
    // Reset seed bookings to original statuses
    await sql`UPDATE bookings SET status = 'completed' WHERE id = 'e1111111-1111-1111-1111-111111111111'`
    await sql`UPDATE bookings SET status = 'confirmed' WHERE id = 'e2222222-2222-2222-2222-222222222222'`
    await sql`UPDATE bookings SET status = 'pending' WHERE id = 'e3333333-3333-3333-3333-333333333333'`
    await sql`UPDATE bookings SET status = 'completed' WHERE id = 'e4444444-4444-4444-4444-444444444444'`
    await sql`UPDATE bookings SET status = 'cancelled' WHERE id = 'e5555555-5555-5555-5555-555555555555'`
    await sql`UPDATE bookings SET status = 'confirmed' WHERE id = 'e6666666-6666-6666-6666-666666666666'`
    await sql`UPDATE bookings SET status = 'confirmed' WHERE id = 'e7777777-7777-7777-7777-777777777777'`
    return new Response(JSON.stringify({ success: true }), { status: 200, headers })
  }

  if (request.method === 'GET') {
    const guestId = url.searchParams.get('guest_id')
    const propertyId = url.searchParams.get('property_id')

    if (propertyId) {
      const bookings = await sql`
        SELECT check_in, check_out FROM bookings
        WHERE property_id = ${propertyId}
        AND status IN ('confirmed', 'pending')
        AND check_out >= CURRENT_DATE
        ORDER BY check_in ASC
      `
      return new Response(JSON.stringify(bookings), { status: 200, headers })
    }

    if (!guestId) {
      return new Response(JSON.stringify({ error: 'guest_id is required' }), { status: 400, headers })
    }

    const bookings = await sql`
      SELECT b.*,
        p.title as property_title, p.city as property_city, p.country as property_country,
        (SELECT url FROM property_images pi WHERE pi.property_id = p.id ORDER BY pi.display_order ASC LIMIT 1) as property_image,
        CASE WHEN EXISTS (SELECT 1 FROM reviews r WHERE r.booking_id = b.id) THEN true ELSE false END as has_review
      FROM bookings b
      JOIN properties p ON p.id = b.property_id
      WHERE b.guest_id = ${guestId}
      ORDER BY b.check_in ASC
    `
    return new Response(JSON.stringify(bookings), { status: 200, headers })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers })
  }
}
