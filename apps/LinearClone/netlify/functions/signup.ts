import type { Context } from '@netlify/functions';
import { getSql } from './db';
import crypto from 'crypto';

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function generateToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

export default async function handler(req: Request, _context: Context) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: 'Name, email, and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (password.length < 8) {
      return new Response(JSON.stringify({ error: 'Password must be at least 8 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sql = getSql();

    const existing = await sql`SELECT id FROM members WHERE email = ${email}`;
    if (existing.length > 0) {
      return new Response(JSON.stringify({ error: 'An account with this email already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);
    const memberId = crypto.randomUUID();

    // Create the member
    await sql`
      INSERT INTO members (id, name, email, password_hash, password_salt, role)
      VALUES (${memberId}, ${name}, ${email}, ${passwordHash}, ${salt}, 'admin')
    `;

    // Create a default workspace if none exists
    const workspaces = await sql`SELECT id FROM workspaces LIMIT 1`;
    if (workspaces.length === 0) {
      const workspaceId = crypto.randomUUID();
      await sql`INSERT INTO workspaces (id, name) VALUES (${workspaceId}, ${name + "'s Workspace"})`;
    }

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await sql`INSERT INTO sessions (token, member_id, expires_at) VALUES (${token}, ${memberId}, ${expiresAt})`;

    return new Response(JSON.stringify({
      user: { id: memberId, name, email },
      token,
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Signup error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
