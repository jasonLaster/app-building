import type { Context } from '@netlify/functions';
import { getSql } from './db';
import crypto from 'crypto';

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export default async function handler(req: Request, _context: Context) {
  const sql = getSql();

  // Authenticate
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = authHeader.slice(7);
  const sessions = await sql`
    SELECT s.member_id, m.name, m.email, m.role
    FROM sessions s
    JOIN members m ON m.id = s.member_id
    WHERE s.token = ${token} AND s.expires_at > NOW()
  `;
  const session = sessions[0];
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const currentUserId = session.member_id as string;

  try {
    // GET - list all members with their teams
    if (req.method === 'GET') {
      const members = await sql`
        SELECT m.id, m.name, m.email, m.role
        FROM members m
        ORDER BY m.name ASC
      `;

      const teamMembers = await sql`
        SELECT tm.member_id, t.id AS team_id, t.name AS team_name
        FROM team_members tm
        JOIN teams t ON t.id = tm.team_id
        ORDER BY t.name ASC
      `;

      const membersWithTeams = members.map((m) => ({
        ...m,
        teams: teamMembers
          .filter((tm) => tm.member_id === m.id)
          .map((tm) => ({ id: tm.team_id, name: tm.team_name })),
      }));

      return new Response(JSON.stringify({ members: membersWithTeams, currentUserId }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST - invite a new member
    if (req.method === 'POST') {
      const { email } = await req.json();

      if (!email || typeof email !== 'string') {
        return new Response(JSON.stringify({ error: 'Email is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return new Response(JSON.stringify({ error: 'Please enter a valid email address' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const existing = await sql`SELECT id FROM members WHERE email = ${email}`;
      if (existing.length > 0) {
        return new Response(JSON.stringify({ error: 'This email is already a member of the workspace' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const memberId = crypto.randomUUID();
      const name = email.split('@')[0] || 'New Member';
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = hashPassword('temporary123', salt);

      await sql`
        INSERT INTO members (id, name, email, password_hash, password_salt, role)
        VALUES (${memberId}, ${name}, ${email}, ${passwordHash}, ${salt}, 'member')
      `;

      const member = {
        id: memberId,
        name,
        email,
        role: 'member',
        teams: [],
      };

      return new Response(JSON.stringify({ member }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // PUT - update member role
    if (req.method === 'PUT') {
      const url = new URL(req.url);
      const segments = url.pathname.split('/').filter(Boolean);
      const memberId = segments[segments.length - 1];

      if (!memberId) {
        return new Response(JSON.stringify({ error: 'Member ID required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const { role } = await req.json();

      if (!role || !['admin', 'member'].includes(role)) {
        return new Response(JSON.stringify({ error: 'Valid role is required (admin or member)' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Cannot demote the last admin
      if (role === 'member') {
        const admins = await sql`SELECT id FROM members WHERE role = 'admin'`;
        const targetIsAdmin = admins.some((a) => a.id === memberId);
        if (targetIsAdmin && admins.length <= 1) {
          return new Response(JSON.stringify({ error: 'Cannot demote the last Admin' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }

      await sql`UPDATE members SET role = ${role} WHERE id = ${memberId}`;

      return new Response(JSON.stringify({ success: true, memberId, role }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // DELETE - remove a member
    if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const segments = url.pathname.split('/').filter(Boolean);
      const memberId = segments[segments.length - 1];

      if (!memberId) {
        return new Response(JSON.stringify({ error: 'Member ID required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (memberId === currentUserId) {
        return new Response(JSON.stringify({ error: 'Cannot remove yourself' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Remove from team_members first (FK dependency)
      await sql`DELETE FROM team_members WHERE member_id = ${memberId}`;
      // Remove sessions
      await sql`DELETE FROM sessions WHERE member_id = ${memberId}`;
      // Remove the member
      await sql`DELETE FROM members WHERE id = ${memberId}`;

      return new Response(JSON.stringify({ success: true, memberId }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Members endpoint error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
