import { neon } from '@neondatabase/serverless';
import { randomBytes, pbkdf2Sync } from 'crypto';

export async function truncateAndSeed(databaseUrl: string) {
  const sql = neon(databaseUrl);

  // Truncate all tables in dependency order
  await sql`TRUNCATE project_activity, project_milestones, notifications, activity, comments, issue_labels, issues, cycles, team_members, sessions, projects, labels, teams, members, workspaces CASCADE`;

  await seedDatabase(databaseUrl);
}

export async function seedDatabase(databaseUrl: string) {
  const sql = neon(databaseUrl);

  // Helper to hash passwords
  function hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return { hash, salt };
  }

  // Create workspace
  const wsRows = await sql`
    INSERT INTO workspaces (name) VALUES ('Acme Corp')
    RETURNING id
  `;
  const _workspaceId = wsRows[0]?.id;

  // Create members
  const pw1 = hashPassword('password123');
  const pw2 = hashPassword('password123');
  const pw3 = hashPassword('password123');

  const m1Rows = await sql`
    INSERT INTO members (name, email, password_hash, password_salt, role)
    VALUES ('Alice Johnson', 'alice@acme.com', ${pw1.hash}, ${pw1.salt}, 'admin')
    RETURNING id
  `;
  const m2Rows = await sql`
    INSERT INTO members (name, email, password_hash, password_salt, role)
    VALUES ('Bob Smith', 'bob@acme.com', ${pw2.hash}, ${pw2.salt}, 'member')
    RETURNING id
  `;
  const m3Rows = await sql`
    INSERT INTO members (name, email, password_hash, password_salt, role)
    VALUES ('Carol Davis', 'carol@acme.com', ${pw3.hash}, ${pw3.salt}, 'member')
    RETURNING id
  `;

  const aliceId = m1Rows[0]?.id;
  const bobId = m2Rows[0]?.id;
  const carolId = m3Rows[0]?.id;

  // Create teams
  const t1Rows = await sql`
    INSERT INTO teams (name, identifier, description)
    VALUES ('Engineering', 'ENG', 'Core product engineering team')
    RETURNING id
  `;
  const t2Rows = await sql`
    INSERT INTO teams (name, identifier, description)
    VALUES ('Design', 'DES', 'Product design and UX team')
    RETURNING id
  `;

  const engId = t1Rows[0]?.id;
  const desId = t2Rows[0]?.id;

  // Set default team on workspace
  await sql`UPDATE workspaces SET default_team_id = ${engId} WHERE name = 'Acme Corp'`;

  // Team members
  await sql`INSERT INTO team_members (team_id, member_id) VALUES (${engId}, ${aliceId})`;
  await sql`INSERT INTO team_members (team_id, member_id) VALUES (${engId}, ${bobId})`;
  await sql`INSERT INTO team_members (team_id, member_id) VALUES (${engId}, ${carolId})`;
  await sql`INSERT INTO team_members (team_id, member_id) VALUES (${desId}, ${aliceId})`;
  await sql`INSERT INTO team_members (team_id, member_id) VALUES (${desId}, ${carolId})`;

  // Create labels
  const l1Rows = await sql`INSERT INTO labels (name, color) VALUES ('Bug', '#ef4444') RETURNING id`;
  const l2Rows = await sql`INSERT INTO labels (name, color) VALUES ('Feature', '#22c55e') RETURNING id`;
  const l3Rows = await sql`INSERT INTO labels (name, color) VALUES ('Improvement', '#3b82f6') RETURNING id`;
  const l4Rows = await sql`INSERT INTO labels (name, color) VALUES ('Documentation', '#a855f7') RETURNING id`;

  const bugLabelId = l1Rows[0]?.id;
  const featureLabelId = l2Rows[0]?.id;
  const improvementLabelId = l3Rows[0]?.id;
  const docLabelId = l4Rows[0]?.id;

  // Create project
  const p1Rows = await sql`
    INSERT INTO projects (name, description, status, target_date, lead_id)
    VALUES ('V2 Launch', 'Version 2.0 product launch with new features', 'in_progress', '2026-06-30', ${aliceId})
    RETURNING id
  `;
  const projectId = p1Rows[0]?.id;

  // Create cycle
  const c1Rows = await sql`
    INSERT INTO cycles (name, start_date, end_date, team_id, status)
    VALUES ('Sprint 12', '2026-03-10', '2026-03-24', ${engId}, 'active')
    RETURNING id
  `;
  const cycleId = c1Rows[0]?.id;

  // Create issues for Engineering team
  const issueData = [
    { title: 'Fix login session expiration bug', status: 'in_progress', priority: 'high', number: 1, assigneeId: aliceId, projectId, cycleId, labelId: bugLabelId },
    { title: 'Implement real-time notifications', status: 'todo', priority: 'medium', number: 2, assigneeId: bobId, projectId, cycleId, labelId: featureLabelId },
    { title: 'Add dark mode toggle', status: 'backlog', priority: 'low', number: 3, assigneeId: null, projectId, cycleId: null, labelId: featureLabelId },
    { title: 'Optimize database queries for issue list', status: 'in_review', priority: 'high', number: 4, assigneeId: carolId, projectId, cycleId, labelId: improvementLabelId },
    { title: 'Write API documentation', status: 'done', priority: 'medium', number: 5, assigneeId: bobId, projectId: null, cycleId: null, labelId: docLabelId },
    { title: 'Fix broken pagination on team view', status: 'todo', priority: 'urgent', number: 6, assigneeId: aliceId, projectId, cycleId, labelId: bugLabelId },
    { title: 'Add keyboard shortcuts help modal', status: 'backlog', priority: 'none', number: 7, assigneeId: null, projectId: null, cycleId: null, labelId: improvementLabelId },
    { title: 'Implement issue search with fuzzy matching', status: 'in_progress', priority: 'medium', number: 8, assigneeId: bobId, projectId, cycleId, labelId: featureLabelId },
  ];

  for (const issue of issueData) {
    const rows = await sql`
      INSERT INTO issues (team_id, title, status, priority, number, assignee_id, project_id, cycle_id)
      VALUES (${engId}, ${issue.title}, ${issue.status}, ${issue.priority}, ${issue.number},
              ${issue.assigneeId}, ${issue.projectId}, ${issue.cycleId})
      RETURNING id
    `;
    const issueId = rows[0]?.id;
    if (issueId && issue.labelId) {
      await sql`INSERT INTO issue_labels (issue_id, label_id) VALUES (${issueId}, ${issue.labelId})`;
    }
  }

  // Create issues for Design team
  const designIssues = [
    { title: 'Redesign settings page', status: 'in_progress', priority: 'medium', number: 1, assigneeId: carolId, labelId: improvementLabelId },
    { title: 'Create icon set for issue priorities', status: 'done', priority: 'high', number: 2, assigneeId: carolId, labelId: featureLabelId },
    { title: 'Design empty states for all pages', status: 'todo', priority: 'low', number: 3, assigneeId: aliceId, labelId: improvementLabelId },
  ];

  for (const issue of designIssues) {
    const rows = await sql`
      INSERT INTO issues (team_id, title, status, priority, number, assignee_id, project_id)
      VALUES (${desId}, ${issue.title}, ${issue.status}, ${issue.priority}, ${issue.number},
              ${issue.assigneeId}, ${projectId})
      RETURNING id
    `;
    const issueId = rows[0]?.id;
    if (issueId && issue.labelId) {
      await sql`INSERT INTO issue_labels (issue_id, label_id) VALUES (${issueId}, ${issue.labelId})`;
    }
  }

  // Create project milestones
  await sql`
    INSERT INTO project_milestones (project_id, name, target_date, completed)
    VALUES (${projectId}, 'API Complete', '2026-04-15', false)
  `;
  await sql`
    INSERT INTO project_milestones (project_id, name, target_date, completed)
    VALUES (${projectId}, 'Beta Launch', '2026-05-30', false)
  `;

  // Create some notifications for Alice
  const firstEngIssueRows = await sql`SELECT id FROM issues WHERE team_id = ${engId} AND number = 2 LIMIT 1`;
  const notifIssueId = firstEngIssueRows[0]?.id;

  if (notifIssueId) {
    await sql`
      INSERT INTO notifications (member_id, type, message, issue_id, read, archived, created_at)
      VALUES (${aliceId}, 'assignment', 'You were assigned to this issue', ${notifIssueId}, false, false, NOW() - INTERVAL '5 minutes')
    `;
    await sql`
      INSERT INTO notifications (member_id, type, message, issue_id, read, archived, created_at)
      VALUES (${aliceId}, 'update', 'Status changed to In Progress', ${notifIssueId}, false, false, NOW() - INTERVAL '1 hour')
    `;
    await sql`
      INSERT INTO notifications (member_id, type, message, issue_id, read, archived, created_at)
      VALUES (${aliceId}, 'mention', 'Carol mentioned you in a comment', ${notifIssueId}, true, false, NOW() - INTERVAL '1 day')
    `;
  }

  console.log('Database seeded successfully');
}

export async function resetDatabase(databaseUrl: string) {
  await truncateAndSeed(databaseUrl);
}

// CLI
const url = process.argv[2];
if (url) {
  truncateAndSeed(url).then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
