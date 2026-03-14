import type { Context } from '@netlify/functions'
import { getSql } from './db.js'

export default async (request: Request, _context: Context) => {
  const sql = getSql()
  const url = new URL(request.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const userIdx = segments.indexOf('users')
  const userId = userIdx >= 0 ? segments[userIdx + 1] : undefined
  const action = userIdx >= 0 ? segments[userIdx + 2] : undefined

  const headers = { 'Content-Type': 'application/json' }

  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400, headers })
  }

  try {
  if (request.method === 'GET') {
    const result = await sql`SELECT * FROM users WHERE id = ${userId}`
    const user = result[0]
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers })
    }
    return new Response(JSON.stringify(user), { status: 200, headers })
  }

  if (request.method === 'POST' && action === 'become-host') {
    const result = await sql`
      UPDATE users SET is_host = true WHERE id = ${userId} RETURNING *
    `
    const user = result[0]
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers })
    }
    return new Response(JSON.stringify(user), { status: 200, headers })
  }

  if (request.method === 'PUT') {
    const body = await request.json() as {
      name?: string
      bio?: string | null
      phone?: string | null
      avatar_url?: string | null
    }

    const existing = await sql`SELECT * FROM users WHERE id = ${userId}`
    const existingUser = existing[0]
    if (!existingUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers })
    }

    const eu = existingUser as Record<string, unknown>
    const result = await sql`
      UPDATE users SET
        name = ${body.name !== undefined ? body.name : eu.name as string},
        bio = ${body.bio !== undefined ? (body.bio || null) : eu.bio as string | null},
        phone = ${body.phone !== undefined ? (body.phone || null) : eu.phone as string | null},
        avatar_url = ${body.avatar_url !== undefined ? (body.avatar_url || null) : eu.avatar_url as string | null}
      WHERE id = ${userId}
      RETURNING *
    `
    const user = result[0]
    return new Response(JSON.stringify(user), { status: 200, headers })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers })
  }
}
