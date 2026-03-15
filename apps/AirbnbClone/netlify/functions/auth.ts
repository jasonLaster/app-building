import type { Context } from '@netlify/functions'
import { getSql } from './db.js'

export default async (request: Request, _context: Context) => {
  const sql = getSql()
  const headers = { 'Content-Type': 'application/json' }

  try {
    if (request.method === 'POST') {
      const body = await request.json()
      const { email, name } = body

      if (!email) {
        return new Response(JSON.stringify({ error: 'Email is required' }), {
          status: 400,
          headers,
        })
      }

      if (name) {
        // Register mode
        const existing = await sql`SELECT * FROM users WHERE email = ${email}`
        if (existing.length > 0) {
          return new Response(
            JSON.stringify({ error: 'An account with this email already exists' }),
            { status: 409, headers }
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
            headers,
          })
        }
        return new Response(JSON.stringify(user), {
          status: 201,
          headers,
        })
      } else {
        // Login mode
        const result = await sql`SELECT * FROM users WHERE email = ${email}`
        const user = result[0]
        if (!user) {
          return new Response(
            JSON.stringify({ error: 'No account found with this email' }),
            { status: 404, headers }
          )
        }
        return new Response(JSON.stringify(user), {
          status: 200,
          headers,
        })
      }
    }

    if (request.method === 'DELETE') {
      // Delete all non-seed users (for test cleanup)
      const seedIds = [
        'a1111111-1111-1111-1111-111111111111',
        'a2222222-2222-2222-2222-222222222222',
        'a3333333-3333-3333-3333-333333333333',
        'a4444444-4444-4444-4444-444444444444',
      ]
      await sql`DELETE FROM users WHERE id != ALL(${seedIds})`
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers,
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers,
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers,
    })
  }
}
