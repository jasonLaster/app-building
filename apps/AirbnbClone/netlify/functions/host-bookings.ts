import type { Context } from '@netlify/functions'
import { getSql } from './db.js'

export default async (request: Request, _context: Context) => {
  const sql = getSql()
  const url = new URL(request.url)
  const headers = { 'Content-Type': 'application/json' }

  try {
    if (request.method === 'GET') {
      const hostId = url.searchParams.get('host_id')
      if (!hostId) {
        return new Response(JSON.stringify({ error: 'host_id is required' }), { status: 400, headers })
      }

      const bookings = await sql`
        SELECT b.*,
          p.title as property_title, p.city as property_city, p.country as property_country,
          (SELECT url FROM property_images pi WHERE pi.property_id = p.id ORDER BY pi.display_order ASC LIMIT 1) as property_image,
          u.name as guest_name, u.email as guest_email
        FROM bookings b
        JOIN properties p ON p.id = b.property_id
        JOIN users u ON u.id = b.guest_id
        WHERE p.host_id = ${hostId}
        ORDER BY b.created_at DESC
      `
      return new Response(JSON.stringify(bookings), { status: 200, headers })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers })
  }
}
