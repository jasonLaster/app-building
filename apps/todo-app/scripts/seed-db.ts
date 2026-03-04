import { neon } from '@neondatabase/serverless'

export async function seedDatabase(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl)

  await sql`
    INSERT INTO todos (title, completed, priority, due_date, notes) VALUES
    ('Buy groceries', false, 'high', '2026-03-10', 'Milk, eggs, bread'),
    ('Walk the dog', false, 'medium', NULL, NULL),
    ('Read a book', true, 'low', NULL, 'Finish chapter 5'),
    ('Clean the house', false, 'medium', '2026-03-07', NULL),
    ('Finish project report', true, 'high', '2026-03-05', 'Final review needed')
  `
}

export async function truncateAllTables(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl)
  await sql`TRUNCATE TABLE todos`
}

export async function resetDatabase(databaseUrl: string): Promise<void> {
  await truncateAllTables(databaseUrl)
  await seedDatabase(databaseUrl)
}
