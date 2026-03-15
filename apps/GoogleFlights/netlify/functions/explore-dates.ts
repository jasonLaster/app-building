import type { Context } from '@netlify/functions'
import { getSql } from './db.js'

export default async (request: Request, _context: Context) => {
  const url = new URL(request.url)
  const originCode = url.searchParams.get('origin')
  const range = url.searchParams.get('range') || 'weekend'

  if (!originCode) {
    return Response.json({ error: 'origin is required' }, { status: 400 })
  }

  const sql = getSql()

  // Get lowest prices per departure date from this origin
  const results = await sql`
    SELECT
      DATE(f.departure_time) as departure_date,
      MIN(p.total_price_cents) as lowest_price_cents
    FROM flights f
    JOIN airports oa ON f.origin_airport_id = oa.id
    JOIN prices p ON p.flight_id = f.id AND p.cabin_class = 'economy'
    WHERE oa.iata_code = ${originCode}
      AND f.departure_time > NOW()
      AND f.departure_time < NOW() + INTERVAL '90 days'
    GROUP BY DATE(f.departure_time)
    ORDER BY departure_date ASC
  `

  // Filter dates based on range type
  const datePrices = results
    .map((r) => {
      const date = (r.departure_date instanceof Date ? r.departure_date.toISOString() : String(r.departure_date)).split('T')[0]!
      const dayOfWeek = new Date(date + 'T12:00:00').getDay()

      if (range === 'weekend') {
        // Only show Fridays and Saturdays for weekend trips
        if (dayOfWeek !== 5 && dayOfWeek !== 6) return null
      }

      return {
        date,
        price: r.lowest_price_cents ? Math.round(Number(r.lowest_price_cents) / 100) : null,
      }
    })
    .filter(Boolean)

  return Response.json(datePrices)
}
