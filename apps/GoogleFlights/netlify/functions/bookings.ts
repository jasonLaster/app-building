import type { Context } from '@netlify/functions'
import { getSql } from './db.js'

export default async function handler(req: Request, _context: Context) {
  const sql = getSql()
  const url = new URL(req.url)

  if (req.method === 'POST') {
    try {
      const body = await req.json() as {
        sessionToken: string
        flightId: string
        returnFlightId?: string
        cabinClass: string
        totalPriceCents: number
        passengers: Array<{
          firstName: string
          lastName: string
          dateOfBirth: string
          gender: string
          email?: string
          phone?: string
          passengerType: string
        }>
      }

      // Ensure session exists
      const existingSessions = await sql`
        SELECT id FROM sessions WHERE session_token = ${body.sessionToken}
      `
      let sessionId: string
      const existingSession = existingSessions[0]
      if (existingSession) {
        sessionId = existingSession.id as string
      } else {
        const newSessions = await sql`
          INSERT INTO sessions (session_token) VALUES (${body.sessionToken})
          RETURNING id
        `
        const newSession = newSessions[0]
        if (!newSession) {
          return new Response(JSON.stringify({ error: 'Failed to create session' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        sessionId = newSession.id as string
      }

      // Generate booking reference
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let ref = 'GF-'
      for (let i = 0; i < 6; i++) {
        ref += chars[Math.floor(Math.random() * chars.length)]
      }

      const returnFlightId = body.returnFlightId || null

      const bookingRows = await sql`
        INSERT INTO bookings (session_id, flight_id, return_flight_id, booking_reference, cabin_class, total_price_cents, status)
        VALUES (${sessionId}, ${body.flightId}, ${returnFlightId}, ${ref}, ${body.cabinClass}, ${body.totalPriceCents}, 'confirmed')
        RETURNING id, booking_reference, status, created_at
      `

      const booking = bookingRows[0]
      if (!booking) {
        return new Response(JSON.stringify({ error: 'Failed to create booking' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // Insert passengers
      for (const p of body.passengers) {
        const dob = p.dateOfBirth || null
        const gender = p.gender || null
        const email = p.email || null
        const phone = p.phone || null
        await sql`
          INSERT INTO booking_passengers (booking_id, first_name, last_name, date_of_birth, gender, email, phone, passenger_type)
          VALUES (${booking.id}, ${p.firstName}, ${p.lastName}, ${dob}, ${gender}, ${email}, ${phone}, ${p.passengerType})
        `
      }

      return new Response(JSON.stringify({
        id: booking.id,
        bookingReference: booking.booking_reference,
        status: booking.status,
        createdAt: booking.created_at,
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (err) {
      console.error('Booking error:', err)
      return new Response(JSON.stringify({ error: 'Failed to create booking' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // GET - fetch flight details for booking page
  if (req.method === 'GET') {
    const flightId = url.searchParams.get('flightId')
    const cabinClass = url.searchParams.get('cabinClass') || 'economy'

    if (!flightId) {
      return new Response(JSON.stringify({ error: 'flightId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    try {
      const flights = await sql`
        SELECT
          f.id, f.flight_number, f.departure_time, f.arrival_time, f.duration_minutes,
          f.aircraft_type, f.has_wifi, f.has_power, f.has_entertainment, f.co2_kg,
          al.name AS airline_name, al.iata_code AS airline_code, al.logo_color,
          oa.iata_code AS origin_code, oa.name AS origin_name, oa.city AS origin_city,
          da.iata_code AS dest_code, da.name AS dest_name, da.city AS dest_city,
          p.base_price_cents, p.taxes_cents, p.total_price_cents, p.cabin_class,
          p.available_seats
        FROM flights f
        JOIN airlines al ON f.airline_id = al.id
        JOIN airports oa ON f.origin_airport_id = oa.id
        JOIN airports da ON f.destination_airport_id = da.id
        LEFT JOIN prices p ON p.flight_id = f.id AND p.cabin_class = ${cabinClass}
        WHERE f.id = ${flightId}
      `

      const flight = flights[0]
      if (!flight) {
        return new Response(JSON.stringify({ error: 'Flight not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      // Get legs
      const legs = await sql`
        SELECT
          fl.id, fl.leg_order, fl.departure_time, fl.arrival_time, fl.duration_minutes,
          fl.flight_number, fl.aircraft_type, fl.terminal_departure, fl.terminal_arrival,
          oa.iata_code AS origin_code, oa.name AS origin_name, oa.city AS origin_city,
          da.iata_code AS dest_code, da.name AS dest_name, da.city AS dest_city,
          al.name AS airline_name, al.iata_code AS airline_code
        FROM flight_legs fl
        JOIN airports oa ON fl.origin_airport_id = oa.id
        JOIN airports da ON fl.destination_airport_id = da.id
        LEFT JOIN airlines al ON fl.airline_id = al.id
        WHERE fl.flight_id = ${flightId}
        ORDER BY fl.leg_order
      `

      return new Response(JSON.stringify({ flight, legs }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (err) {
      console.error('Fetch flight error:', err)
      return new Response(JSON.stringify({ error: 'Failed to fetch flight details' }), {
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
