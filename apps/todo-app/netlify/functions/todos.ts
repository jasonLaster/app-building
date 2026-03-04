import { getSql } from './db.js'

export default async function handler(req: Request) {
  const sql = getSql()
  const url = new URL(req.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const todoId = segments[3]

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }

  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM todos ORDER BY created_at DESC`
      return new Response(JSON.stringify(rows), { status: 200, headers })
    }

    if (req.method === 'POST') {
      const body = await req.json()
      const title = body.title?.trim()
      if (!title) {
        return new Response(JSON.stringify({ error: 'Title is required' }), { status: 400, headers })
      }
      const priority = body.priority || 'medium'
      const dueDate = body.due_date || null
      const notes = body.notes || null

      const rows = await sql`
        INSERT INTO todos (title, priority, due_date, notes)
        VALUES (${title}, ${priority}, ${dueDate || null}, ${notes || null})
        RETURNING *
      `
      return new Response(JSON.stringify(rows[0]), { status: 201, headers })
    }

    if (req.method === 'PUT') {
      if (!todoId) {
        return new Response(JSON.stringify({ error: 'Todo ID required' }), { status: 400, headers })
      }
      const body = await req.json()
      const title = body.title !== undefined ? body.title : undefined
      const completed = body.completed !== undefined ? body.completed : undefined
      const priority = body.priority !== undefined ? body.priority : undefined
      const dueDate = body.due_date !== undefined ? (body.due_date || null) : undefined
      const notes = body.notes !== undefined ? (body.notes || null) : undefined

      let rows;
      if (title !== undefined && completed !== undefined && priority !== undefined && dueDate !== undefined && notes !== undefined) {
        rows = await sql`
          UPDATE todos SET title = ${title}, completed = ${completed}, priority = ${priority},
          due_date = ${dueDate}, notes = ${notes}, updated_at = NOW()
          WHERE id = ${todoId} RETURNING *
        `
      } else if (completed !== undefined && title === undefined && priority === undefined && dueDate === undefined && notes === undefined) {
        rows = await sql`
          UPDATE todos SET completed = ${completed}, updated_at = NOW()
          WHERE id = ${todoId} RETURNING *
        `
      } else {
        const t = title !== undefined ? title : null
        const c = completed !== undefined ? completed : null
        const p = priority !== undefined ? priority : null
        const d = dueDate !== undefined ? dueDate : null
        const n = notes !== undefined ? notes : null
        rows = await sql`
          UPDATE todos SET
            title = COALESCE(${t}, title),
            completed = COALESCE(${c}, completed),
            priority = COALESCE(${p}, priority),
            due_date = CASE WHEN ${dueDate !== undefined} THEN ${d}::date ELSE due_date END,
            notes = CASE WHEN ${notes !== undefined} THEN ${n} ELSE notes END,
            updated_at = NOW()
          WHERE id = ${todoId} RETURNING *
        `
      }

      if (!rows || rows.length === 0) {
        return new Response(JSON.stringify({ error: 'Todo not found' }), { status: 404, headers })
      }
      return new Response(JSON.stringify(rows[0]), { status: 200, headers })
    }

    if (req.method === 'DELETE') {
      const completedParam = url.searchParams.get('completed')
      if (completedParam === 'true') {
        const rows = await sql`DELETE FROM todos WHERE completed = true RETURNING *`
        return new Response(JSON.stringify(rows), { status: 200, headers })
      }
      if (!todoId) {
        return new Response(JSON.stringify({ error: 'Todo ID required' }), { status: 400, headers })
      }
      const rows = await sql`DELETE FROM todos WHERE id = ${todoId} RETURNING *`
      if (rows.length === 0) {
        return new Response(JSON.stringify({ error: 'Todo not found' }), { status: 404, headers })
      }
      return new Response(JSON.stringify(rows[0]), { status: 200, headers })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers })
  } catch (error) {
    console.error('Todo API error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers })
  }
}

