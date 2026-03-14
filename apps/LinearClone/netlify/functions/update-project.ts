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

    const body = await req.json();
    const { projectId, field, value } = body;

    if (!projectId || !field) {
      return new Response(JSON.stringify({ error: 'projectId and field are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get current project state for activity logging
    const currentRows = await sql`
      SELECT p.*, m.name AS lead_name
      FROM projects p
      LEFT JOIN members m ON m.id = p.lead_id
      WHERE p.id = ${projectId}
    `;
    const current = currentRows[0];
    if (!current) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const STATUS_LABELS: Record<string, string> = {
      planned: 'Planned',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };

    let activityAction = '';

    if (field === 'name') {
      if (!value || !String(value).trim()) {
        return new Response(JSON.stringify({ error: 'Name is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      await sql`UPDATE projects SET name = ${String(value).trim()} WHERE id = ${projectId}`;
      activityAction = `changed name from "${current.name}" to "${String(value).trim()}"`;
    } else if (field === 'status') {
      await sql`UPDATE projects SET status = ${value} WHERE id = ${projectId}`;
      const oldLabel = STATUS_LABELS[String(current.status)] || String(current.status);
      const newLabel = STATUS_LABELS[String(value)] || String(value);
      activityAction = `changed status from ${oldLabel} to ${newLabel}`;
    } else if (field === 'description') {
      const descVal = value || null;
      await sql`UPDATE projects SET description = ${descVal} WHERE id = ${projectId}`;
      activityAction = 'updated the description';
    } else if (field === 'targetDate') {
      const dateVal = value || null;
      await sql`UPDATE projects SET target_date = ${dateVal} WHERE id = ${projectId}`;
      if (dateVal) {
        activityAction = `set target date to ${value}`;
      } else {
        activityAction = 'removed target date';
      }
    } else if (field === 'leadId') {
      const leadVal = value || null;
      await sql`UPDATE projects SET lead_id = ${leadVal} WHERE id = ${projectId}`;
      if (leadVal) {
        const leadRows = await sql`SELECT name FROM members WHERE id = ${leadVal}`;
        const leadRow = leadRows[0];
        const newName = leadRow ? String(leadRow.name) : 'someone';
        if (current.lead_id) {
          activityAction = `changed lead from ${current.lead_name || 'unknown'} to ${newName}`;
        } else {
          activityAction = `set lead to ${newName}`;
        }
      } else {
        activityAction = `removed lead ${current.lead_name || ''}`;
      }
    } else {
      return new Response(JSON.stringify({ error: 'Invalid field' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create project activity entry
    if (activityAction) {
      await sql`
        INSERT INTO project_activity (project_id, member_id, action, created_at)
        VALUES (${projectId}, ${session.member_id}, ${activityAction}, NOW())
      `;
    }

    // Fetch updated project
    const updatedRows = await sql`
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
    const updated = updatedRows[0];
    if (!updated) {
      return new Response(JSON.stringify({ error: 'Project not found after update' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get latest activity
    const latestActivity = await sql`
      SELECT pa.id, pa.action, pa.created_at, pa.member_id, m2.name AS member_name, m2.email AS member_email
      FROM project_activity pa
      LEFT JOIN members m2 ON m2.id = pa.member_id
      WHERE pa.project_id = ${projectId}
      ORDER BY pa.created_at DESC
      LIMIT 1
    `;

    const latestEntry = latestActivity[0];

    return new Response(JSON.stringify({
      project: {
        id: String(updated.id),
        name: String(updated.name),
        description: updated.description ? String(updated.description) : null,
        status: String(updated.status),
        targetDate: updated.target_date ? String(updated.target_date).split('T')[0] : null,
        leadId: updated.lead_id ? String(updated.lead_id) : null,
        leadName: updated.lead_name ? String(updated.lead_name) : null,
        leadEmail: updated.lead_email ? String(updated.lead_email) : null,
        totalIssues: updated.total_issues,
        completedIssues: updated.completed_issues,
        inProgressIssues: updated.in_progress_issues,
      },
      activity: latestEntry ? {
        id: String(latestEntry.id),
        action: String(latestEntry.action),
        createdAt: String(latestEntry.created_at),
        memberId: String(latestEntry.member_id),
        memberName: latestEntry.member_name ? String(latestEntry.member_name) : null,
        memberEmail: latestEntry.member_email ? String(latestEntry.member_email) : null,
      } : null,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Update project error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
