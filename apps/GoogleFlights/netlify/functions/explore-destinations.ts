import type { Context } from '@netlify/functions'
import { getSql } from './db.js'

export default async (request: Request, _context: Context) => {
  const url = new URL(request.url)
  const originCode = url.searchParams.get('origin')

  if (!originCode) {
    return Response.json({ error: 'origin is required' }, { status: 400 })
  }

  const sql = getSql()

  const results = await sql`
    SELECT
      da.id,
      da.iata_code,
      da.city,
      da.country,
      da.latitude,
      da.longitude,
      MIN(p.total_price_cents) as lowest_price_cents,
      al.name as airline_name
    FROM flights f
    JOIN airports oa ON f.origin_airport_id = oa.id
    JOIN airports da ON f.destination_airport_id = da.id
    JOIN prices p ON p.flight_id = f.id AND p.cabin_class = 'economy'
    JOIN airlines al ON f.airline_id = al.id
    WHERE oa.iata_code = ${originCode}
      AND f.departure_time > NOW()
    GROUP BY da.id, da.iata_code, da.city, da.country, da.latitude, da.longitude, al.name
    ORDER BY lowest_price_cents ASC
    LIMIT 20
  `

  const destinations = results.map((r) => ({
    id: r.id,
    iata_code: r.iata_code,
    city: r.city,
    country: r.country,
    latitude: Number(r.latitude) || 0,
    longitude: Number(r.longitude) || 0,
    lowest_price: r.lowest_price_cents ? Math.round(Number(r.lowest_price_cents) / 100) : 0,
    airline_name: r.airline_name || 'Unknown',
  }))

  return Response.json(destinations)
}
