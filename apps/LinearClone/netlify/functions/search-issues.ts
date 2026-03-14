import type { Context } from '@netlify/functions';
import { getSql } from './db';

export default async function handler(req: Request, _context: Context) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

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

    const url = new URL(req.url);
    const query = url.searchParams.get('q') || '';
    const teamId = url.searchParams.get('teamId') || '';

    let issues;
    if (query) {
      issues = await sql`
        SELECT DISTINCT ON (i.id) i.id, i.title, i.number, t.identifier AS team_identifier
        FROM issues i
        JOIN teams t ON t.id = i.team_id
        WHERE (i.title ILIKE ${'%' + query + '%'} OR CONCAT(t.identifier, '-', i.number) ILIKE ${'%' + query + '%'})
        ${teamId ? sql`AND i.team_id = ${teamId}` : sql``}
        ORDER BY i.id, i.created_at DESC
        LIMIT 20
      `;
    } else if (teamId) {
      issues = await sql`
        SELECT i.id, i.title, i.number, t.identifier AS team_identifier
        FROM issues i
        JOIN teams t ON t.id = i.team_id
        WHERE i.team_id = ${teamId}
        ORDER BY i.created_at DESC
        LIMIT 20
      `;
    } else {
      issues = await sql`
        SELECT i.id, i.title, i.number, t.identifier AS team_identifier
        FROM issues i
        JOIN teams t ON t.id = i.team_id
        ORDER BY i.created_at DESC
        LIMIT 20
      `;
    }

    const results = issues.map((i) => ({
      id: i.id,
      title: i.title,
      identifier: `${i.team_identifier}-${i.number}`,
    }));

    return new Response(JSON.stringify({ issues: results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Search issues error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
