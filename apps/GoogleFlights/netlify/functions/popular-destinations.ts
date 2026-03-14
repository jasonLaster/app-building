import type { Context } from '@netlify/functions'
import { getSql } from './db.js'

export default async (_request: Request, _context: Context) => {
  const sql = getSql()

  const results = await sql`
    SELECT a.id, a.iata_code, a.city, a.country,
           MIN(p.total_price_cents) as min_price_cents
    FROM airports a
    JOIN flights f ON f.destination_airport_id = a.id
    JOIN prices p ON p.flight_id = f.id AND p.cabin_class = 'economy'
    WHERE a.iata_code IN ('NRT', 'LHR', 'CDG', 'DXB', 'SIN', 'SYD', 'FCO', 'BKK')
    GROUP BY a.id, a.iata_code, a.city, a.country
    ORDER BY min_price_cents ASC
    LIMIT 8
  `

  // Add gradient colors for display
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

  const destinations = results.map((r, i) => ({
    ...r,
    gradient: gradients[i % gradients.length],
    min_price: r.min_price_cents ? Math.round(Number(r.min_price_cents) / 100) : null,
  }))

  return Response.json(destinations)
}
