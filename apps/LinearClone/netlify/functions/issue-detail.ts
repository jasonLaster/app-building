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
    const issueId = url.searchParams.get('issueId');
    if (!issueId) {
      return new Response(JSON.stringify({ error: 'issueId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
        m.email AS assignee_email,
        c.name AS cycle_name
      FROM issues i
      JOIN teams t ON t.id = i.team_id
      LEFT JOIN projects p ON p.id = i.project_id
      LEFT JOIN members m ON m.id = i.assignee_id
      LEFT JOIN cycles c ON c.id = i.cycle_id
      WHERE i.id = ${issueId}
    `;
    const issue = issues[0];
    if (!issue) {
      return new Response(JSON.stringify({ error: 'Issue not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch labels
    const issueLabels = await sql`
      SELECT l.id, l.name, l.color
      FROM issue_labels il
      JOIN labels l ON l.id = il.label_id
      WHERE il.issue_id = ${issueId}
    `;

    // Fetch sub-issues
    const subIssues = await sql`
      SELECT
        si.id,
        si.title,
        si.status,
        si.priority,
        si.number,
        t.identifier AS team_identifier
      FROM issues si
      JOIN teams t ON t.id = si.team_id
      WHERE si.parent_id = ${issueId}
      ORDER BY si.created_at ASC
    `;

    // Fetch activity
    const activity = await sql`
      SELECT
        a.id,
        a.action,
        a.created_at,
        a.member_id,
        m.name AS member_name,
        m.email AS member_email
      FROM activity a
      LEFT JOIN members m ON m.id = a.member_id
      WHERE a.issue_id = ${issueId}
      ORDER BY a.created_at ASC
    `;

    // Fetch comments
    const comments = await sql`
      SELECT
        co.id,
        co.content,
        co.created_at,
        co.member_id,
        m.name AS member_name,
        m.email AS member_email
      FROM comments co
      LEFT JOIN members m ON m.id = co.member_id
      WHERE co.issue_id = ${issueId}
      ORDER BY co.created_at ASC
    `;

    // Fetch team members for assignee selector
    const members = await sql`
      SELECT m.id, m.name, m.email
      FROM members m
      JOIN team_members tm ON tm.member_id = m.id
      WHERE tm.team_id = ${issue.team_id}
      ORDER BY m.name ASC
    `;

    // Fetch team projects (include any project used by this team's issues)
    const projects = issue.project_id
      ? await sql`
          SELECT DISTINCT p.id, p.name
          FROM projects p
          WHERE p.id IN (
            SELECT DISTINCT i2.project_id FROM issues i2 WHERE i2.team_id = ${issue.team_id} AND i2.project_id IS NOT NULL
          ) OR p.id = ${issue.project_id}
          ORDER BY p.name ASC
        `
      : await sql`
          SELECT DISTINCT p.id, p.name
          FROM projects p
          WHERE p.id IN (
            SELECT DISTINCT i2.project_id FROM issues i2 WHERE i2.team_id = ${issue.team_id} AND i2.project_id IS NOT NULL
          )
          ORDER BY p.name ASC
        `;

    // Fetch team cycles
    const cycles = await sql`
      SELECT c2.id, c2.name, c2.start_date, c2.end_date
      FROM cycles c2
      WHERE c2.team_id = ${issue.team_id}
      ORDER BY c2.start_date DESC
    `;

    // Fetch all labels for the label picker
    const allLabels = await sql`
      SELECT id, name, color FROM labels ORDER BY name ASC
    `;

    const enrichedIssue = {
      id: issue.id,
      title: issue.title,
      description: issue.description || '',
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
      cycleName: issue.cycle_name,
      parentId: issue.parent_id,
      labels: issueLabels.map((l) => ({ id: String(l.id), name: String(l.name), color: String(l.color) })),
    };

    return new Response(JSON.stringify({
      issue: enrichedIssue,
      subIssues: subIssues.map((si) => ({
        id: si.id,
        title: si.title,
        status: si.status,
        priority: si.priority,
        identifier: `${si.team_identifier}-${si.number}`,
      })),
      activity: activity.map((a) => ({
        id: a.id,
        action: a.action,
        createdAt: a.created_at,
        memberId: a.member_id,
        memberName: a.member_name,
        memberEmail: a.member_email,
      })),
      comments: comments.map((co) => ({
        id: co.id,
        content: co.content,
        createdAt: co.created_at,
        memberId: co.member_id,
        memberName: co.member_name,
        memberEmail: co.member_email,
      })),
      members: members.map((m) => ({ id: String(m.id), name: String(m.name), email: String(m.email) })),
      projects: projects.map((p) => ({ id: String(p.id), name: String(p.name) })),
      cycles: cycles.map((c) => ({
        id: String(c.id),
        name: String(c.name),
        start_date: String(c.start_date),
        end_date: String(c.end_date),
      })),
      allLabels: allLabels.map((l) => ({ id: String(l.id), name: String(l.name), color: String(l.color) })),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Fetch issue detail error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
