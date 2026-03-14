import type { Context } from '@netlify/functions'
import { getSql } from './db.js'

export default async (request: Request, _context: Context) => {
  const sql = getSql()
  const headers = { 'Content-Type': 'application/json' }

  if (request.method === 'GET') {
    const amenities = await sql`
      SELECT * FROM amenities ORDER BY category, name
    `
    return new Response(JSON.stringify(amenities), { status: 200, headers })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })
}
