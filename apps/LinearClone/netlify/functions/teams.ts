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
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const teamId = pathParts[2] || null;

    if (req.method === 'GET' && !teamId) {
      const teams = await sql`
        SELECT t.id, t.name, t.identifier, t.description,
          (SELECT COUNT(*)::int FROM team_members tm WHERE tm.team_id = t.id) AS member_count,
          (SELECT c.name FROM cycles c WHERE c.team_id = t.id AND c.status = 'active' LIMIT 1) AS active_cycle_name
        FROM teams t
        ORDER BY t.name ASC
      `;
      return new Response(JSON.stringify({ teams }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET' && teamId) {
      const teams = await sql`
        SELECT t.id, t.name, t.identifier, t.description
        FROM teams t WHERE t.id = ${teamId}
      `;
      const team = teams[0];
      if (!team) {
        return new Response(JSON.stringify({ error: 'Team not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const members = await sql`
        SELECT m.id, m.name, m.email
        FROM members m
        JOIN team_members tm ON tm.member_id = m.id
        WHERE tm.team_id = ${teamId}
        ORDER BY m.name ASC
      `;

      const allMembers = await sql`
        SELECT m.id, m.name, m.email
        FROM members m
        WHERE m.id NOT IN (
          SELECT tm.member_id FROM team_members tm WHERE tm.team_id = ${teamId}
        )
        ORDER BY m.name ASC
      `;

      return new Response(JSON.stringify({ team, members, availableMembers: allMembers }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { name, identifier, description } = body as { name: string; identifier: string; description?: string };

      if (!name?.trim()) {
        return new Response(JSON.stringify({ error: 'Name is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (!identifier?.trim()) {
        return new Response(JSON.stringify({ error: 'Identifier prefix is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const upperIdentifier = identifier.trim().toUpperCase();
      if (upperIdentifier.length < 2 || upperIdentifier.length > 5) {
        return new Response(JSON.stringify({ error: 'Identifier prefix must be 2-5 characters' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const existing = await sql`
        SELECT id FROM teams WHERE UPPER(identifier) = ${upperIdentifier}
      `;
      if (existing.length > 0) {
        return new Response(JSON.stringify({ error: `A team with prefix '${upperIdentifier}' already exists` }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const newTeams = await sql`
        INSERT INTO teams (name, identifier, description)
        VALUES (${name.trim()}, ${upperIdentifier}, ${description?.trim() || ''})
        RETURNING id, name, identifier, description
      `;
      const newTeam = newTeams[0];

      return new Response(JSON.stringify({ team: { ...newTeam, member_count: 0, active_cycle_name: null } }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'PUT' && teamId) {
      const body = await req.json();
      const { name, identifier, description } = body as { name?: string; identifier?: string; description?: string };

      if (name !== undefined && !name.trim()) {
        return new Response(JSON.stringify({ error: 'Team name cannot be empty' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (identifier !== undefined) {
        const upperIdentifier = identifier.trim().toUpperCase();
        if (upperIdentifier.length < 2 || upperIdentifier.length > 5) {
          return new Response(JSON.stringify({ error: 'Identifier prefix must be 2-5 characters' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const existing = await sql`
          SELECT id FROM teams WHERE UPPER(identifier) = ${upperIdentifier} AND id != ${teamId}
        `;
        if (existing.length > 0) {
          return new Response(JSON.stringify({ error: `A team with prefix '${upperIdentifier}' already exists` }), {
            status: 409,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

      const nameVal = name !== undefined ? name.trim() : null;
      const identVal = identifier !== undefined ? identifier.trim().toUpperCase() : null;
      const descVal = description !== undefined ? description : null;
      const descProvided = description !== undefined;

      const updatedTeams = await sql`
        UPDATE teams
        SET
          name = CASE WHEN ${nameVal} IS NOT NULL THEN ${nameVal} ELSE name END,
          identifier = CASE WHEN ${identVal} IS NOT NULL THEN ${identVal} ELSE identifier END,
          description = CASE WHEN ${descProvided} THEN ${descVal} ELSE description END
        WHERE id = ${teamId}
        RETURNING id, name, identifier, description
      `;
      const updated = updatedTeams[0];
      if (!updated) {
        return new Response(JSON.stringify({ error: 'Team not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ team: updated }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'DELETE' && teamId) {
      await sql`DELETE FROM team_members WHERE team_id = ${teamId}`;
      await sql`UPDATE issues SET cycle_id = NULL WHERE cycle_id IN (SELECT id FROM cycles WHERE team_id = ${teamId})`;
      await sql`UPDATE issues SET team_id = NULL WHERE team_id = ${teamId}`;
      await sql`DELETE FROM cycles WHERE team_id = ${teamId}`;
      await sql`DELETE FROM teams WHERE id = ${teamId}`;

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
    console.error('Teams error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
