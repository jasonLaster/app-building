import type { Context } from '@netlify/functions'
import { getSql } from './db.js'

export default async (request: Request, _context: Context) => {
  const sql = getSql()

  if (request.method === 'POST') {
    const body = await request.json()
    const { email, name } = body

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (name) {
      // Register mode
      const existing = await sql`SELECT * FROM users WHERE email = ${email}`
      if (existing.length > 0) {
        return new Response(
          JSON.stringify({ error: 'An account with this email already exists' }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        )
      }

      const result = await sql`
        INSERT INTO users (id, email, name, created_at)
        VALUES (gen_random_uuid(), ${email}, ${name}, now())
        RETURNING *
      `
      const user = result[0]
      if (!user) {
        return new Response(JSON.stringify({ error: 'Failed to create user' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      return new Response(JSON.stringify(user), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      })
    } else {
      // Login mode
      const result = await sql`SELECT * FROM users WHERE email = ${email}`
      const user = result[0]
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'No account found with this email' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        )
      }
      return new Response(JSON.stringify(user), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  })
}
