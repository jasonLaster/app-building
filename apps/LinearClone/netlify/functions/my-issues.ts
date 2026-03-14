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

    const memberId = session.member_id;

    const issues = await sql`
      SELECT
        i.id,
        i.title,
        i.description,
        i.status,
        i.priority,
        i.number,
        i.due_date,
        i.created_at,
        i.updated_at,
        i.team_id,
        i.assignee_id,
        i.project_id,
        i.cycle_id,
        i.parent_id,
        t.identifier AS team_identifier,
        t.name AS team_name,
        p.name AS project_name,
        m.name AS assignee_name,
        m.email AS assignee_email
      FROM issues i
      JOIN teams t ON t.id = i.team_id
      LEFT JOIN projects p ON p.id = i.project_id
      LEFT JOIN members m ON m.id = i.assignee_id
      WHERE i.assignee_id = ${memberId}
      ORDER BY i.created_at DESC
    `;

    const issueIds = issues.map((i) => i.id);

    let issueLabels: Array<{ issue_id: string; label_id: string; label_name: string; label_color: string }> = [];
    if (issueIds.length > 0) {
      issueLabels = await sql`
        SELECT il.issue_id, l.id AS label_id, l.name AS label_name, l.color AS label_color
        FROM issue_labels il
        JOIN labels l ON l.id = il.label_id
        WHERE il.issue_id = ANY(${issueIds})
      `;
    }

    const labelsByIssue: Record<string, Array<{ id: string; name: string; color: string }>> = {};
    for (const il of issueLabels) {
      if (!labelsByIssue[il.issue_id]) {
        labelsByIssue[il.issue_id] = [];
      }
      labelsByIssue[il.issue_id].push({
        id: il.label_id,
        name: il.label_name,
        color: il.label_color,
      });
    }

    const enrichedIssues = issues.map((issue) => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      status: issue.status,
      priority: issue.priority,
      identifier: `${issue.team_identifier}-${issue.number}`,
      number: issue.number,
      dueDate: issue.due_date ? String(issue.due_date).split('T')[0] : null,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      teamId: issue.team_id,
      teamName: issue.team_name,
      assigneeId: issue.assignee_id,
      assigneeName: issue.assignee_name,
      assigneeEmail: issue.assignee_email,
      projectId: issue.project_id,
      projectName: issue.project_name,
      cycleId: issue.cycle_id,
      parentId: issue.parent_id,
      labels: labelsByIssue[issue.id] || [],
    }));

    return new Response(JSON.stringify({ issues: enrichedIssues }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Fetch my issues error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
