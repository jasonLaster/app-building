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

function getYesterdayDate(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

test.describe('TodoList', () => {
  test('Todo item displays checkbox, text, priority badge, due date, and delete button', async ({ page }) => {
    const today = getTodayDate()
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority, due_date) VALUES
        ('Review PR', false, 'high', ${today})
      `
    }
    await page.goto('/')

    const todoItem = page.getByTestId('todo-item').filter({ hasText: 'Review PR' })
    await expect(todoItem).toBeVisible({ timeout: 10000 })

    // Checkbox is present and unchecked
    const checkbox = todoItem.getByTestId('todo-checkbox')
    await expect(checkbox).toBeVisible()

    // Text displays correctly
    await expect(todoItem.getByTestId('todo-text')).toContainText('Review PR')

    // Priority badge shows "High"
    await expect(todoItem.getByTestId('priority-badge')).toContainText('High')

    // Due date shows "Today"
    await expect(todoItem.getByTestId('due-date')).toContainText('Today')

    // Delete button is present (visible on hover)
    await todoItem.hover()
    await expect(todoItem.getByTestId('delete-button')).toBeVisible()
  })

  test('Priority badge displays correct colors for each level', async ({ page }) => {
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority) VALUES
        ('Low priority task', false, 'low'),
        ('Medium priority task', false, 'medium'),
        ('High priority task', false, 'high')
      `
    }
    await page.goto('/')

    const todoItems = page.getByTestId('todo-item')
    await expect(todoItems).toHaveCount(3, { timeout: 10000 })

    // Each priority badge has distinct styling classes
    const lowItem = page.getByTestId('todo-item').filter({ hasText: 'Low priority task' })
    const medItem = page.getByTestId('todo-item').filter({ hasText: 'Medium priority task' })
    const highItem = page.getByTestId('todo-item').filter({ hasText: 'High priority task' })

    const lowBadge = lowItem.getByTestId('priority-badge')
    const medBadge = medItem.getByTestId('priority-badge')
    const highBadge = highItem.getByTestId('priority-badge')

    await expect(lowBadge).toContainText('Low')
    await expect(medBadge).toContainText('Medium')
    await expect(highBadge).toContainText('High')

    // Verify they have distinct background colors
    const lowBg = await lowBadge.evaluate((el) => getComputedStyle(el).backgroundColor)
    const medBg = await medBadge.evaluate((el) => getComputedStyle(el).backgroundColor)
    const highBg = await highBadge.evaluate((el) => getComputedStyle(el).backgroundColor)

    expect(lowBg).not.toBe(medBg)
    expect(medBg).not.toBe(highBg)
    expect(lowBg).not.toBe(highBg)
  })

  test('Due date shows Today for todos due today', async ({ page }) => {
    const today = getTodayDate()
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority, due_date) VALUES
        ('Today task', false, 'medium', ${today})
      `
    }
    await page.goto('/')

    const todoItem = page.getByTestId('todo-item').filter({ hasText: 'Today task' })
    await expect(todoItem).toBeVisible({ timeout: 10000 })
    await expect(todoItem.getByTestId('due-date')).toContainText('Today')
  })

  test('Due date shows Tomorrow for todos due tomorrow', async ({ page }) => {
    const tomorrow = getTomorrowDate()
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority, due_date) VALUES
        ('Tomorrow task', false, 'medium', ${tomorrow})
      `
    }
    await page.goto('/')

    const todoItem = page.getByTestId('todo-item').filter({ hasText: 'Tomorrow task' })
    await expect(todoItem).toBeVisible({ timeout: 10000 })
    await expect(todoItem.getByTestId('due-date')).toContainText('Tomorrow')
  })

  test('Due date shows Overdue for todos past their due date', async ({ page }) => {
    const yesterday = getYesterdayDate()
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority, due_date) VALUES
        ('Overdue task', false, 'medium', ${yesterday})
      `
    }
    await page.goto('/')

    const todoItem = page.getByTestId('todo-item').filter({ hasText: 'Overdue task' })
    await expect(todoItem).toBeVisible({ timeout: 10000 })
    await expect(todoItem.getByTestId('due-date')).toContainText('Overdue')
  })

  test('Todo with no due date does not show a date label', async ({ page }) => {
    // Seed data has 'Walk the dog' with no due_date
    await page.goto('/')
    const todoItem = page.getByTestId('todo-item').filter({ hasText: 'Walk the dog' })
    await expect(todoItem).toBeVisible({ timeout: 10000 })
    await expect(todoItem.getByTestId('due-date')).toHaveCount(0)
  })

  test('Toggle todo completion via checkbox', async ({ page }) => {
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority) VALUES
        ('Buy milk', false, 'medium')
      `
    }
    await page.goto('/')

    const todoItem = page.getByTestId('todo-item').filter({ hasText: 'Buy milk' })
    await expect(todoItem).toBeVisible({ timeout: 10000 })

    // Verify header shows 1 item left
    await expect(page.getByTestId('todo-count')).toContainText('1 item left', { timeout: 10000 })

    // Click checkbox to complete
    await todoItem.getByTestId('todo-checkbox').click()

    // Text should get strikethrough styling
    await expect(todoItem.getByTestId('todo-text')).toHaveClass(/line-through/, { timeout: 10000 })

    // Header count should decrease
    await expect(page.getByTestId('todo-count')).toContainText('0 items left', { timeout: 10000 })
  })

  test('Uncheck a completed todo to mark it active again', async ({ page }) => {
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority) VALUES
        ('Buy milk', true, 'medium'),
        ('Another task', false, 'low')
      `
    }
    await page.goto('/')

    const todoItem = page.getByTestId('todo-item').filter({ hasText: 'Buy milk' })
    await expect(todoItem).toBeVisible({ timeout: 10000 })

    // Initially: 1 active item (Another task), so header shows "1 item left"
    await expect(page.getByTestId('todo-count')).toContainText('1 item left', { timeout: 10000 })

    // Verify completed styling initially present
    await expect(todoItem.getByTestId('todo-text')).toHaveClass(/line-through/)

    // Click checkbox to mark active
    await todoItem.getByTestId('todo-checkbox').click()

    // Strikethrough should be removed
    await expect(todoItem.getByTestId('todo-text')).not.toHaveClass(/line-through/, { timeout: 10000 })

    // Header count should increase
    await expect(page.getByTestId('todo-count')).toContainText('2 items left', { timeout: 10000 })
  })

  test('Completed todo has strikethrough text and reduced opacity', async ({ page }) => {
    // Seed data has 'Read a book' as completed
    await page.goto('/')

    const completedItem = page.getByTestId('todo-item').filter({ hasText: 'Read a book' })
    await expect(completedItem).toBeVisible({ timeout: 10000 })

    // Check strikethrough on the text
    await expect(completedItem.getByTestId('todo-text')).toHaveClass(/line-through/)

    // Check reduced opacity on the todo item container
    await expect(completedItem).toHaveClass(/opacity-60/)
  })

  test('Delete button appears on hover', async ({ page }) => {
    // Seed data has 'Clean the house'
    await page.goto('/')

    const todoItem = page.getByTestId('todo-item').filter({ hasText: 'Clean the house' })
    await expect(todoItem).toBeVisible({ timeout: 10000 })

    // Delete button has opacity-0 by default (hidden via CSS)
    const deleteButton = todoItem.getByTestId('delete-button')
    await expect(deleteButton).toHaveCSS('opacity', '0')

    // Hover over the todo item to reveal the delete button
    await todoItem.hover()
    await expect(deleteButton).toHaveCSS('opacity', '1', { timeout: 5000 })
  })

  test('Delete a todo with confirmation', async ({ page }) => {
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority) VALUES
        ('Clean house', false, 'medium'),
        ('Task two', false, 'low'),
        ('Task three', false, 'high')
      `
    }
    await page.goto('/')

    const todoItems = page.getByTestId('todo-item')
    await expect(todoItems).toHaveCount(3, { timeout: 10000 })

    // Header shows 3 items left
    await expect(page.getByTestId('todo-count')).toContainText('3 items left', { timeout: 10000 })

    // Set up dialog handler to accept confirmation
    page.on('dialog', (dialog) => dialog.accept())

    // Hover and click delete
    const todoItem = page.getByTestId('todo-item').filter({ hasText: 'Clean house' })
    await todoItem.hover()
    await todoItem.getByTestId('delete-button').click()

    // Todo should be removed from the list
    await expect(
      page.getByTestId('todo-item').filter({ hasText: 'Clean house' })
    ).toHaveCount(0, { timeout: 10000 })

    // 2 todos remain
    await expect(todoItems).toHaveCount(2, { timeout: 10000 })

    // Header count decreased
    await expect(page.getByTestId('todo-count')).toContainText('2 items left', { timeout: 10000 })
  })

  test('Cancel todo deletion via confirmation prompt', async ({ page }) => {
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority) VALUES
        ('Clean house', false, 'medium'),
        ('Task two', false, 'low'),
        ('Task three', false, 'high')
      `
    }
    await page.goto('/')

    const todoItems = page.getByTestId('todo-item')
    await expect(todoItems).toHaveCount(3, { timeout: 10000 })

    // Set up dialog handler to dismiss/cancel confirmation
    page.on('dialog', (dialog) => dialog.dismiss())

    // Hover and click delete
    const todoItem = page.getByTestId('todo-item').filter({ hasText: 'Clean house' })
    await todoItem.hover()
    await todoItem.getByTestId('delete-button').click()

    // Todo should still be in the list
    await expect(
      page.getByTestId('todo-item').filter({ hasText: 'Clean house' })
    ).toBeVisible({ timeout: 10000 })

    // All 3 todos remain
    await expect(todoItems).toHaveCount(3)
  })

  test('Clicking todo text opens the Edit Todo Modal', async ({ page }) => {
    const tomorrow = getTomorrowDate()
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
      await sql`
        INSERT INTO todos (title, completed, priority, due_date, notes) VALUES
        ('Write report', false, 'high', ${tomorrow}, 'Include Q4 data')
      `
    }
    await page.goto('/')

    // Click on the todo text
    await page.getByTestId('todo-text').filter({ hasText: 'Write report' }).click()

    // Modal should open with pre-filled values
    await expect(page.getByTestId('edit-modal')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('edit-title')).toHaveValue('Write report')
    await expect(page.getByTestId('edit-priority')).toContainText('High')
    await expect(page.getByTestId('edit-due-date')).toHaveValue(tomorrow)
    await expect(page.getByTestId('edit-notes')).toHaveValue('Include Q4 data')
  })

  test('Empty state when no todos exist', async ({ page }) => {
    const sql = getTestSql()
    if (sql) {
      await sql`TRUNCATE TABLE todos`
    }
    await page.goto('/')

    const todoList = page.getByTestId('todo-list')
    await expect(todoList).toBeVisible({ timeout: 10000 })

    // No todo items should exist
    await expect(page.getByTestId('todo-item')).toHaveCount(0)

    // Should show the empty state message
    await expect(todoList).toContainText('No todos yet')
  })
})
