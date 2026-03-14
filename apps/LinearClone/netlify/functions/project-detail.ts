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
    const projectId = url.searchParams.get('projectId');
    if (!projectId) {
      return new Response(JSON.stringify({ error: 'projectId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch project with lead info and issue counts
    const projectRows = await sql`
      SELECT
        p.id, p.name, p.description, p.status, p.target_date, p.lead_id,
        m.name AS lead_name, m.email AS lead_email,
        COUNT(i.id)::int AS total_issues,
        COUNT(CASE WHEN i.status = 'done' THEN 1 END)::int AS completed_issues,
        COUNT(CASE WHEN i.status = 'in_progress' THEN 1 END)::int AS in_progress_issues
      FROM projects p
      LEFT JOIN members m ON m.id = p.lead_id
      LEFT JOIN issues i ON i.project_id = p.id
      WHERE p.id = ${projectId}
      GROUP BY p.id, p.name, p.description, p.status, p.target_date, p.lead_id, m.name, m.email
    `;
    const project = projectRows[0];
    if (!project) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch project issues with full details, grouped by team
    const issues = await sql`
      SELECT
        i.id, i.title, i.description, i.status, i.priority, i.number,
        i.due_date, i.created_at, i.updated_at, i.team_id, i.assignee_id,
        i.project_id, i.cycle_id, i.parent_id,
        t.identifier AS team_identifier, t.name AS team_name, t.id AS tid,
        ma.name AS assignee_name, ma.email AS assignee_email,
        p2.name AS project_name
      FROM issues i
      JOIN teams t ON t.id = i.team_id
      LEFT JOIN members ma ON ma.id = i.assignee_id
      LEFT JOIN projects p2 ON p2.id = i.project_id
      WHERE i.project_id = ${projectId}
      ORDER BY t.name ASC, i.created_at DESC
    `;

    // Fetch labels for all project issues
    const issueIds = issues.map((i) => String(i.id));
    let issueLabelsMap = new Map<string, Array<{ id: string; name: string; color: string }>>();
    if (issueIds.length > 0) {
      const allLabels = await sql`
        SELECT il.issue_id, l.id, l.name, l.color
        FROM issue_labels il
        JOIN labels l ON l.id = il.label_id
        WHERE il.issue_id = ANY(${issueIds})
      `;
      for (const row of allLabels) {
        const iid = String(row.issue_id);
        if (!issueLabelsMap.has(iid)) {
          issueLabelsMap.set(iid, []);
        }
        issueLabelsMap.get(iid)!.push({
          id: String(row.id),
          name: String(row.name),
          color: String(row.color),
        });
      }
    }

    const enrichedIssues = issues.map((i) => ({
      id: String(i.id),
      title: String(i.title),
      description: i.description ? String(i.description) : '',
      status: String(i.status),
      priority: String(i.priority),
      identifier: `${i.team_identifier}-${i.number}`,
      number: i.number,
      dueDate: i.due_date ? String(i.due_date).split('T')[0] : null,
      createdAt: String(i.created_at),
      updatedAt: String(i.updated_at),
      teamId: String(i.team_id),
      teamName: String(i.team_name),
      assigneeId: i.assignee_id ? String(i.assignee_id) : null,
      assigneeName: i.assignee_name ? String(i.assignee_name) : null,
      assigneeEmail: i.assignee_email ? String(i.assignee_email) : null,
      projectId: i.project_id ? String(i.project_id) : null,
      projectName: i.project_name ? String(i.project_name) : null,
      cycleId: i.cycle_id ? String(i.cycle_id) : null,
      parentId: i.parent_id ? String(i.parent_id) : null,
      labels: issueLabelsMap.get(String(i.id)) || [],
    }));

    // Fetch milestones
    const milestones = await sql`
      SELECT id, name, target_date, completed, created_at
      FROM project_milestones
      WHERE project_id = ${projectId}
      ORDER BY target_date ASC NULLS LAST, created_at ASC
    `;

    // Fetch all members for lead selector
    const allMembers = await sql`
      SELECT id, name, email FROM members ORDER BY name ASC
    `;

    // Fetch all labels
    const labels = await sql`
      SELECT id, name, color FROM labels ORDER BY name ASC
    `;

    // Fetch project activity
    const activity = await sql`
      SELECT pa.id, pa.action, pa.created_at, pa.member_id, m2.name AS member_name, m2.email AS member_email
      FROM project_activity pa
      LEFT JOIN members m2 ON m2.id = pa.member_id
      WHERE pa.project_id = ${projectId}
      ORDER BY pa.created_at DESC
      LIMIT 50
    `;

    return new Response(JSON.stringify({
      project: {
        id: String(project.id),
        name: String(project.name),
        description: project.description ? String(project.description) : null,
        status: String(project.status),
        targetDate: project.target_date ? String(project.target_date).split('T')[0] : null,
        leadId: project.lead_id ? String(project.lead_id) : null,
        leadName: project.lead_name ? String(project.lead_name) : null,
        leadEmail: project.lead_email ? String(project.lead_email) : null,
        totalIssues: project.total_issues,
        completedIssues: project.completed_issues,
        inProgressIssues: project.in_progress_issues,
      },
      issues: enrichedIssues,
      milestones: milestones.map((ms) => ({
        id: String(ms.id),
        name: String(ms.name),
        targetDate: ms.target_date ? String(ms.target_date).split('T')[0] : null,
        completed: Boolean(ms.completed),
      })),
      members: allMembers.map((m) => ({
        id: String(m.id),
        name: String(m.name),
        email: String(m.email),
      })),
      labels: labels.map((l) => ({
        id: String(l.id),
        name: String(l.name),
        color: String(l.color),
      })),
      activity: activity.map((a) => ({
        id: String(a.id),
        action: String(a.action),
        createdAt: String(a.created_at),
        memberId: String(a.member_id),
        memberName: a.member_name ? String(a.member_name) : null,
        memberEmail: a.member_email ? String(a.member_email) : null,
      })),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Project detail error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
