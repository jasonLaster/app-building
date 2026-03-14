import type { Context } from '@netlify/functions'
import { getSql } from './db.js'

export default async (request: Request, _context: Context) => {
  const sql = getSql()
  const url = new URL(request.url)
  const headers = { 'Content-Type': 'application/json' }

  if (request.method === 'GET') {
    const guestId = url.searchParams.get('guest_id')
    const propertyId = url.searchParams.get('property_id')

    if (guestId) {
      const reviews = await sql`
        SELECT r.*, p.title as property_title
        FROM reviews r
        JOIN properties p ON p.id = r.property_id
        WHERE r.guest_id = ${guestId}
        ORDER BY r.created_at DESC
      `
      return new Response(JSON.stringify(reviews), { status: 200, headers })
    }

    if (propertyId) {
      const reviews = await sql`
        SELECT r.*, u.name as guest_name, u.avatar_url as guest_avatar
        FROM reviews r
        JOIN users u ON u.id = r.guest_id
        WHERE r.property_id = ${propertyId}
        ORDER BY r.created_at DESC
      `
      return new Response(JSON.stringify(reviews), { status: 200, headers })
    }

    return new Response(JSON.stringify({ error: 'guest_id or property_id is required' }), { status: 400, headers })
  }

  if (request.method === 'POST') {
    const body = await request.json() as {
      booking_id: string
      property_id: string
      guest_id: string
      rating: number
      cleanliness: number
      accuracy: number
      communication: number
      location: number
      value: number
      comment?: string | null
      created_at?: string | null
    }

    const { booking_id, property_id, guest_id, rating, cleanliness, accuracy, communication, location, value, comment, created_at } = body

    if (!booking_id || !property_id || !guest_id || !rating) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers })
    }

    const existingReview = await sql`SELECT id FROM reviews WHERE booking_id = ${booking_id}`
    if (existingReview.length > 0) {
      return new Response(JSON.stringify({ error: 'A review already exists for this booking' }), { status: 409, headers })
    }

    const result = await sql`
      INSERT INTO reviews (id, booking_id, property_id, guest_id, rating, cleanliness, accuracy, communication, location, value, comment, created_at)
      VALUES (gen_random_uuid(), ${booking_id}, ${property_id}, ${guest_id}, ${rating}, ${cleanliness}, ${accuracy}, ${communication}, ${location}, ${value}, ${comment || null}, ${created_at || new Date().toISOString()})
      RETURNING *
    `
    const review = result[0]
    if (!review) {
      return new Response(JSON.stringify({ error: 'Failed to create review' }), { status: 500, headers })
    }
    return new Response(JSON.stringify(review), { status: 201, headers })
  }

  if (request.method === 'DELETE') {
    const segments = url.pathname.split('/').filter(Boolean)
    const reviewId = segments[3]
    if (!reviewId) {
      return new Response(JSON.stringify({ error: 'Review ID is required' }), { status: 400, headers })
    }
    const result = await sql`DELETE FROM reviews WHERE id = ${reviewId} RETURNING *`
    const review = result[0]
    if (!review) {
      return new Response(JSON.stringify({ error: 'Review not found' }), { status: 404, headers })
    }
    return new Response(JSON.stringify(review), { status: 200, headers })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })
}
