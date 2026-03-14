import { neon } from '@neondatabase/serverless';

export async function initSchema(databaseUrl: string) {
  const sql = neon(databaseUrl);

  // Workspaces
  await sql`
    CREATE TABLE IF NOT EXISTS workspaces (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL DEFAULT 'My Workspace',
      default_team_id UUID
    )
  `;

  // Members
  await sql`
    CREATE TABLE IF NOT EXISTS members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  // Sessions
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL
    )
  `;

  // Teams
  await sql`
    CREATE TABLE IF NOT EXISTS teams (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      identifier TEXT NOT NULL UNIQUE,
      description TEXT
    )
  `;

  // Add FK for workspace default_team_id after teams table exists
  await sql`
    DO $$ BEGIN
      ALTER TABLE workspaces
        ADD CONSTRAINT fk_workspaces_default_team
        FOREIGN KEY (default_team_id) REFERENCES teams(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `;

  // Team members
  await sql`
    CREATE TABLE IF NOT EXISTS team_members (
      team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      PRIMARY KEY (team_id, member_id)
    )
  `;

  // Labels
  await sql`
    CREATE TABLE IF NOT EXISTS labels (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL
    )
  `;

  // Projects
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'planned',
      target_date DATE,
      lead_id UUID REFERENCES members(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  // Cycles
  await sql`
    CREATE TABLE IF NOT EXISTS cycles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'active'
    )
  `;

  // Issues
  await sql`
    CREATE TABLE IF NOT EXISTS issues (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'backlog',
      priority TEXT NOT NULL DEFAULT 'none',
      number INT NOT NULL,
      due_date DATE,
      assignee_id UUID REFERENCES members(id) ON DELETE SET NULL,
      project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
      cycle_id UUID REFERENCES cycles(id) ON DELETE SET NULL,
      parent_id UUID REFERENCES issues(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  // Issue labels junction
  await sql`
    CREATE TABLE IF NOT EXISTS issue_labels (
      issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
      label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
      PRIMARY KEY (issue_id, label_id)
    )
  `;

  // Comments
  await sql`
    CREATE TABLE IF NOT EXISTS comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
      member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  // Activity log
  await sql`
    CREATE TABLE IF NOT EXISTS activity (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
      member_id UUID REFERENCES members(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      field TEXT,
      new_value TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  // Notifications
  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
      read BOOLEAN NOT NULL DEFAULT false,
      archived BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  // Project milestones
  await sql`
    CREATE TABLE IF NOT EXISTS project_milestones (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      target_date DATE,
      completed BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  // Project activity
  await sql`
    CREATE TABLE IF NOT EXISTS project_activity (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      member_id UUID REFERENCES members(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  // Migrations: add columns that CREATE TABLE IF NOT EXISTS can't detect
  await sql`DO $$ BEGIN ALTER TABLE issues ADD COLUMN parent_id UUID REFERENCES issues(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_column THEN NULL; END $$`;
  await sql`DO $$ BEGIN ALTER TABLE activity ADD COLUMN field TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$`;
  await sql`DO $$ BEGIN ALTER TABLE activity ADD COLUMN new_value TEXT; EXCEPTION WHEN duplicate_column THEN NULL; END $$`;
  await sql`DO $$ BEGIN ALTER TABLE notifications ADD COLUMN archived BOOLEAN NOT NULL DEFAULT false; EXCEPTION WHEN duplicate_column THEN NULL; END $$`;
  await sql`DO $$ BEGIN ALTER TABLE members ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(); EXCEPTION WHEN duplicate_column THEN NULL; END $$`;

  // Indexes for common queries
  await sql`CREATE INDEX IF NOT EXISTS idx_issues_team_id ON issues(team_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_issues_assignee_id ON issues(assignee_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_issues_project_id ON issues(project_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_issues_cycle_id ON issues(cycle_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_issues_parent_id ON issues(parent_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_issue_labels_issue_id ON issue_labels(issue_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_issue_labels_label_id ON issue_labels(label_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_team_members_member_id ON team_members(member_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sessions_member_id ON sessions(member_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_comments_issue_id ON comments(issue_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_activity_issue_id ON activity(issue_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_notifications_member_id ON notifications(member_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id ON project_milestones(project_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_project_activity_project_id ON project_activity(project_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_cycles_team_id ON cycles(team_id)`;
}

// CLI: run schema with a database URL argument
const url = process.argv[2];
if (url) {
  initSchema(url).then(() => {
    console.log('Schema initialized successfully');
    process.exit(0);
  }).catch((err) => {
    console.error('Schema initialization failed:', err);
    process.exit(1);
  });
}
