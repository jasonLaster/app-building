import type { Context } from '@netlify/functions';
import { getSql } from './db';

async function authenticate(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7);
  const sql = getSql();
  const sessions = await sql`
    SELECT s.member_id FROM sessions s
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  const session = sessions[0];
  if (!session) return null;
  return { memberId: session.member_id as string, sql };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async function handler(req: Request, _context: Context) {
  try {
    const auth = await authenticate(req);
    if (!auth) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
    const { sql } = auth;

    if (req.method === 'GET') {
      const labels = await sql`
        SELECT l.id, l.name, l.color,
          COALESCE(ic.cnt, 0)::int AS issue_count
        FROM labels l
        LEFT JOIN (
          SELECT label_id, COUNT(*)::int AS cnt
          FROM issue_labels
          GROUP BY label_id
        ) ic ON ic.label_id = l.id
        ORDER BY l.name ASC
      `;
      return jsonResponse({ labels });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { name, color } = body as { name: string; color: string };

      if (!name?.trim()) {
        return jsonResponse({ error: 'Label name is required' }, 400);
      }

      const existing = await sql`
        SELECT id FROM labels WHERE LOWER(name) = LOWER(${name.trim()})
      `;
      if (existing.length > 0) {
        return jsonResponse({ error: 'A label with this name already exists' }, 409);
      }

      const rows = await sql`
        INSERT INTO labels (name, color)
        VALUES (${name.trim()}, ${color})
        RETURNING id, name, color
      `;
      const label = rows[0];
      if (!label) {
        return jsonResponse({ error: 'Failed to create label' }, 500);
      }
      return jsonResponse({ label: { ...label, issue_count: 0 } }, 201);
    }

    if (req.method === 'PUT') {
      const body = await req.json();
      const { id, name, color } = body as { id: string; name: string; color: string };

      if (!id) {
        return jsonResponse({ error: 'Label id is required' }, 400);
      }
      if (!name?.trim()) {
        return jsonResponse({ error: 'Label name is required' }, 400);
      }

      const existing = await sql`
        SELECT id FROM labels WHERE LOWER(name) = LOWER(${name.trim()}) AND id != ${id}
      `;
      if (existing.length > 0) {
        return jsonResponse({ error: 'A label with this name already exists' }, 409);
      }

      const rows = await sql`
        UPDATE labels SET name = ${name.trim()}, color = ${color}
        WHERE id = ${id}
        RETURNING id, name, color
      `;
      const updated = rows[0];
      if (!updated) {
        return jsonResponse({ error: 'Label not found' }, 404);
      }

      const countRows = await sql`
        SELECT COUNT(*)::int AS cnt FROM issue_labels WHERE label_id = ${id}
      `;
      const countRow = countRows[0];
      const issue_count = countRow ? countRow.cnt : 0;

      return jsonResponse({ label: { ...updated, issue_count } });
    }

    if (req.method === 'DELETE') {
      const body = await req.json();
      const { id } = body as { id: string };

      if (!id) {
        return jsonResponse({ error: 'Label id is required' }, 400);
      }

      await sql`DELETE FROM issue_labels WHERE label_id = ${id}`;
      await sql`DELETE FROM labels WHERE id = ${id}`;

      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: 'Method not allowed' }, 405);
  } catch (err) {
    console.error('Labels error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}
