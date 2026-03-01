import type { Context } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';

function getSql(req: Request) {
  const cookies = req.headers.get('cookie') || '';
  const match = cookies.match(/test-worker=(\d+)/);
  if (match) {
    const workerUrl = process.env[`DATABASE_URL_W${match[1]}`];
    if (workerUrl) return neon(workerUrl);
  }
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set');
  return neon(url);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async function handler(req: Request, _context: Context) {
  const sql = getSql(req);
  const url = new URL(req.url);
  const segments = url.pathname.split('/').filter(Boolean);
  // segments: ["", ".netlify", "functions", "todos", ...rest]
  // After filtering empty: [".netlify", "functions", "todos", ...rest]
  const resourceId = segments[3]; // index 3 is after function name at index 2

  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM todos ORDER BY created_at DESC`;
      return json(rows);
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const text = (body.text || '').trim();
      if (!text) {
        return json({ error: 'Text is required' }, 400);
      }
      const rows = await sql`
        INSERT INTO todos (text) VALUES (${text}) RETURNING *
      `;
      return json(rows[0], 201);
    }

    if (req.method === 'PUT' && resourceId) {
      const body = await req.json();
      const rows = await sql`
        UPDATE todos
        SET text = COALESCE(${body.text !== undefined ? body.text : null}, text),
            completed = COALESCE(${body.completed !== undefined ? body.completed : null}, completed)
        WHERE id = ${resourceId}
        RETURNING *
      `;
      if (rows.length === 0) return json({ error: 'Not found' }, 404);
      return json(rows[0]);
    }

    if (req.method === 'DELETE' && resourceId === 'completed') {
      await sql`DELETE FROM todos WHERE completed = true`;
      return json({ success: true });
    }

    if (req.method === 'DELETE' && resourceId) {
      const rows = await sql`DELETE FROM todos WHERE id = ${resourceId} RETURNING *`;
      if (rows.length === 0) return json({ error: 'Not found' }, 404);
      return json({ success: true });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (err) {
    console.error('todos function error:', err);
    return json({ error: 'Internal server error' }, 500);
  }
}
