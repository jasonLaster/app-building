import type { Context } from '@netlify/functions'
import { getSql } from './db.js'

export default async (request: Request, _context: Context) => {
  const sql = getSql()
  const url = new URL(request.url)
  const flightId = url.searchParams.get('flightId')

  if (!flightId) {
    return Response.json({ error: 'Missing flightId parameter' }, { status: 400 })
  }

  const legs = await sql`
    SELECT fl.id, fl.leg_order, fl.departure_time, fl.arrival_time, fl.duration_minutes,
           fl.flight_number, fl.aircraft_type, fl.terminal_departure, fl.terminal_arrival,
           oa.iata_code as origin_code, oa.name as origin_name, oa.city as origin_city,
           da.iata_code as dest_code, da.name as dest_name, da.city as dest_city,
           al.name as airline_name, al.iata_code as airline_code
    FROM flight_legs fl
    JOIN airports oa ON fl.origin_airport_id = oa.id
    JOIN airports da ON fl.destination_airport_id = da.id
    LEFT JOIN airlines al ON fl.airline_id::text = al.id::text
    WHERE fl.flight_id = ${flightId}
    ORDER BY fl.leg_order ASC
  `

  return Response.json(legs)
}
