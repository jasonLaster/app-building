import { test, expect } from './fixtures'

test.describe('FilterBar', () => {
  test('Filter bar displays All, Active, and Completed buttons', async ({ page }) => {
    await page.goto('/')
    const filterBar = page.getByTestId('filter-bar')
    await expect(filterBar).toBeVisible({ timeout: 10000 })

    await expect(page.getByTestId('filter-all')).toBeVisible()
    await expect(page.getByTestId('filter-all')).toContainText('All')
    await expect(page.getByTestId('filter-active')).toBeVisible()
    await expect(page.getByTestId('filter-active')).toContainText('Active')
    await expect(page.getByTestId('filter-completed')).toBeVisible()
    await expect(page.getByTestId('filter-completed')).toContainText('Completed')

    // "All" button is highlighted by default (has bg-primary class)
    await expect(page.getByTestId('filter-all')).toHaveClass(/bg-primary/)
  })

  test('"All" filter shows all todos', async ({ page }) => {
    // Seed has 3 active + 2 completed = 5 total
    await page.goto('/')
    const todoItems = page.getByTestId('todo-item')
    await expect(todoItems).toHaveCount(5, { timeout: 10000 })
  })

  test('"Active" filter shows only incomplete todos', async ({ page }) => {
    await page.goto('/')
    const todoItems = page.getByTestId('todo-item')
    await expect(todoItems).toHaveCount(5, { timeout: 10000 })

    // Click Active filter
    await page.getByTestId('filter-active').click()

    // Only 3 active todos should be visible
    await expect(todoItems).toHaveCount(3, { timeout: 10000 })

    // Active filter button should be highlighted
    await expect(page.getByTestId('filter-active')).toHaveClass(/bg-primary/)
  })

  test('"Completed" filter shows only completed todos', async ({ page }) => {
    await page.goto('/')
    const todoItems = page.getByTestId('todo-item')
    await expect(todoItems).toHaveCount(5, { timeout: 10000 })

    // Click Completed filter
    await page.getByTestId('filter-completed').click()

    // Only 2 completed todos should be visible
    await expect(todoItems).toHaveCount(2, { timeout: 10000 })

    // Completed filter button should be highlighted
    await expect(page.getByTestId('filter-completed')).toHaveClass(/bg-primary/)
  })

  test('Selected filter button is visually highlighted', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('filter-bar')).toBeVisible({ timeout: 10000 })

    // Initially "All" is highlighted
    await expect(page.getByTestId('filter-all')).toHaveClass(/bg-primary/)
    await expect(page.getByTestId('filter-active')).not.toHaveClass(/bg-primary/)
    await expect(page.getByTestId('filter-completed')).not.toHaveClass(/bg-primary/)

    // Click "Active" - only Active should be highlighted
    await page.getByTestId('filter-active').click()
    await expect(page.getByTestId('filter-active')).toHaveClass(/bg-primary/)
    await expect(page.getByTestId('filter-all')).not.toHaveClass(/bg-primary/)
    await expect(page.getByTestId('filter-completed')).not.toHaveClass(/bg-primary/)

    // Click "Completed" - only Completed should be highlighted
    await page.getByTestId('filter-completed').click()
    await expect(page.getByTestId('filter-completed')).toHaveClass(/bg-primary/)
    await expect(page.getByTestId('filter-all')).not.toHaveClass(/bg-primary/)
    await expect(page.getByTestId('filter-active')).not.toHaveClass(/bg-primary/)

    // Click "All" - only All should be highlighted
    await page.getByTestId('filter-all').click()
    await expect(page.getByTestId('filter-all')).toHaveClass(/bg-primary/)
    await expect(page.getByTestId('filter-active')).not.toHaveClass(/bg-primary/)
    await expect(page.getByTestId('filter-completed')).not.toHaveClass(/bg-primary/)
  })

  test('Switching from Active filter back to All shows all todos again', async ({ page }) => {
    await page.goto('/')
    const todoItems = page.getByTestId('todo-item')
    await expect(todoItems).toHaveCount(5, { timeout: 10000 })

    // Switch to Active filter
    await page.getByTestId('filter-active').click()
    await expect(todoItems).toHaveCount(3, { timeout: 10000 })

    // Switch back to All
    await page.getByTestId('filter-all').click()
    await expect(todoItems).toHaveCount(5, { timeout: 10000 })

    // All button should be highlighted
    await expect(page.getByTestId('filter-all')).toHaveClass(/bg-primary/)
  })

  test('Clear Completed button removes all completed todos', async ({ page }) => {
    await page.goto('/')
    const todoItems = page.getByTestId('todo-item')
    await expect(todoItems).toHaveCount(5, { timeout: 10000 })

    // Click Clear Completed
    await page.getByTestId('clear-completed').click()

    // Only 3 active todos should remain
    await expect(todoItems).toHaveCount(3, { timeout: 10000 })

    // Verify completed todos are gone - check that "Read a book" and "Finish project report" are removed
    await expect(
      page.getByTestId('todo-item').filter({ hasText: 'Read a book' })
    ).toHaveCount(0)
    await expect(
      page.getByTestId('todo-item').filter({ hasText: 'Finish project report' })
    ).toHaveCount(0)
  })

  test('Clear Completed button is visible in the filter bar', async ({ page }) => {
    // Seed data has completed todos, so the button should be visible
    await page.goto('/')
    await expect(page.getByTestId('filter-bar')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('clear-completed')).toBeVisible()
    await expect(page.getByTestId('clear-completed')).toContainText('Clear Completed')
  })

  test('Filter persists when a todo is toggled', async ({ page }) => {
    await page.goto('/')
    const todoItems = page.getByTestId('todo-item')
    await expect(todoItems).toHaveCount(5, { timeout: 10000 })

    // Select Active filter - shows 3 active todos
    await page.getByTestId('filter-active').click()
    await expect(todoItems).toHaveCount(3, { timeout: 10000 })

    // Toggle one active todo to completed by clicking its checkbox
    const firstCheckbox = todoItems.first().getByTestId('todo-checkbox')
    await firstCheckbox.click()

    // The toggled todo should disappear from Active filter view, leaving 2
    await expect(todoItems).toHaveCount(2, { timeout: 10000 })
  })

  test('Completing a todo while Completed filter is active shows it in the list', async ({ page }) => {
    await page.goto('/')
    const todoItems = page.getByTestId('todo-item')
    await expect(todoItems).toHaveCount(5, { timeout: 10000 })

    // Switch to Completed filter - shows 2 completed todos
    await page.getByTestId('filter-completed').click()
    await expect(todoItems).toHaveCount(2, { timeout: 10000 })

    // Switch to All filter and complete an active todo
    await page.getByTestId('filter-all').click()
    await expect(todoItems).toHaveCount(5, { timeout: 10000 })

    // Find an active todo and check it - use "Buy groceries" which is active
    const buyGroceries = page.getByTestId('todo-item').filter({ hasText: 'Buy groceries' })
    await buyGroceries.getByTestId('todo-checkbox').click()

    // Wait for the toggle to take effect
    await expect(buyGroceries.getByTestId('todo-text')).toHaveClass(/line-through/, { timeout: 10000 })

    // Switch back to Completed filter - should now show 3 completed todos
    await page.getByTestId('filter-completed').click()
    await expect(todoItems).toHaveCount(3, { timeout: 10000 })
  })
})
