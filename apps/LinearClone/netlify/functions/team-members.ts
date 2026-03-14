import type { Context } from '@netlify/functions';
import { getSql } from './db';

async function authenticate(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const sql = getSql();
  const sessions = await sql`
    SELECT s.member_id FROM sessions s
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  const session = sessions[0];
  return session ? session.member_id as string : null;
}

export default async function handler(req: Request, _context: Context) {
  try {
    const memberId = await authenticate(req);
    if (!memberId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sql = getSql();

    if (req.method === 'POST') {
      const body = await req.json();
      const { teamId, memberIdToAdd } = body as { teamId: string; memberIdToAdd: string };

      if (!teamId || !memberIdToAdd) {
        return new Response(JSON.stringify({ error: 'teamId and memberIdToAdd are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const existing = await sql`
        SELECT 1 FROM team_members WHERE team_id = ${teamId} AND member_id = ${memberIdToAdd}
      `;
      if (existing.length > 0) {
        return new Response(JSON.stringify({ error: 'Member is already on this team' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      await sql`
        INSERT INTO team_members (team_id, member_id)
        VALUES (${teamId}, ${memberIdToAdd})
      `;

      const addedMembers = await sql`
        SELECT m.id, m.name, m.email
        FROM members m WHERE m.id = ${memberIdToAdd}
      `;
      const addedMember = addedMembers[0];

      return new Response(JSON.stringify({ member: addedMember }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'DELETE') {
      const body = await req.json();
      const { teamId, memberIdToRemove } = body as { teamId: string; memberIdToRemove: string };

      if (!teamId || !memberIdToRemove) {
        return new Response(JSON.stringify({ error: 'teamId and memberIdToRemove are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      await sql`
        DELETE FROM team_members WHERE team_id = ${teamId} AND member_id = ${memberIdToRemove}
      `;

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Team members error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
