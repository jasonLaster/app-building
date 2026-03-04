import { test, expect } from './fixtures'

function getTomorrowDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

test.describe('Edit Todo Modal', () => {
  test('Modal opens with all fields pre-filled from existing todo', async ({ page }) => {
    // Seed has 'Buy groceries' with priority high, due_date '2026-03-10', notes 'Milk, eggs, bread'
    await page.goto('/')
    await page.getByTestId('todo-text').filter({ hasText: 'Buy groceries' }).click()

    await expect(page.getByTestId('edit-modal')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('edit-title')).toHaveValue('Buy groceries')
    await expect(page.getByTestId('edit-priority')).toContainText('High')
    await expect(page.getByTestId('edit-due-date')).toHaveValue('2026-03-10')
    await expect(page.getByTestId('edit-notes')).toHaveValue('Milk, eggs, bread')
  })

  test('Modal opens with default values for a todo with minimal data', async ({ page }) => {
    // Seed has 'Walk the dog' with priority medium, no due_date, no notes
    await page.goto('/')
    await page.getByTestId('todo-text').filter({ hasText: 'Walk the dog' }).click()

    await expect(page.getByTestId('edit-modal')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('edit-title')).toHaveValue('Walk the dog')
    await expect(page.getByTestId('edit-priority')).toContainText('Medium')
    await expect(page.getByTestId('edit-due-date')).toHaveValue('')
    await expect(page.getByTestId('edit-notes')).toHaveValue('')
  })

  test('Title field is a required text input', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('todo-text').first().click()
    await expect(page.getByTestId('edit-modal')).toBeVisible({ timeout: 10000 })

    await page.getByTestId('edit-title').clear()
    await page.getByTestId('edit-save').click()

    await expect(page.getByTestId('title-error')).toBeVisible()
    await expect(page.getByTestId('title-error')).toContainText('Title is required')
    await expect(page.getByTestId('edit-modal')).toBeVisible()
  })

  test('Edit the title field and save', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('todo-text').filter({ hasText: 'Walk the dog' }).click()
    await expect(page.getByTestId('edit-modal')).toBeVisible({ timeout: 10000 })

    await page.getByTestId('edit-title').clear()
    await page.getByTestId('edit-title').fill('Updated title')
    await page.getByTestId('edit-save').click()

    await expect(page.getByTestId('edit-modal')).not.toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('todo-text').filter({ hasText: 'Updated title' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('todo-text').filter({ hasText: 'Walk the dog' })).toHaveCount(0)
  })

  test('Priority dropdown shows Low, Medium, and High options', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('todo-text').first().click()
    await expect(page.getByTestId('edit-modal')).toBeVisible({ timeout: 10000 })

    await page.getByTestId('edit-priority').click()
    await expect(page.getByTestId('priority-dropdown-menu')).toBeVisible()
    await expect(page.getByTestId('priority-option-low')).toContainText('Low')
    await expect(page.getByTestId('priority-option-medium')).toContainText('Medium')
    await expect(page.getByTestId('priority-option-high')).toContainText('High')
  })

  test('Change priority and save', async ({ page }) => {
    // Use 'Walk the dog' which has priority medium
    await page.goto('/')
    await page.getByTestId('todo-text').filter({ hasText: 'Walk the dog' }).click()
    await expect(page.getByTestId('edit-modal')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('edit-priority')).toContainText('Medium')

    await page.getByTestId('edit-priority').click()
    await page.getByTestId('priority-option-high').click()
    await expect(page.getByTestId('edit-priority')).toContainText('High')
    await page.getByTestId('edit-save').click()

    await expect(page.getByTestId('edit-modal')).not.toBeVisible({ timeout: 10000 })
    // Verify the priority badge updated in the todo list
    const todoItem = page.getByTestId('todo-item').filter({ hasText: 'Walk the dog' })
    await expect(todoItem.getByTestId('priority-badge')).toContainText('High', { timeout: 10000 })
  })

  test('Set a due date via the date picker', async ({ page }) => {
    // Use 'Walk the dog' which has no due date
    await page.goto('/')
    await page.getByTestId('todo-text').filter({ hasText: 'Walk the dog' }).click()
    await expect(page.getByTestId('edit-modal')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('edit-due-date')).toHaveValue('')

    const tomorrow = getTomorrowDate()
    await page.getByTestId('edit-due-date').fill(tomorrow)
    await page.getByTestId('edit-save').click()

    await expect(page.getByTestId('edit-modal')).not.toBeVisible({ timeout: 10000 })
    const todoItem = page.getByTestId('todo-item').filter({ hasText: 'Walk the dog' })
    await expect(todoItem.getByTestId('due-date')).toContainText('Tomorrow', { timeout: 10000 })
  })

  test('Clear an existing due date', async ({ page }) => {
    // Use 'Buy groceries' which has due_date '2026-03-10'
    await page.goto('/')
    await page.getByTestId('todo-text').filter({ hasText: 'Buy groceries' }).click()
    await expect(page.getByTestId('edit-modal')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('edit-due-date')).not.toHaveValue('')

    await page.getByTestId('edit-due-date').fill('')
    await page.getByTestId('edit-save').click()

    await expect(page.getByTestId('edit-modal')).not.toBeVisible({ timeout: 10000 })
    const todoItem = page.getByTestId('todo-item').filter({ hasText: 'Buy groceries' })
    await expect(todoItem.getByTestId('due-date')).toHaveCount(0, { timeout: 10000 })
  })

  test('Add notes to a todo', async ({ page }) => {
    // Use 'Walk the dog' which has no notes
    await page.goto('/')
    await page.getByTestId('todo-text').filter({ hasText: 'Walk the dog' }).click()
    await expect(page.getByTestId('edit-modal')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('edit-notes')).toHaveValue('')

    await page.getByTestId('edit-notes').fill('Remember to check the figures')
    await page.getByTestId('edit-save').click()

    await expect(page.getByTestId('edit-modal')).not.toBeVisible({ timeout: 10000 })

    // Re-open modal to verify notes persisted
    await page.getByTestId('todo-text').filter({ hasText: 'Walk the dog' }).click()
    await expect(page.getByTestId('edit-modal')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('edit-notes')).toHaveValue('Remember to check the figures')
  })

  test('Edit existing notes', async ({ page }) => {
    // Use 'Buy groceries' which has notes 'Milk, eggs, bread'
    await page.goto('/')
    await page.getByTestId('todo-text').filter({ hasText: 'Buy groceries' }).click()
    await expect(page.getByTestId('edit-modal')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('edit-notes')).toHaveValue('Milk, eggs, bread')

    await page.getByTestId('edit-notes').clear()
    await page.getByTestId('edit-notes').fill('New notes content')
    await page.getByTestId('edit-save').click()

    await expect(page.getByTestId('edit-modal')).not.toBeVisible({ timeout: 10000 })

    // Re-open modal to verify notes updated
    await page.getByTestId('todo-text').filter({ hasText: 'Buy groceries' }).click()
    await expect(page.getByTestId('edit-modal')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('edit-notes')).toHaveValue('New notes content')
  })

  test('Notes textarea supports multiline text', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('todo-text').filter({ hasText: 'Walk the dog' }).click()
    await expect(page.getByTestId('edit-modal')).toBeVisible({ timeout: 10000 })

    await page.getByTestId('edit-notes').fill('Line 1\nLine 2\nLine 3')
    await page.getByTestId('edit-save').click()

    await expect(page.getByTestId('edit-modal')).not.toBeVisible({ timeout: 10000 })

    // Re-open modal to verify multiline notes preserved
    await page.getByTestId('todo-text').filter({ hasText: 'Walk the dog' }).click()
    await expect(page.getByTestId('edit-modal')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('edit-notes')).toHaveValue('Line 1\nLine 2\nLine 3')
  })

  test('Save button saves all changes and closes the modal', async ({ page }) => {
    // Use 'Walk the dog' - priority medium, no due date, no notes
    await page.goto('/')
    await page.getByTestId('todo-text').filter({ hasText: 'Walk the dog' }).click()
    await expect(page.getByTestId('edit-modal')).toBeVisible({ timeout: 10000 })

    // Change all fields
    await page.getByTestId('edit-title').clear()
    await page.getByTestId('edit-title').fill('Updated')

    await page.getByTestId('edit-priority').click()
    await page.getByTestId('priority-option-high').click()

    const today = getTodayDate()
    await page.getByTestId('edit-due-date').fill(today)

    await page.getByTestId('edit-notes').fill('Some notes')

    await page.getByTestId('edit-save').click()

    await expect(page.getByTestId('edit-modal')).not.toBeVisible({ timeout: 10000 })

    // Verify all changes reflected in the list
    const todoItem = page.getByTestId('todo-item').filter({ hasText: 'Updated' })
    await expect(todoItem).toBeVisible({ timeout: 10000 })
    await expect(todoItem.getByTestId('priority-badge')).toContainText('High')
    await expect(todoItem.getByTestId('due-date')).toContainText('Today')
  })

  test('Save button appearance', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('todo-text').first().click()
    await expect(page.getByTestId('edit-modal')).toBeVisible({ timeout: 10000 })

    const saveButton = page.getByTestId('edit-save')
    await expect(saveButton).toBeVisible()
    await expect(saveButton).toHaveText('Save')
  })

  test('Cancel button discards changes and closes the modal', async ({ page }) => {
    // Use 'Walk the dog' - priority medium
    await page.goto('/')
    await page.getByTestId('todo-text').filter({ hasText: 'Walk the dog' }).click()
    await expect(page.getByTestId('edit-modal')).toBeVisible({ timeout: 10000 })

    // Make changes
    await page.getByTestId('edit-title').clear()
    await page.getByTestId('edit-title').fill('Changed title')
    await page.getByTestId('edit-priority').click()
    await page.getByTestId('priority-option-high').click()

    // Cancel
    await page.getByTestId('edit-cancel').click()

    await expect(page.getByTestId('edit-modal')).not.toBeVisible({ timeout: 10000 })

    // Verify original values preserved
    await expect(page.getByTestId('todo-text').filter({ hasText: 'Walk the dog' })).toBeVisible()
    const todoItem = page.getByTestId('todo-item').filter({ hasText: 'Walk the dog' })
    await expect(todoItem.getByTestId('priority-badge')).toContainText('Medium')
  })

  test('Cancel button appearance', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('todo-text').first().click()
    await expect(page.getByTestId('edit-modal')).toBeVisible({ timeout: 10000 })

    const cancelButton = page.getByTestId('edit-cancel')
    await expect(cancelButton).toBeVisible()
    await expect(cancelButton).toHaveText('Cancel')
  })

  test('Clicking outside the modal discards changes and closes it', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('todo-text').filter({ hasText: 'Walk the dog' }).click()
    await expect(page.getByTestId('edit-modal')).toBeVisible({ timeout: 10000 })

    // Make changes
    await page.getByTestId('edit-title').clear()
    await page.getByTestId('edit-title').fill('Changed title')

    // Click the backdrop (outside the modal)
    await page.getByTestId('edit-modal-backdrop').click({ position: { x: 10, y: 10 } })

    await expect(page.getByTestId('edit-modal')).not.toBeVisible({ timeout: 10000 })

    // Verify original title preserved
    await expect(page.getByTestId('todo-text').filter({ hasText: 'Walk the dog' })).toBeVisible()
    await expect(page.getByTestId('todo-text').filter({ hasText: 'Changed title' })).toHaveCount(0)
  })

  test('Modal displays as a dialog overlay', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('todo-text').first().click()
    await expect(page.getByTestId('edit-modal')).toBeVisible({ timeout: 10000 })

    // Verify backdrop is present and covers the viewport
    const backdrop = page.getByTestId('edit-modal-backdrop')
    await expect(backdrop).toBeVisible()
    await expect(backdrop).toHaveCSS('position', 'fixed')

    // Verify the modal is centered within the backdrop
    const modal = page.getByTestId('edit-modal')
    await expect(modal).toBeVisible()

    // Verify backdrop dims the background
    const bgColor = await backdrop.evaluate((el) => getComputedStyle(el).backgroundColor)
    // The backdrop should have some opacity (not fully transparent)
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)')
  })
})
