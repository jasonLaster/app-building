import type { Context } from '@netlify/functions';
import { getSql } from './db';

export default async function handler(req: Request, _context: Context) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.slice(7);
    const sql = getSql();

    const sessions = await sql`
      SELECT s.member_id FROM sessions s
      WHERE s.token = ${token} AND s.expires_at > NOW()
    `;
    const session = sessions[0];
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const memberId = session.member_id;
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    // pathParts: [".netlify", "functions", "notifications", "<id>", "<action>"]
    const funcIndex = pathParts.indexOf('notifications');
    const notificationId = funcIndex >= 0 ? pathParts[funcIndex + 1] || null : null;
    const action = funcIndex >= 0 ? pathParts[funcIndex + 2] || null : null;

    if (req.method === 'GET' && !notificationId) {
      const notifications = await sql`
        SELECT
          n.id,
          n.type,
          n.issue_id,
          n.message AS description,
          n.read,
          n.archived,
          n.created_at,
          t.identifier || '-' || i.number AS issue_identifier,
          i.title AS issue_title
        FROM notifications n
        LEFT JOIN issues i ON i.id = n.issue_id
        LEFT JOIN teams t ON t.id = i.team_id
        WHERE n.member_id = ${memberId} AND n.archived = false
        ORDER BY n.created_at DESC
      `;
      return new Response(JSON.stringify({ notifications }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'PUT' && notificationId && action === 'read') {
      await sql`
        UPDATE notifications SET read = true
        WHERE id = ${notificationId} AND member_id = ${memberId}
      `;
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'PUT' && notificationId && action === 'archive') {
      await sql`
        UPDATE notifications SET archived = true
        WHERE id = ${notificationId} AND member_id = ${memberId}
      `;
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Notifications error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
