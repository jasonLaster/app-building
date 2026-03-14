import type { Context } from '@netlify/functions'
import { getSql } from './db.js'

export default async (request: Request, _context: Context) => {
  const sql = getSql()
  const url = new URL(request.url)
  const query = url.searchParams.get('q') || ''

  if (!query || query.length < 1) {
    return Response.json([])
  }

  const searchTerm = `%${query}%`
  const results = await sql`
    SELECT DISTINCT ON (iata_code) id, iata_code, name, city, country, latitude, longitude
    FROM airports
    WHERE name ILIKE ${searchTerm}
       OR city ILIKE ${searchTerm}
       OR iata_code ILIKE ${searchTerm}
    ORDER BY iata_code
    LIMIT 10
  `

  return Response.json(results)
}
