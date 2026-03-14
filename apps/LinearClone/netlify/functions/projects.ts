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

    if (req.method === 'GET') {
      // Fetch all projects with lead info, issue counts, and team info
      const projects = await sql`
        SELECT
          p.id,
          p.name,
          p.description,
          p.status,
          p.target_date,
          p.lead_id,
          m.name AS lead_name,
          m.email AS lead_email,
          COUNT(i.id)::int AS total_issues,
          COUNT(CASE WHEN i.status = 'done' THEN 1 END)::int AS completed_issues
        FROM projects p
        LEFT JOIN members m ON m.id = p.lead_id
        LEFT JOIN issues i ON i.project_id = p.id
        GROUP BY p.id, p.name, p.description, p.status, p.target_date, p.lead_id, m.name, m.email
        ORDER BY p.created_at DESC
      `;

      // Fetch teams for each project (via issues)
      const projectTeams = await sql`
        SELECT DISTINCT i.project_id, t.id AS team_id, t.name AS team_name, t.identifier AS team_identifier
        FROM issues i
        JOIN teams t ON t.id = i.team_id
        WHERE i.project_id IS NOT NULL
        ORDER BY t.name ASC
      `;

      // Build team map by project
      const teamsByProject = new Map<string, Array<{ id: string; name: string; identifier: string }>>();
      for (const row of projectTeams) {
        const pid = String(row.project_id);
        if (!teamsByProject.has(pid)) {
          teamsByProject.set(pid, []);
        }
        teamsByProject.get(pid)!.push({
          id: String(row.team_id),
          name: String(row.team_name),
          identifier: String(row.team_identifier),
        });
      }

      // Fetch all members for lead filter
      const allMembers = await sql`
        SELECT id, name, email FROM members ORDER BY name ASC
      `;

      // Fetch all teams for team filter
      const allTeams = await sql`
        SELECT id, name, identifier FROM teams ORDER BY name ASC
      `;

      const enrichedProjects = projects.map((p) => ({
        id: String(p.id),
        name: String(p.name),
        description: p.description ? String(p.description) : null,
        status: String(p.status),
        targetDate: p.target_date ? String(p.target_date).split('T')[0] : null,
        leadId: p.lead_id ? String(p.lead_id) : null,
        leadName: p.lead_name ? String(p.lead_name) : null,
        leadEmail: p.lead_email ? String(p.lead_email) : null,
        totalIssues: p.total_issues,
        completedIssues: p.completed_issues,
        teams: teamsByProject.get(String(p.id)) || [],
      }));

      return new Response(JSON.stringify({
        projects: enrichedProjects,
        members: allMembers.map((m) => ({
          id: String(m.id),
          name: String(m.name),
          email: String(m.email),
        })),
        teams: allTeams.map((t) => ({
          id: String(t.id),
          name: String(t.name),
          identifier: String(t.identifier),
        })),
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const body = await req.json() as {
        name: string;
        description?: string;
        status?: string;
        leadId?: string;
        targetDate?: string;
        teamIds?: string[];
      };

      if (!body.name?.trim()) {
        return new Response(JSON.stringify({ error: 'Name is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const status = body.status || 'planned';
      const leadId = body.leadId || null;
      const targetDate = body.targetDate || null;
      const description = body.description || null;

      const result = await sql`
        INSERT INTO projects (name, description, status, lead_id, target_date)
        VALUES (${body.name.trim()}, ${description}, ${status}, ${leadId}, ${targetDate})
        RETURNING id, name, description, status, lead_id, target_date, created_at
      `;

      const project = result[0];
      if (!project) {
        return new Response(JSON.stringify({ error: 'Failed to create project' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Fetch lead info if set
      let leadName: string | null = null;
      let leadEmail: string | null = null;
      if (project.lead_id) {
        const leadRows = await sql`SELECT name, email FROM members WHERE id = ${project.lead_id}`;
        const lead = leadRows[0];
        if (lead) {
          leadName = String(lead.name);
          leadEmail = String(lead.email);
        }
      }

      return new Response(JSON.stringify({
        id: String(project.id),
        name: String(project.name),
        description: project.description ? String(project.description) : null,
        status: String(project.status),
        targetDate: project.target_date ? String(project.target_date).split('T')[0] : null,
        leadId: project.lead_id ? String(project.lead_id) : null,
        leadName,
        leadEmail,
        totalIssues: 0,
        completedIssues: 0,
        teams: [],
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Projects error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
