import type { Context } from '@netlify/functions'
import { getSql } from './db.js'

export default async (request: Request, _context: Context) => {
  const sql = getSql()
  const url = new URL(request.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const imageId = segments[3]
  const headers = { 'Content-Type': 'application/json' }

  if (request.method === 'POST') {
    const body = await request.json() as {
      property_id: string
      url: string
      caption?: string
      display_order?: number
    }

    if (!body.property_id || !body.url) {
      return new Response(JSON.stringify({ error: 'property_id and url are required' }), { status: 400, headers })
    }

    const result = await sql`
      INSERT INTO property_images (id, property_id, url, caption, display_order)
      VALUES (gen_random_uuid(), ${body.property_id}, ${body.url}, ${body.caption || null}, ${body.display_order || 0})
      RETURNING *
    `
    const image = result[0]
    return new Response(JSON.stringify(image), { status: 201, headers })
  }

  if (request.method === 'DELETE' && imageId) {
    const result = await sql`
      DELETE FROM property_images WHERE id = ${imageId} RETURNING *
    `
    const image = result[0]
    if (!image) {
      return new Response(JSON.stringify({ error: 'Image not found' }), { status: 404, headers })
    }
    return new Response(JSON.stringify(image), { status: 200, headers })
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })
}
