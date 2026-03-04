import { test as base } from '@playwright/test'
import { neon } from '@neondatabase/serverless'

export const test = base.extend({
  page: async ({ page }, use) => {
    const databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
    if (databaseUrl) {
      const sql = neon(databaseUrl)
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority, due_date, notes) VALUES
        ('Buy groceries', false, 'high', '2026-03-10', 'Milk, eggs, bread'),
        ('Walk the dog', false, 'medium', NULL, NULL),
        ('Read a book', true, 'low', NULL, 'Finish chapter 5'),
        ('Clean the house', false, 'medium', '2026-03-07', NULL),
        ('Finish project report', true, 'high', '2026-03-05', 'Final review needed')
      `
    }
    await use(page)
  },
})

export { expect } from '@playwright/test'
