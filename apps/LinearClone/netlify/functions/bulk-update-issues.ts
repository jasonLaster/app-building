import type { Context } from '@netlify/functions';
import { getSql } from './db';

export default async function handler(req: Request, _context: Context) {
  if (req.method !== 'PUT') {
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

    const { issueIds, status, priority, assigneeId, labelId } = await req.json();

    if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
      return new Response(JSON.stringify({ error: 'issueIds array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (status) {
      const validStatuses = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return new Response(JSON.stringify({ error: 'Invalid status' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      await sql`
        UPDATE issues SET status = ${status}, updated_at = NOW()
        WHERE id = ANY(${issueIds})
      `;
    }

    if (priority) {
      const validPriorities = ['urgent', 'high', 'medium', 'low', 'none'];
      if (!validPriorities.includes(priority)) {
        return new Response(JSON.stringify({ error: 'Invalid priority' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      await sql`
        UPDATE issues SET priority = ${priority}, updated_at = NOW()
        WHERE id = ANY(${issueIds})
      `;
    }

    if (assigneeId !== undefined) {
      const assignee = assigneeId || null;
      await sql`
        UPDATE issues SET assignee_id = ${assignee}, updated_at = NOW()
        WHERE id = ANY(${issueIds})
      `;
    }

    if (labelId) {
      for (const issueId of issueIds) {
        const existing = await sql`
          SELECT 1 FROM issue_labels WHERE issue_id = ${issueId} AND label_id = ${labelId}
        `;
        if (existing.length === 0) {
          await sql`
            INSERT INTO issue_labels (issue_id, label_id) VALUES (${issueId}, ${labelId})
          `;
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Bulk update issues error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
