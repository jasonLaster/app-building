import type { Context } from '@netlify/functions';
import { getSql } from './db';

export default async function handler(req: Request, _context: Context) {
  if (req.method !== 'POST') {
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

    const { issueId, content } = await req.json();

    if (!issueId || !content) {
      return new Response(JSON.stringify({ error: 'issueId and content are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Insert the comment
    const insertResult = await sql`
      INSERT INTO comments (issue_id, member_id, content, created_at)
      VALUES (${issueId}, ${session.member_id}, ${content}, NOW())
      RETURNING id, created_at
    `;
    const newComment = insertResult[0];
    if (!newComment) {
      return new Response(JSON.stringify({ error: 'Failed to create comment' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create activity entry
    await sql`
      INSERT INTO activity (issue_id, member_id, action, created_at)
      VALUES (${issueId}, ${session.member_id}, 'added a comment', NOW())
    `;

    // Update issue updated_at
    await sql`UPDATE issues SET updated_at = NOW() WHERE id = ${issueId}`;

    // Get the commenter info
    const memberRows = await sql`SELECT name, email FROM members WHERE id = ${session.member_id}`;
    const member = memberRows[0];

    // Create notification for issue assignee (if different from commenter)
    const issueRows = await sql`
      SELECT i.assignee_id, i.title, i.number, t.identifier
      FROM issues i JOIN teams t ON t.id = i.team_id
      WHERE i.id = ${issueId}
    `;
    const issue = issueRows[0];
    if (issue && issue.assignee_id && issue.assignee_id !== session.member_id) {
      const commenterName = member ? String(member.name) : 'Someone';
      const identifier = `${issue.identifier}-${issue.number}`;
      await sql`
        INSERT INTO notifications (member_id, type, message, issue_id, created_at)
        VALUES (${issue.assignee_id}, 'comment', ${`${commenterName} commented on ${identifier}: ${issue.title}`}, ${issueId}, NOW())
      `;
    }

    return new Response(JSON.stringify({
      comment: {
        id: newComment.id,
        content,
        createdAt: newComment.created_at,
        memberId: session.member_id,
        memberName: member ? String(member.name) : null,
        memberEmail: member ? String(member.email) : null,
      },
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Add comment error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
