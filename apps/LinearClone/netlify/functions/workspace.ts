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

    if (req.method === 'GET') {
      const workspaces = await sql`
        SELECT id, name, default_team_id FROM workspaces LIMIT 1
      `;
      const workspace = workspaces[0];

      if (!workspace) {
        return new Response(JSON.stringify({ error: 'No workspace found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ workspace }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'PUT') {
      const body = await req.json();
      const { name, default_team_id } = body;

      const workspaces = await sql`SELECT id FROM workspaces LIMIT 1`;
      const workspace = workspaces[0];
      if (!workspace) {
        return new Response(JSON.stringify({ error: 'No workspace found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (name !== undefined) {
        if (!name || !name.trim()) {
          return new Response(JSON.stringify({ error: 'Workspace name is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        await sql`UPDATE workspaces SET name = ${name.trim()} WHERE id = ${workspace.id}`;
      }

      if (default_team_id !== undefined) {
        const teamId = default_team_id || null;
        await sql`UPDATE workspaces SET default_team_id = ${teamId} WHERE id = ${workspace.id}`;
      }

      const updated = await sql`
        SELECT id, name, default_team_id FROM workspaces WHERE id = ${workspace.id}
      `;
      const updatedWorkspace = updated[0];

      return new Response(JSON.stringify({ workspace: updatedWorkspace }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Workspace error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
