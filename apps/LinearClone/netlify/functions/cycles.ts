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

    const url = new URL(req.url);

    if (req.method === 'GET') {
      const teamId = url.searchParams.get('teamId');
      if (!teamId) {
        return new Response(JSON.stringify({ error: 'teamId is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Fetch all cycles for the team with issue stats
      const cycles = await sql`
        SELECT
          c.id,
          c.name,
          c.start_date,
          c.end_date,
          c.team_id,
          COUNT(i.id)::int AS issue_count,
          COUNT(CASE WHEN i.status = 'done' THEN 1 END)::int AS done_count,
          COUNT(CASE WHEN i.status = 'in_progress' OR i.status = 'in_review' THEN 1 END)::int AS in_progress_count
        FROM cycles c
        LEFT JOIN issues i ON i.cycle_id = c.id
        WHERE c.team_id = ${teamId}
        GROUP BY c.id, c.name, c.start_date, c.end_date, c.team_id
        ORDER BY c.start_date ASC
      `;

      // Determine active cycle: current date falls within start_date and end_date
      const now = new Date();
      const enrichedCycles = cycles.map((c) => {
        const startStr = c.start_date instanceof Date ? c.start_date.toISOString().split('T')[0] : String(c.start_date).split('T')[0];
        const endStr = c.end_date instanceof Date ? c.end_date.toISOString().split('T')[0] : String(c.end_date).split('T')[0];
        const startDate = new Date(startStr + 'T00:00:00');
        const endDate = new Date(endStr + 'T23:59:59');
        const isActive = now >= startDate && now <= endDate;
        return {
          id: c.id,
          name: c.name,
          startDate: startStr,
          endDate: endStr,
          teamId: c.team_id,
          issueCount: c.issue_count,
          doneCount: c.done_count,
          inProgressCount: c.in_progress_count,
          isActive,
        };
      });

      return new Response(JSON.stringify({ cycles: enrichedCycles }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const body = await req.json() as {
        teamId: string;
        name: string;
        startDate: string;
        endDate: string;
      };

      if (!body.teamId || !body.name || !body.startDate || !body.endDate) {
        return new Response(JSON.stringify({ error: 'All fields are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const result = await sql`
        INSERT INTO cycles (name, start_date, end_date, team_id)
        VALUES (${body.name}, ${body.startDate}, ${body.endDate}, ${body.teamId})
        RETURNING id, name, start_date, end_date, team_id
      `;

      const cycle = result[0];
      if (!cycle) {
        return new Response(JSON.stringify({ error: 'Failed to create cycle' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        id: cycle.id,
        name: cycle.name,
        startDate: cycle.start_date instanceof Date ? cycle.start_date.toISOString().split('T')[0] : String(cycle.start_date).split('T')[0],
        endDate: cycle.end_date instanceof Date ? cycle.end_date.toISOString().split('T')[0] : String(cycle.end_date).split('T')[0],
        teamId: cycle.team_id,
        issueCount: 0,
        doneCount: 0,
        inProgressCount: 0,
        isActive: false,
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
    console.error('Cycles error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
