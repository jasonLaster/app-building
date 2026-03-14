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
    const { issueId, field, value, labelIds } = body;

    if (!issueId || !field) {
      return new Response(JSON.stringify({ error: 'issueId and field are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get current issue state for activity logging
    const currentRows = await sql`
      SELECT i.*, t.identifier AS team_identifier, m.name AS assignee_name
      FROM issues i
      JOIN teams t ON t.id = i.team_id
      LEFT JOIN members m ON m.id = i.assignee_id
      WHERE i.id = ${issueId}
    `;
    const current = currentRows[0];
    if (!current) {
      return new Response(JSON.stringify({ error: 'Issue not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const STATUS_LABELS: Record<string, string> = {
      backlog: 'Backlog',
      todo: 'Todo',
      in_progress: 'In Progress',
      in_review: 'In Review',
      done: 'Done',
      cancelled: 'Cancelled',
    };

    const PRIORITY_LABELS: Record<string, string> = {
      urgent: 'Urgent',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      none: 'No Priority',
    };

    let activityAction = '';

    if (field === 'title') {
      await sql`UPDATE issues SET title = ${value}, updated_at = NOW() WHERE id = ${issueId}`;
      activityAction = `changed title from "${current.title}" to "${value}"`;
    } else if (field === 'description') {
      await sql`UPDATE issues SET description = ${value}, updated_at = NOW() WHERE id = ${issueId}`;
      activityAction = 'updated the description';
    } else if (field === 'status') {
      await sql`UPDATE issues SET status = ${value}, updated_at = NOW() WHERE id = ${issueId}`;
      const oldLabel = STATUS_LABELS[String(current.status)] || current.status;
      const newLabel = STATUS_LABELS[String(value)] || value;
      activityAction = `changed status from ${oldLabel} to ${newLabel}`;
    } else if (field === 'priority') {
      await sql`UPDATE issues SET priority = ${value}, updated_at = NOW() WHERE id = ${issueId}`;
      const oldLabel = PRIORITY_LABELS[String(current.priority)] || current.priority;
      const newLabel = PRIORITY_LABELS[String(value)] || value;
      activityAction = `changed priority from ${oldLabel} to ${newLabel}`;
    } else if (field === 'assigneeId') {
      const assigneeVal = value || null;
      await sql`UPDATE issues SET assignee_id = ${assigneeVal}, updated_at = NOW() WHERE id = ${issueId}`;
      if (assigneeVal) {
        const aRows = await sql`SELECT name FROM members WHERE id = ${assigneeVal}`;
        const aRow = aRows[0];
        const newName = aRow ? String(aRow.name) : 'someone';
        if (current.assignee_id) {
          activityAction = `changed assignee from ${current.assignee_name || 'unknown'} to ${newName}`;
        } else {
          activityAction = `assigned to ${newName}`;
        }
        // Notify new assignee
        if (assigneeVal !== session.member_id) {
          const creatorRows = await sql`SELECT name FROM members WHERE id = ${session.member_id}`;
          const creator = creatorRows[0];
          const creatorName = creator ? String(creator.name) : 'Someone';
          const identifier = `${current.team_identifier}-${current.number}`;
          await sql`
            INSERT INTO notifications (member_id, type, message, issue_id, created_at)
            VALUES (${assigneeVal}, 'assigned', ${`${creatorName} assigned you to ${identifier}: ${current.title}`}, ${issueId}, NOW())
          `;
        }
      } else {
        activityAction = `removed assignee ${current.assignee_name || ''}`;
      }
    } else if (field === 'projectId') {
      const projectVal = value || null;
      await sql`UPDATE issues SET project_id = ${projectVal}, updated_at = NOW() WHERE id = ${issueId}`;
      if (projectVal) {
        const pRows = await sql`SELECT name FROM projects WHERE id = ${projectVal}`;
        const pRow = pRows[0];
        activityAction = `set project to ${pRow ? String(pRow.name) : 'unknown'}`;
      } else {
        activityAction = 'removed project';
      }
    } else if (field === 'cycleId') {
      const cycleVal = value || null;
      await sql`UPDATE issues SET cycle_id = ${cycleVal}, updated_at = NOW() WHERE id = ${issueId}`;
      if (cycleVal) {
        const cRows = await sql`SELECT name FROM cycles WHERE id = ${cycleVal}`;
        const cRow = cRows[0];
        activityAction = `set cycle to ${cRow ? String(cRow.name) : 'unknown'}`;
      } else {
        activityAction = 'removed cycle';
      }
    } else if (field === 'dueDate') {
      const dateVal = value || null;
      await sql`UPDATE issues SET due_date = ${dateVal}, updated_at = NOW() WHERE id = ${issueId}`;
      if (dateVal) {
        activityAction = `set due date to ${value}`;
      } else {
        activityAction = 'removed due date';
      }
    } else if (field === 'labels') {
      // Handle labels update - delete all and re-insert
      await sql`DELETE FROM issue_labels WHERE issue_id = ${issueId}`;
      if (labelIds && Array.isArray(labelIds) && labelIds.length > 0) {
        for (const labelId of labelIds) {
          await sql`INSERT INTO issue_labels (issue_id, label_id) VALUES (${issueId}, ${labelId})`;
        }
      }
      await sql`UPDATE issues SET updated_at = NOW() WHERE id = ${issueId}`;
      activityAction = 'updated labels';
    } else {
      return new Response(JSON.stringify({ error: 'Invalid field' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create activity entry
    if (activityAction) {
      await sql`
        INSERT INTO activity (issue_id, member_id, action, created_at)
        VALUES (${issueId}, ${session.member_id}, ${activityAction}, NOW())
      `;
    }

    // Fetch updated issue
    const updatedRows = await sql`
      SELECT
        i.id, i.title, i.description, i.status, i.priority, i.number,
        i.due_date, i.created_at, i.updated_at, i.team_id, i.assignee_id,
        i.project_id, i.cycle_id, i.parent_id,
        t.identifier AS team_identifier, t.name AS team_name,
        p.name AS project_name, m.name AS assignee_name, m.email AS assignee_email,
        cy.name AS cycle_name
      FROM issues i
      JOIN teams t ON t.id = i.team_id
      LEFT JOIN projects p ON p.id = i.project_id
      LEFT JOIN members m ON m.id = i.assignee_id
      LEFT JOIN cycles cy ON cy.id = i.cycle_id
      WHERE i.id = ${issueId}
    `;
    const updated = updatedRows[0];
    if (!updated) {
      return new Response(JSON.stringify({ error: 'Issue not found after update' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updatedLabels = await sql`
      SELECT l.id, l.name, l.color FROM issue_labels il JOIN labels l ON l.id = il.label_id WHERE il.issue_id = ${issueId}
    `;

    // Get newest activity entry for response
    const latestActivity = await sql`
      SELECT a.id, a.action, a.created_at, a.member_id, m.name AS member_name, m.email AS member_email
      FROM activity a
      LEFT JOIN members m ON m.id = a.member_id
      WHERE a.issue_id = ${issueId}
      ORDER BY a.created_at DESC
      LIMIT 1
    `;

    const enrichedIssue = {
      id: updated.id,
      title: updated.title,
      description: updated.description || '',
      status: updated.status,
      priority: updated.priority,
      identifier: `${updated.team_identifier}-${updated.number}`,
      number: updated.number,
      dueDate: updated.due_date ? String(updated.due_date).split('T')[0] : null,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
      teamId: updated.team_id,
      teamName: updated.team_name,
      assigneeId: updated.assignee_id,
      assigneeName: updated.assignee_name,
      assigneeEmail: updated.assignee_email,
      projectId: updated.project_id,
      projectName: updated.project_name,
      cycleId: updated.cycle_id,
      cycleName: updated.cycle_name,
      parentId: updated.parent_id,
      labels: updatedLabels.map((l) => ({ id: String(l.id), name: String(l.name), color: String(l.color) })),
    };

    const latestActivityEntry = latestActivity[0];
    const activityEntry = latestActivityEntry ? {
      id: latestActivityEntry.id,
      action: latestActivityEntry.action,
      createdAt: latestActivityEntry.created_at,
      memberId: latestActivityEntry.member_id,
      memberName: latestActivityEntry.member_name,
      memberEmail: latestActivityEntry.member_email,
    } : null;

    return new Response(JSON.stringify({ issue: enrichedIssue, activity: activityEntry }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Update issue error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
