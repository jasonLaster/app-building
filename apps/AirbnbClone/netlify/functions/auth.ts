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
