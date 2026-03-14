import type { Context } from '@netlify/functions';
import { getSql } from './db';

export default async function handler(req: Request, _context: Context) {
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

    if (req.method === 'POST') {
      const body = await req.json();
      const { projectId, name, targetDate } = body;

      if (!projectId || !name?.trim()) {
        return new Response(JSON.stringify({ error: 'projectId and name are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const dateVal = targetDate || null;
      const result = await sql`
        INSERT INTO project_milestones (project_id, name, target_date, completed)
        VALUES (${projectId}, ${name.trim()}, ${dateVal}, false)
        RETURNING id, name, target_date, completed
      `;
      const milestone = result[0];
      if (!milestone) {
        return new Response(JSON.stringify({ error: 'Failed to create milestone' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Activity
      await sql`
        INSERT INTO project_activity (project_id, member_id, action, created_at)
        VALUES (${projectId}, ${session.member_id}, ${`added milestone "${name.trim()}"`}, NOW())
      `;

      return new Response(JSON.stringify({
        milestone: {
          id: String(milestone.id),
          name: String(milestone.name),
          targetDate: milestone.target_date ? String(milestone.target_date).split('T')[0] : null,
          completed: Boolean(milestone.completed),
        },
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'PUT') {
      const body = await req.json();
      const { milestoneId, projectId, name, targetDate, completed } = body;

      if (!milestoneId) {
        return new Response(JSON.stringify({ error: 'milestoneId is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Fetch current milestone
      const currentRows = await sql`
        SELECT id, name, target_date, completed, project_id FROM project_milestones WHERE id = ${milestoneId}
      `;
      const current = currentRows[0];
      if (!current) {
        return new Response(JSON.stringify({ error: 'Milestone not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const pid = projectId || String(current.project_id);
      let activityAction = '';

      if (name !== undefined) {
        await sql`UPDATE project_milestones SET name = ${name.trim()} WHERE id = ${milestoneId}`;
        activityAction = `renamed milestone from "${current.name}" to "${name.trim()}"`;
      }
      if (targetDate !== undefined) {
        const dateVal = targetDate || null;
        await sql`UPDATE project_milestones SET target_date = ${dateVal} WHERE id = ${milestoneId}`;
        if (!activityAction) {
          activityAction = `updated milestone "${current.name}" target date`;
        }
      }
      if (completed !== undefined) {
        await sql`UPDATE project_milestones SET completed = ${completed} WHERE id = ${milestoneId}`;
        if (!activityAction) {
          activityAction = completed
            ? `marked milestone "${current.name}" as completed`
            : `marked milestone "${current.name}" as incomplete`;
        }
      }

      if (activityAction) {
        await sql`
          INSERT INTO project_activity (project_id, member_id, action, created_at)
          VALUES (${pid}, ${session.member_id}, ${activityAction}, NOW())
        `;
      }

      const updatedRows = await sql`
        SELECT id, name, target_date, completed FROM project_milestones WHERE id = ${milestoneId}
      `;
      const updated = updatedRows[0];
      if (!updated) {
        return new Response(JSON.stringify({ error: 'Milestone not found after update' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        milestone: {
          id: String(updated.id),
          name: String(updated.name),
          targetDate: updated.target_date ? String(updated.target_date).split('T')[0] : null,
          completed: Boolean(updated.completed),
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const milestoneId = url.searchParams.get('milestoneId');
      const projectId = url.searchParams.get('projectId');

      if (!milestoneId) {
        return new Response(JSON.stringify({ error: 'milestoneId is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Fetch milestone name for activity
      const msRows = await sql`
        SELECT name, project_id FROM project_milestones WHERE id = ${milestoneId}
      `;
      const ms = msRows[0];
      if (!ms) {
        return new Response(JSON.stringify({ error: 'Milestone not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      await sql`DELETE FROM project_milestones WHERE id = ${milestoneId}`;

      const pid = projectId || String(ms.project_id);
      await sql`
        INSERT INTO project_activity (project_id, member_id, action, created_at)
        VALUES (${pid}, ${session.member_id}, ${`deleted milestone "${ms.name}"`}, NOW())
      `;

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Project milestones error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
