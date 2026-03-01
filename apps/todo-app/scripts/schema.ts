import { neon } from '@neondatabase/serverless';

export async function initSchema(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl);
  await sql`
    CREATE TABLE IF NOT EXISTS todos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      text TEXT NOT NULL,
      completed BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const url = process.argv[2] || process.env.DATABASE_URL;
  if (!url) {
    console.error('Usage: tsx scripts/schema.ts <database-url>');
    process.exit(1);
  }
  initSchema(url).then(() => console.log('Schema initialized'));
}
