import { test, expect } from './fixtures'
import { neon } from '@neondatabase/serverless'

function getTestSql() {
  const databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
  return databaseUrl ? neon(databaseUrl) : null
}

test.describe('Header', () => {
  test('Header displays app title', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('app-title')).toContainText('Todo App', { timeout: 10000 })
  })

  test('Header shows count of incomplete todos when some are active', async ({ page }) => {
    // Seed data: 3 active, 2 completed
    await page.goto('/')
    await expect(page.getByTestId('todo-count')).toContainText('3 items left', { timeout: 10000 })
  })

  test('Header shows zero count when all todos are completed', async ({ page }) => {
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority) VALUES
        ('Task A', true, 'medium'),
        ('Task B', true, 'low'),
        ('Task C', true, 'high')
      `
    }
    await page.goto('/')
    await expect(page.getByTestId('todo-count')).toContainText('0 items left', { timeout: 10000 })
  })

  test('Header shows correct count with singular item', async ({ page }) => {
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority) VALUES
        ('Active task', false, 'medium'),
        ('Done task', true, 'low')
      `
    }
    await page.goto('/')
    await expect(page.getByTestId('todo-count')).toContainText('1 item left', { timeout: 10000 })
  })

  test('Header count updates when a todo is toggled complete', async ({ page }) => {
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority) VALUES
        ('Task one', false, 'medium'),
        ('Task two', false, 'low'),
        ('Task three', false, 'high')
      `
    }
    await page.goto('/')
    await expect(page.getByTestId('todo-count')).toContainText('3 items left', { timeout: 10000 })

    // Toggle one todo complete
    const todoItem = page.getByTestId('todo-item').first()
    await todoItem.getByTestId('todo-checkbox').click()

    await expect(page.getByTestId('todo-count')).toContainText('2 items left', { timeout: 10000 })
  })

  test('Header count updates when a todo is toggled back to active', async ({ page }) => {
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority) VALUES
        ('Active one', false, 'medium'),
        ('Active two', false, 'low'),
        ('Completed one', true, 'high')
      `
    }
    await page.goto('/')
    await expect(page.getByTestId('todo-count')).toContainText('2 items left', { timeout: 10000 })

    // Toggle the completed todo back to active
    const completedItem = page.getByTestId('todo-item').filter({ hasText: 'Completed one' })
    await completedItem.getByTestId('todo-checkbox').click()

    await expect(page.getByTestId('todo-count')).toContainText('3 items left', { timeout: 10000 })
  })

  test('Header count updates when a new todo is added', async ({ page }) => {
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority) VALUES
        ('Existing one', false, 'medium'),
        ('Existing two', false, 'low')
      `
    }
    await page.goto('/')
    await expect(page.getByTestId('todo-count')).toContainText('2 items left', { timeout: 10000 })

    // Add a new todo
    const input = page.getByTestId('add-todo-input')
    await input.fill('New task')
    await input.press('Enter')

    await expect(page.getByTestId('todo-count')).toContainText('3 items left', { timeout: 10000 })
  })

  test('Header count updates when a todo is deleted', async ({ page }) => {
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority) VALUES
        ('Task one', false, 'medium'),
        ('Task two', false, 'low'),
        ('Task three', false, 'high')
      `
    }
    await page.goto('/')
    await expect(page.getByTestId('todo-count')).toContainText('3 items left', { timeout: 10000 })

    // Accept the confirmation dialog
    page.on('dialog', (dialog) => dialog.accept())

    // Hover and delete the first todo
    const todoItem = page.getByTestId('todo-item').first()
    await todoItem.hover()
    await todoItem.getByTestId('delete-button').click()

    await expect(page.getByTestId('todo-count')).toContainText('2 items left', { timeout: 10000 })
  })
})

test.describe('AddTodo', () => {
  test('Add todo input displays placeholder text', async ({ page }) => {
    await page.goto('/')
    const input = page.getByTestId('add-todo-input')
    await expect(input).toBeVisible({ timeout: 10000 })
    await expect(input).toHaveAttribute('placeholder', 'What needs to be done?')
  })

  test('Create a new todo by pressing Enter', async ({ page }) => {
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority) VALUES
        ('Existing task', false, 'medium')
      `
    }
    await page.goto('/')
    await expect(page.getByTestId('todo-count')).toContainText('1 item left', { timeout: 10000 })

    // Type and press Enter
    const input = page.getByTestId('add-todo-input')
    await input.fill('Buy groceries')
    await input.press('Enter')

    // New todo appears in the list
    await expect(
      page.getByTestId('todo-item').filter({ hasText: 'Buy groceries' })
    ).toBeVisible({ timeout: 10000 })

    // Input is cleared
    await expect(input).toHaveValue('')

    // New todo is active with Medium priority
    const newTodo = page.getByTestId('todo-item').filter({ hasText: 'Buy groceries' })
    await expect(newTodo.getByTestId('priority-badge')).toContainText('Medium')

    // Header count incremented
    await expect(page.getByTestId('todo-count')).toContainText('2 items left', { timeout: 10000 })
  })

  test('Pressing Enter with empty input does not create a todo', async ({ page }) => {
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority) VALUES
        ('Task one', false, 'medium'),
        ('Task two', false, 'low')
      `
    }
    await page.goto('/')
    await expect(page.getByTestId('todo-item')).toHaveCount(2, { timeout: 10000 })
    await expect(page.getByTestId('todo-count')).toContainText('2 items left', { timeout: 10000 })

    // Press Enter with empty input
    const input = page.getByTestId('add-todo-input')
    await input.focus()
    await input.press('Enter')

    // No new todo created
    await expect(page.getByTestId('todo-item')).toHaveCount(2)
    await expect(page.getByTestId('todo-count')).toContainText('2 items left')
  })

  test('Pressing Enter with whitespace-only input does not create a todo', async ({ page }) => {
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority) VALUES
        ('Task one', false, 'medium')
      `
    }
    await page.goto('/')
    await expect(page.getByTestId('todo-item')).toHaveCount(1, { timeout: 10000 })

    // Type whitespace only and press Enter
    const input = page.getByTestId('add-todo-input')
    await input.fill('   ')
    await input.press('Enter')

    // No new todo created
    await expect(page.getByTestId('todo-item')).toHaveCount(1)
  })

  test('Input clears after successfully creating a todo', async ({ page }) => {
    await page.goto('/')

    const input = page.getByTestId('add-todo-input')
    await expect(input).toBeVisible({ timeout: 10000 })
    await input.fill('Walk the dog')
    await input.press('Enter')

    // Input should be cleared after creating the todo
    await expect(input).toHaveValue('', { timeout: 10000 })
  })

  test('New todo appears at the top of the list', async ({ page }) => {
    await page.goto('/')
    // Wait for todos to load
    await expect(page.getByTestId('todo-item').first()).toBeVisible({ timeout: 10000 })
    const initialCount = await page.getByTestId('todo-item').count()

    // Add a new todo
    const input = page.getByTestId('add-todo-input')
    await input.fill('New task')
    await input.press('Enter')

    // Wait for the new todo to appear
    await expect(page.getByTestId('todo-item')).toHaveCount(initialCount + 1, { timeout: 10000 })

    // New task should be the first item in the list
    const firstTodoText = page.getByTestId('todo-item').first().getByTestId('todo-text')
    await expect(firstTodoText).toContainText('New task')
  })
})
