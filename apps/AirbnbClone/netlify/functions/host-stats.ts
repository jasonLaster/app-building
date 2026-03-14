import type { Context } from '@netlify/functions'
import { getSql } from './db.js'

export default async (request: Request, _context: Context) => {
  const sql = getSql()
  const url = new URL(request.url)
  const headers = { 'Content-Type': 'application/json' }

  if (request.method === 'GET') {
    const hostId = url.searchParams.get('host_id')
    if (!hostId) {
      return new Response(JSON.stringify({ error: 'host_id is required' }), { status: 400, headers })
    }

    const listingsResult = await sql`
      SELECT count(*)::int as total_listings
      FROM properties WHERE host_id = ${hostId} AND is_active = true
    `
    const listingsRow = listingsResult[0]
    const totalListings = listingsRow ? (listingsRow as Record<string, unknown>).total_listings as number : 0

    const bookingsResult = await sql`
      SELECT count(*)::int as active_bookings
      FROM bookings b
      JOIN properties p ON p.id = b.property_id
      WHERE p.host_id = ${hostId} AND b.status IN ('pending', 'confirmed')
    `
    const bookingsRow = bookingsResult[0]
    const activeBookings = bookingsRow ? (bookingsRow as Record<string, unknown>).active_bookings as number : 0

    const earningsResult = await sql`
      SELECT COALESCE(sum(b.total_price), 0)::numeric as total_earnings
      FROM bookings b
      JOIN properties p ON p.id = b.property_id
      WHERE p.host_id = ${hostId} AND b.status = 'completed'
    `
    const earningsRow = earningsResult[0]
    const totalEarnings = earningsRow ? Number((earningsRow as Record<string, unknown>).total_earnings) : 0

    const ratingResult = await sql`
      SELECT COALESCE(AVG(r.rating)::numeric(10,1), 0) as avg_rating,
        count(*)::int as review_count
      FROM reviews r
      JOIN properties p ON p.id = r.property_id
      WHERE p.host_id = ${hostId}
    `
    const ratingRow = ratingResult[0]
    const avgRating = ratingRow ? Number((ratingRow as Record<string, unknown>).avg_rating) : 0
    const reviewCount = ratingRow ? (ratingRow as Record<string, unknown>).review_count as number : 0

    return new Response(JSON.stringify({
      totalListings,
      activeBookings,
      totalEarnings,
      avgRating,
      reviewCount,
    }), { status: 200, headers })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })
}
