import type { Context } from '@netlify/functions'
import { getSql } from './db.js'

export default async (request: Request, _context: Context) => {
  const sql = getSql()
  const url = new URL(request.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const headers = { 'Content-Type': 'application/json' }

  if (request.method === 'GET') {
    const userId = url.searchParams.get('user_id')
    if (!userId) {
      return new Response(JSON.stringify({ error: 'user_id is required' }), { status: 400, headers })
    }
    const favorites = await sql`
      SELECT f.property_id, f.created_at
      FROM favorites f
      WHERE f.user_id = ${userId}
      ORDER BY f.created_at DESC
    `
    return new Response(JSON.stringify(favorites), { status: 200, headers })
  }

  if (request.method === 'POST') {
    const body = await request.json()
    const { user_id, property_id } = body
    if (!user_id || !property_id) {
      return new Response(JSON.stringify({ error: 'user_id and property_id are required' }), { status: 400, headers })
    }
    await sql`
      INSERT INTO favorites (user_id, property_id, created_at)
      VALUES (${user_id}, ${property_id}, now())
      ON CONFLICT (user_id, property_id) DO NOTHING
    `
    return new Response(JSON.stringify({ success: true }), { status: 201, headers })
  }

  if (request.method === 'DELETE') {
    const propertyId = segments[2] // /api/favorites/:propertyId
    const userId = url.searchParams.get('user_id')
    if (!propertyId || !userId) {
      return new Response(JSON.stringify({ error: 'propertyId and user_id are required' }), { status: 400, headers })
    }
    await sql`
      DELETE FROM favorites WHERE user_id = ${userId} AND property_id = ${propertyId}
    `
    return new Response(JSON.stringify({ success: true }), { status: 200, headers })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })
}
