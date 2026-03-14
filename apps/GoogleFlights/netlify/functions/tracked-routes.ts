import type { Context } from '@netlify/functions'
import { getSql } from './db.js'

export default async (request: Request, _context: Context) => {
  const sql = getSql()
  const url = new URL(request.url)

  if (request.method === 'GET') {
    const session = url.searchParams.get('session') || ''
    const origin = url.searchParams.get('origin') || ''
    const destination = url.searchParams.get('destination') || ''

    if (!session) {
      return Response.json({ error: 'Missing session' }, { status: 400 })
    }

    // Check if a specific route is tracked
    if (origin && destination) {
      const result = await sql`
        SELECT tr.id
        FROM tracked_routes tr
        JOIN sessions s ON tr.session_id = s.id
        JOIN airports oa ON tr.origin_airport_id = oa.id
        JOIN airports da ON tr.destination_airport_id = da.id
        WHERE s.session_token = ${session}
          AND oa.iata_code = ${origin}
          AND da.iata_code = ${destination}
        LIMIT 1
      `
      return Response.json({ tracked: result.length > 0, id: result[0]?.id || null })
    }

    // Get all tracked routes with lowest current price and trend
    const routes = await sql`
      SELECT tr.id, tr.departure_date_start, tr.departure_date_end, tr.cabin_class, tr.created_at,
             oa.iata_code as origin_code, oa.city as origin_city,
             da.iata_code as dest_code, da.city as dest_city,
             tr.initial_price_cents,
             (
               SELECT MIN(p.total_price_cents)
               FROM flights f2
               JOIN prices p ON p.flight_id = f2.id AND p.cabin_class = tr.cabin_class
               WHERE f2.origin_airport_id = tr.origin_airport_id
                 AND f2.destination_airport_id = tr.destination_airport_id
             ) as lowest_price_cents
      FROM tracked_routes tr
      JOIN sessions s ON tr.session_id = s.id
      JOIN airports oa ON tr.origin_airport_id = oa.id
      JOIN airports da ON tr.destination_airport_id = da.id
      WHERE s.session_token = ${session}
      ORDER BY tr.created_at DESC
    `
    const enriched = routes.map((r: Record<string, unknown>) => {
      const lowest = r.lowest_price_cents as number | null
      const initial = r.initial_price_cents as number | null
      let price_trend_percent: number | null = null
      if (initial && lowest && initial > 0) {
        price_trend_percent = Math.round(((lowest - initial) / initial) * 100)
      }
      return { ...r, price_trend_percent }
    })
    return Response.json(enriched)
  }

  if (request.method === 'POST') {
    const body = await request.json() as {
      sessionToken: string
      originCode: string
      destCode: string
      departureDateStart?: string
      departureDateEnd?: string
      cabinClass?: string
    }

    // Find or create session
    const sessions = await sql`
      SELECT id FROM sessions WHERE session_token = ${body.sessionToken}
    `
    let sessionId: string
    if (sessions[0]) {
      sessionId = sessions[0].id as string
    } else {
      const newSession = await sql`
        INSERT INTO sessions (id, session_token) VALUES (gen_random_uuid(), ${body.sessionToken})
        RETURNING id
      `
      sessionId = newSession[0]!.id as string
    }

    const origins = await sql`SELECT id FROM airports WHERE iata_code = ${body.originCode}`
    const dests = await sql`SELECT id FROM airports WHERE iata_code = ${body.destCode}`
    const originId = origins[0]?.id as string
    const destId = dests[0]?.id as string

    if (!originId || !destId) {
      return Response.json({ error: 'Airport not found' }, { status: 400 })
    }

    const cabinClass = body.cabinClass || 'economy'
    // Compute initial lowest price at tracking time
    const priceRows = await sql`
      SELECT MIN(p.total_price_cents) as lowest
      FROM flights f
      JOIN prices p ON p.flight_id = f.id AND p.cabin_class = ${cabinClass}
      WHERE f.origin_airport_id = ${originId}
        AND f.destination_airport_id = ${destId}
    `
    const initialPrice = priceRows[0]?.lowest as number | null

    await sql`
      INSERT INTO tracked_routes (id, session_id, origin_airport_id, destination_airport_id,
        departure_date_start, departure_date_end, cabin_class, initial_price_cents)
      VALUES (gen_random_uuid(), ${sessionId}, ${originId}, ${destId},
        ${body.departureDateStart || null}, ${body.departureDateEnd || null},
        ${cabinClass}, ${initialPrice})
    `

    return Response.json({ success: true })
  }

  if (request.method === 'DELETE') {
    const body = await request.json() as {
      sessionToken: string
      originCode?: string
      destCode?: string
      id?: string
    }

    if (body.id) {
      await sql`
        DELETE FROM tracked_routes
        WHERE id = ${body.id}
          AND session_id IN (SELECT id FROM sessions WHERE session_token = ${body.sessionToken})
      `
    } else if (body.originCode && body.destCode) {
      await sql`
        DELETE FROM tracked_routes
        WHERE session_id IN (SELECT id FROM sessions WHERE session_token = ${body.sessionToken})
          AND origin_airport_id IN (SELECT id FROM airports WHERE iata_code = ${body.originCode})
          AND destination_airport_id IN (SELECT id FROM airports WHERE iata_code = ${body.destCode})
      `
    }

    return Response.json({ success: true })
  }

  return Response.json({ error: 'Method not allowed' }, { status: 405 })
}
