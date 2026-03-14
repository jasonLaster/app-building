import type { Context } from '@netlify/functions'
import { getSql } from './db.js'

export default async function handler(req: Request, _context: Context) {
  const sql = getSql()
  const url = new URL(req.url)

  if (req.method === 'GET') {
    const session = url.searchParams.get('session') || ''
    if (!session) {
      return new Response(JSON.stringify({ error: 'Missing session' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    try {
      const bookings = await sql`
        SELECT
          b.id, b.booking_reference, b.cabin_class, b.total_price_cents, b.status, b.created_at,
          b.return_flight_id,
          f.flight_number, f.departure_time, f.arrival_time, f.duration_minutes,
          al.name AS airline_name, al.iata_code AS airline_code, al.logo_color,
          oa.iata_code AS origin_code, oa.name AS origin_name, oa.city AS origin_city,
          da.iata_code AS dest_code, da.name AS dest_name, da.city AS dest_city,
          rf.departure_time AS return_departure_time, rf.arrival_time AS return_arrival_time
        FROM bookings b
        JOIN sessions s ON b.session_id = s.id
        JOIN flights f ON b.flight_id = f.id
        JOIN airlines al ON f.airline_id = al.id
        JOIN airports oa ON f.origin_airport_id = oa.id
        JOIN airports da ON f.destination_airport_id = da.id
        LEFT JOIN flights rf ON b.return_flight_id = rf.id
        WHERE s.session_token = ${session}
        ORDER BY f.departure_time ASC
      `

      return new Response(JSON.stringify(bookings), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (err) {
      console.error('Fetch bookings error:', err)
      return new Response(JSON.stringify({ error: 'Failed to fetch bookings' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  if (req.method === 'PATCH') {
    try {
      const body = await req.json() as {
        bookingId: string
        sessionToken: string
        status: string
      }

      if (body.status !== 'cancelled') {
        return new Response(JSON.stringify({ error: 'Invalid status' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const result = await sql`
        UPDATE bookings
        SET status = ${body.status}
        WHERE id = ${body.bookingId}
          AND session_id IN (SELECT id FROM sessions WHERE session_token = ${body.sessionToken})
          AND status = 'confirmed'
        RETURNING id, status
      `

      const updated = result[0]
      if (!updated) {
        return new Response(JSON.stringify({ error: 'Booking not found or already cancelled' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ id: updated.id, status: updated.status }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (err) {
      console.error('Cancel booking error:', err)
      return new Response(JSON.stringify({ error: 'Failed to cancel booking' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  })
}
