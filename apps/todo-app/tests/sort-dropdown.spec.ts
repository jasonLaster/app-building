import { test, expect } from './fixtures'
import { neon } from '@neondatabase/serverless'

function getTestSql() {
  const databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
  return databaseUrl ? neon(databaseUrl) : null
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

function getTomorrowDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

test.describe('SortDropdown', () => {
  test('Sort dropdown displays with default Newest First selected', async ({ page }) => {
    await page.goto('/')
    const trigger = page.getByTestId('sort-dropdown-trigger')
    await expect(trigger).toBeVisible({ timeout: 10000 })
    await expect(trigger).toContainText('Newest First')
  })

  test('Sort dropdown shows all four sort options', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('sort-dropdown-trigger').click()
    await expect(page.getByTestId('sort-dropdown-menu')).toBeVisible()
    await expect(page.getByTestId('sort-option-newest')).toContainText('Newest First')
    await expect(page.getByTestId('sort-option-oldest')).toContainText('Oldest First')
    await expect(page.getByTestId('sort-option-priority')).toContainText('Priority')
    await expect(page.getByTestId('sort-option-due_date')).toContainText('Due Date')
  })

  test('Sort by Newest First orders todos by creation date descending', async ({ page }) => {
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority, created_at) VALUES
        ('Task A', false, 'medium', '2026-01-01 10:00:00'),
        ('Task B', false, 'medium', '2026-01-02 10:00:00'),
        ('Task C', false, 'medium', '2026-01-03 10:00:00')
      `
    }
    await page.goto('/')
    // Default sort is Newest First
    const todoItems = page.getByTestId('todo-item')
    await expect(todoItems).toHaveCount(3, { timeout: 10000 })
    await expect(todoItems.nth(0).getByTestId('todo-text')).toContainText('Task C')
    await expect(todoItems.nth(1).getByTestId('todo-text')).toContainText('Task B')
    await expect(todoItems.nth(2).getByTestId('todo-text')).toContainText('Task A')
  })

  test('Sort by Oldest First orders todos by creation date ascending', async ({ page }) => {
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority, created_at) VALUES
        ('Task A', false, 'medium', '2026-01-01 10:00:00'),
        ('Task B', false, 'medium', '2026-01-02 10:00:00'),
        ('Task C', false, 'medium', '2026-01-03 10:00:00')
      `
    }
    await page.goto('/')
    // Switch to Oldest First
    await page.getByTestId('sort-dropdown-trigger').click()
    await page.getByTestId('sort-option-oldest').click()

    const todoItems = page.getByTestId('todo-item')
    await expect(todoItems).toHaveCount(3, { timeout: 10000 })
    await expect(todoItems.nth(0).getByTestId('todo-text')).toContainText('Task A')
    await expect(todoItems.nth(1).getByTestId('todo-text')).toContainText('Task B')
    await expect(todoItems.nth(2).getByTestId('todo-text')).toContainText('Task C')
  })

  test('Sort by Priority orders todos by priority level', async ({ page }) => {
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority) VALUES
        ('Low task', false, 'low'),
        ('High task', false, 'high'),
        ('Medium task', false, 'medium')
      `
    }
    await page.goto('/')
    await page.getByTestId('sort-dropdown-trigger').click()
    await page.getByTestId('sort-option-priority').click()

    const todoItems = page.getByTestId('todo-item')
    await expect(todoItems).toHaveCount(3, { timeout: 10000 })
    await expect(todoItems.nth(0).getByTestId('todo-text')).toContainText('High task')
    await expect(todoItems.nth(1).getByTestId('todo-text')).toContainText('Medium task')
    await expect(todoItems.nth(2).getByTestId('todo-text')).toContainText('Low task')
  })

  test('Sort by Due Date orders todos by due date', async ({ page }) => {
    const today = getTodayDate()
    const tomorrow = getTomorrowDate()
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority, due_date) VALUES
        ('Task A', false, 'medium', ${tomorrow}),
        ('Task B', false, 'medium', ${today}),
        ('Task C', false, 'medium', NULL)
      `
    }
    await page.goto('/')
    await page.getByTestId('sort-dropdown-trigger').click()
    await page.getByTestId('sort-option-due_date').click()

    const todoItems = page.getByTestId('todo-item')
    await expect(todoItems).toHaveCount(3, { timeout: 10000 })
    // Earliest due date first, null last
    await expect(todoItems.nth(0).getByTestId('todo-text')).toContainText('Task B')
    await expect(todoItems.nth(1).getByTestId('todo-text')).toContainText('Task A')
    await expect(todoItems.nth(2).getByTestId('todo-text')).toContainText('Task C')
  })

  test('Sorting works in combination with active filter', async ({ page }) => {
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority) VALUES
        ('Active Low', false, 'low'),
        ('Active High', false, 'high'),
        ('Completed One', true, 'medium'),
        ('Completed Two', true, 'low')
      `
    }
    await page.goto('/')

    // Select Active filter
    await page.getByTestId('filter-active').click()
    const todoItems = page.getByTestId('todo-item')
    await expect(todoItems).toHaveCount(2, { timeout: 10000 })

    // Select Priority sort
    await page.getByTestId('sort-dropdown-trigger').click()
    await page.getByTestId('sort-option-priority').click()

    // Only 2 active todos shown, ordered by priority
    await expect(todoItems).toHaveCount(2)
    await expect(todoItems.nth(0).getByTestId('todo-text')).toContainText('Active High')
    await expect(todoItems.nth(1).getByTestId('todo-text')).toContainText('Active Low')
  })

  test('Sort selection persists when adding a new todo', async ({ page }) => {
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority) VALUES
        ('Low task', false, 'low'),
        ('High task', false, 'high')
      `
    }
    await page.goto('/')

    // Select Priority sort
    await page.getByTestId('sort-dropdown-trigger').click()
    await page.getByTestId('sort-option-priority').click()

    const todoItems = page.getByTestId('todo-item')
    await expect(todoItems).toHaveCount(2, { timeout: 10000 })
    await expect(todoItems.nth(0).getByTestId('todo-text')).toContainText('High task')
    await expect(todoItems.nth(1).getByTestId('todo-text')).toContainText('Low task')

    // Add a new todo (defaults to medium priority)
    await page.getByTestId('add-todo-input').fill('New task')
    await page.getByTestId('add-todo-input').press('Enter')

    // Sort order maintained: High, New task (medium), Low
    await expect(todoItems).toHaveCount(3, { timeout: 10000 })
    await expect(todoItems.nth(0).getByTestId('todo-text')).toContainText('High task')
    await expect(todoItems.nth(1).getByTestId('todo-text')).toContainText('New task')
    await expect(todoItems.nth(2).getByTestId('todo-text')).toContainText('Low task')
  })
})
