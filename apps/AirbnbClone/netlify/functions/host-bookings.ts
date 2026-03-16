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

      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
      const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') || '20', 10)))
      const offset = (page - 1) * pageSize

      const countResult = await sql`
        SELECT count(*)::int as total
        FROM bookings b
        JOIN properties p ON p.id = b.property_id
        WHERE p.host_id = ${hostId}
      `
      const total = (countResult[0] as Record<string, unknown>)?.total as number ?? 0

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
        LIMIT ${pageSize} OFFSET ${offset}
      `
      return new Response(JSON.stringify({ items: bookings, total, page, pageSize }), { status: 200, headers })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers })
  }
}
