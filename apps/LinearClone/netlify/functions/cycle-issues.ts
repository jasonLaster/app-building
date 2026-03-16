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
    const cycleId = url.searchParams.get('cycleId');
    if (!cycleId) {
      return new Response(JSON.stringify({ error: 'cycleId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch cycle info
    const cycleRows = await sql`
      SELECT c.id, c.name, c.start_date, c.end_date, c.team_id
      FROM cycles c
      WHERE c.id = ${cycleId}
    `;
    const cycle = cycleRows[0];
    if (!cycle) {
      return new Response(JSON.stringify({ error: 'Cycle not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch issues in this cycle
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
      WHERE i.cycle_id = ${cycleId}
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
      dueDate: issue.due_date ? (issue.due_date instanceof Date ? issue.due_date.toISOString().split('T')[0] : String(issue.due_date).split('T')[0]) : null,
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
      cycleName: cycle.name,
      parentId: issue.parent_id,
      labels: labelsByIssue[issue.id] || [],
    }));

    const cycleStartDate = cycle.start_date instanceof Date ? cycle.start_date.toISOString().split('T')[0] : String(cycle.start_date).split('T')[0];
    const cycleEndDate = cycle.end_date instanceof Date ? cycle.end_date.toISOString().split('T')[0] : String(cycle.end_date).split('T')[0];

    // Fetch burndown data: activity entries where status changed to 'done' for issues in this cycle
    let burndownData: Array<{ completion_date: Date | string; count: number }> = [];
    if (issueIds.length > 0) {
      burndownData = await sql`
        SELECT DATE(a.created_at) AS completion_date, COUNT(*)::int AS count
        FROM activity a
        WHERE a.issue_id = ANY(${issueIds})
          AND a.field = 'status'
          AND a.new_value = 'done'
          AND DATE(a.created_at) >= ${cycleStartDate}
          AND DATE(a.created_at) <= ${cycleEndDate}
        GROUP BY DATE(a.created_at)
        ORDER BY DATE(a.created_at) ASC
      `;
    }

    // Fetch team members for filters
    const members = await sql`
      SELECT m.id, m.name, m.email
      FROM members m
      JOIN team_members tm ON tm.member_id = m.id
      WHERE tm.team_id = ${cycle.team_id}
      ORDER BY m.name ASC
    `;

    return new Response(JSON.stringify({
      cycle: {
        id: cycle.id,
        name: cycle.name,
        startDate: cycleStartDate,
        endDate: cycleEndDate,
        teamId: cycle.team_id,
      },
      issues: enrichedIssues,
      members,
      burndown: burndownData.map((d) => ({
        date: d.completion_date instanceof Date ? d.completion_date.toISOString().split('T')[0] : String(d.completion_date).split('T')[0],
        count: d.count,
      })),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Cycle issues error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
