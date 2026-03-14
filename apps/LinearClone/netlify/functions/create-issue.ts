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

    const body = await req.json();
    const {
      teamId,
      title,
      description,
      status,
      priority,
      assigneeId,
      labelIds,
      projectId,
      cycleId,
      dueDate,
      parentId,
    } = body;

    if (!teamId || !title) {
      return new Response(JSON.stringify({ error: 'teamId and title are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the next issue number for this team
    const numberResult = await sql`
      SELECT COALESCE(MAX(number), 0) + 1 AS next_number
      FROM issues
      WHERE team_id = ${teamId}
    `;
    const nextNumber = numberResult[0]?.next_number || 1;

    // Get team identifier
    const teamResult = await sql`
      SELECT identifier FROM teams WHERE id = ${teamId}
    `;
    const team = teamResult[0];
    if (!team) {
      return new Response(JSON.stringify({ error: 'Team not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const issueStatus = status || 'backlog';
    const issuePriority = priority || 'none';
    const issueDueDate = dueDate || null;
    const issueAssigneeId = assigneeId || null;
    const issueProjectId = projectId || null;
    const issueCycleId = cycleId || null;
    const issueParentId = parentId || null;
    const issueDescription = description || '';

    const insertResult = await sql`
      INSERT INTO issues (team_id, title, description, status, priority, number, due_date, assignee_id, project_id, cycle_id, parent_id)
      VALUES (${teamId}, ${title}, ${issueDescription}, ${issueStatus}, ${issuePriority}, ${nextNumber}, ${issueDueDate}, ${issueAssigneeId}, ${issueProjectId}, ${issueCycleId}, ${issueParentId})
      RETURNING id, created_at, updated_at
    `;
    const newIssue = insertResult[0];
    if (!newIssue) {
      return new Response(JSON.stringify({ error: 'Failed to create issue' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Insert labels
    const labels: Array<{ id: string; name: string; color: string }> = [];
    if (labelIds && Array.isArray(labelIds) && labelIds.length > 0) {
      for (const labelId of labelIds) {
        await sql`
          INSERT INTO issue_labels (issue_id, label_id)
          VALUES (${newIssue.id}, ${labelId})
        `;
      }
      const labelRows = await sql`
        SELECT id, name, color FROM labels WHERE id = ANY(${labelIds})
      `;
      labels.push(...labelRows.map((l) => ({ id: String(l.id), name: String(l.name), color: String(l.color) })));
    }

    // Create activity history entry
    await sql`
      INSERT INTO activity (issue_id, member_id, action, created_at)
      VALUES (${newIssue.id}, ${session.member_id}, 'created this issue', NOW())
    `;

    // Create notification for assignee if different from creator
    if (issueAssigneeId && issueAssigneeId !== session.member_id) {
      const creatorResult = await sql`
        SELECT name FROM members WHERE id = ${session.member_id}
      `;
      const creator = creatorResult[0];
      const creatorName = creator ? String(creator.name) : 'Someone';
      const identifier = `${team.identifier}-${nextNumber}`;

      await sql`
        INSERT INTO notifications (member_id, type, message, issue_id, created_at)
        VALUES (${issueAssigneeId}, 'assigned', ${`${creatorName} assigned you to ${identifier}: ${title}`}, ${newIssue.id}, NOW())
      `;
    }

    // Fetch assignee name if set
    let assigneeName: string | null = null;
    let assigneeEmail: string | null = null;
    if (issueAssigneeId) {
      const assigneeResult = await sql`
        SELECT name, email FROM members WHERE id = ${issueAssigneeId}
      `;
      const assignee = assigneeResult[0];
      if (assignee) {
        assigneeName = String(assignee.name);
        assigneeEmail = String(assignee.email);
      }
    }

    // Fetch project name if set
    let projectName: string | null = null;
    if (issueProjectId) {
      const projectResult = await sql`
        SELECT name FROM projects WHERE id = ${issueProjectId}
      `;
      const project = projectResult[0];
      if (project) {
        projectName = String(project.name);
      }
    }

    const identifier = `${team.identifier}-${nextNumber}`;

    return new Response(JSON.stringify({
      issue: {
        id: newIssue.id,
        title,
        description: issueDescription,
        status: issueStatus,
        priority: issuePriority,
        identifier,
        number: nextNumber,
        dueDate: issueDueDate ? String(issueDueDate).split('T')[0] : null,
        createdAt: newIssue.created_at,
        updatedAt: newIssue.updated_at,
        teamId,
        teamName: '',
        assigneeId: issueAssigneeId,
        assigneeName,
        assigneeEmail,
        projectId: issueProjectId,
        projectName,
        cycleId: issueCycleId,
        parentId: issueParentId,
        labels,
      },
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Create issue error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
