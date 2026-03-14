import type { Context } from '@netlify/functions'
import { getSql } from './db.js'

export default async (request: Request, _context: Context) => {
  const sql = getSql()
  const url = new URL(request.url)

  const origin = url.searchParams.get('origin') || ''
  const destination = url.searchParams.get('destination') || ''
  const departureDate = url.searchParams.get('departureDate') || ''
  const cabinClass = url.searchParams.get('cabinClass') || 'economy'
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = 20
  const offset = (page - 1) * limit

  if (!origin || !destination || !departureDate) {
    return Response.json({ error: 'Missing required parameters' }, { status: 400 })
  }

  const results = await sql`
    SELECT f.id, f.flight_number, f.departure_time, f.arrival_time, f.duration_minutes,
           f.aircraft_type, f.has_wifi, f.has_power, f.has_entertainment, f.co2_kg,
           al.name as airline_name, al.iata_code as airline_code, al.logo_color,
           oa.iata_code as origin_code, oa.name as origin_name, oa.city as origin_city,
           da.iata_code as dest_code, da.name as dest_name, da.city as dest_city,
           p.total_price_cents, p.base_price_cents, p.taxes_cents, p.cabin_class, p.available_seats,
           (SELECT COUNT(*) FROM flight_legs fl WHERE fl.flight_id = f.id) as num_legs,
           COALESCE((SELECT string_agg(a2.iata_code, ', ' ORDER BY fl2.leg_order) FROM flight_legs fl2 JOIN airports a2 ON fl2.origin_airport_id = a2.id WHERE fl2.flight_id = f.id AND fl2.leg_order > 1), '') as layover_codes
    FROM flights f
    JOIN airlines al ON f.airline_id = al.id
    JOIN airports oa ON f.origin_airport_id = oa.id
    JOIN airports da ON f.destination_airport_id = da.id
    JOIN prices p ON p.flight_id = f.id AND p.cabin_class = ${cabinClass}
    WHERE oa.iata_code = ${origin}
      AND da.iata_code = ${destination}
      AND f.departure_time::date = ${departureDate}::date
    ORDER BY p.total_price_cents ASC
    LIMIT ${limit} OFFSET ${offset}
  `

  // Get total count
  const countResult = await sql`
    SELECT COUNT(*) as total
    FROM flights f
    JOIN airports oa ON f.origin_airport_id = oa.id
    JOIN airports da ON f.destination_airport_id = da.id
    JOIN prices p ON p.flight_id = f.id AND p.cabin_class = ${cabinClass}
    WHERE oa.iata_code = ${origin}
      AND da.iata_code = ${destination}
      AND f.departure_time::date = ${departureDate}::date
  `

  const countRow = countResult[0]
  const total = countRow ? Number(countRow.total) : 0

  return Response.json({
    flights: results,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}
