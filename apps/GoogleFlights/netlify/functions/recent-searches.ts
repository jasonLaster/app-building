import type { Context } from '@netlify/functions'
import { getSql } from './db.js'

export default async (request: Request, _context: Context) => {
  const sql = getSql()
  const url = new URL(request.url)

  if (request.method === 'GET') {
    const sessionToken = url.searchParams.get('session') || ''
    if (!sessionToken) return Response.json([])

    const results = await sql`
      SELECT rs.id, rs.departure_date, rs.return_date, rs.passengers_adults, rs.passengers_children,
             rs.passengers_infants, rs.cabin_class, rs.trip_type, rs.searched_at,
             oa.iata_code as origin_code, oa.name as origin_name, oa.city as origin_city,
             da.iata_code as dest_code, da.name as dest_name, da.city as dest_city
      FROM recent_searches rs
      JOIN airports oa ON rs.origin_airport_id = oa.id
      JOIN airports da ON rs.destination_airport_id = da.id
      JOIN sessions s ON rs.session_id = s.id
      WHERE s.session_token = ${sessionToken}
      ORDER BY rs.searched_at DESC
      LIMIT 10
    `
    return Response.json(results)
  }

  if (request.method === 'POST') {
    const body = await request.json()
    const { sessionToken, originCode, destCode, departureDate, returnDate, adults, children, infants, cabinClass, tripType } = body

    // Ensure session exists
    const existing = await sql`SELECT id FROM sessions WHERE session_token = ${sessionToken}`
    let sessionId: string
    const existingRow = existing[0]
    if (existingRow) {
      sessionId = existingRow.id as string
    } else {
      const newSession = await sql`INSERT INTO sessions (session_token) VALUES (${sessionToken}) RETURNING id`
      const newRow = newSession[0]
      if (!newRow) return Response.json({ error: 'Failed to create session' }, { status: 500 })
      sessionId = newRow.id as string
    }

    const originRows = await sql`SELECT id FROM airports WHERE iata_code = ${originCode}`
    const destRows = await sql`SELECT id FROM airports WHERE iata_code = ${destCode}`
    const originRow = originRows[0]
    const destRow = destRows[0]
    if (!originRow || !destRow) return Response.json({ error: 'Airport not found' }, { status: 400 })

    await sql`
      INSERT INTO recent_searches (session_id, origin_airport_id, destination_airport_id, departure_date, return_date, passengers_adults, passengers_children, passengers_infants, cabin_class, trip_type)
      VALUES (${sessionId}, ${originRow.id}, ${destRow.id}, ${departureDate}, ${returnDate || null}, ${adults || 1}, ${children || 0}, ${infants || 0}, ${cabinClass || 'economy'}, ${tripType || 'round_trip'})
    `

    return Response.json({ success: true })
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}
