import type { Context } from '@netlify/functions'
import { getSql } from './db.js'

const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
]

export default async (request: Request, _context: Context) => {
  const url = new URL(request.url)
  const originCode = url.searchParams.get('origin')

  if (!originCode) {
    return Response.json({ error: 'origin is required' }, { status: 400 })
  }

  const sql = getSql()

  // Find flights with lowest prices from this origin, and compute average for comparison
  const results = await sql`
    WITH route_prices AS (
      SELECT
        da.id as dest_id,
        da.iata_code as destination_code,
        da.city as destination_city,
        da.country as destination_country,
        f.id as flight_id,
        DATE(f.departure_time) as departure_date,
        p.total_price_cents,
        AVG(p.total_price_cents) OVER (PARTITION BY da.id) as avg_price_cents,
        ROW_NUMBER() OVER (PARTITION BY da.id ORDER BY p.total_price_cents ASC) as rn
      FROM flights f
      JOIN airports oa ON f.origin_airport_id = oa.id
      JOIN airports da ON f.destination_airport_id = da.id
      JOIN prices p ON p.flight_id = f.id AND p.cabin_class = 'economy'
      WHERE oa.iata_code = ${originCode}
        AND f.departure_time > NOW()
        AND f.departure_time < NOW() + INTERVAL '90 days'
    )
    SELECT
      dest_id,
      destination_code,
      destination_city,
      destination_country,
      departure_date,
      total_price_cents,
      avg_price_cents
    FROM route_prices
    WHERE rn = 1
      AND total_price_cents < avg_price_cents
    ORDER BY (avg_price_cents - total_price_cents)::float / NULLIF(avg_price_cents, 0) DESC
    LIMIT 8
  `

  const deals = results.map((r, i) => {
    const price = Math.round(Number(r.total_price_cents) / 100)
    const avgPrice = Math.round(Number(r.avg_price_cents) / 100)
    const savingsPercent = avgPrice > 0 ? Math.round(((avgPrice - price) / avgPrice) * 100) : 0
    const depDate = String(r.departure_date).split('T')[0]!

    // Compute return date (1 week later)
    const returnDate = new Date(depDate + 'T12:00:00')
    returnDate.setDate(returnDate.getDate() + 7)
    const retStr = returnDate.toISOString().split('T')[0]

    return {
      id: r.dest_id,
      destination_code: r.destination_code,
      destination_city: r.destination_city,
      destination_country: r.destination_country,
      departure_date: depDate,
      return_date: retStr,
      price,
      average_price: avgPrice,
      savings_percent: savingsPercent,
      gradient: gradients[i % gradients.length]!,
    }
  })

  return Response.json(deals)
}
