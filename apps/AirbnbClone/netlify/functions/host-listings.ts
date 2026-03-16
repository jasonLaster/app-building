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

    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
    const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') || '20', 10)))
    const offset = (page - 1) * pageSize

    const countResult = await sql`
      SELECT count(*)::int as total FROM properties WHERE host_id = ${hostId}
    `
    const total = (countResult[0] as Record<string, unknown>)?.total as number ?? 0

    const properties = await sql`
      SELECT p.*,
        (SELECT url FROM property_images pi WHERE pi.property_id = p.id ORDER BY pi.display_order ASC LIMIT 1) as main_image,
        (SELECT COALESCE(AVG(r.rating)::numeric(10,1), 0) FROM reviews r WHERE r.property_id = p.id) as avg_rating,
        (SELECT count(*)::int FROM reviews r WHERE r.property_id = p.id) as review_count
      FROM properties p
      WHERE p.host_id = ${hostId}
      ORDER BY p.created_at DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `
    return new Response(JSON.stringify({ items: properties, total, page, pageSize }), { status: 200, headers })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })
}
