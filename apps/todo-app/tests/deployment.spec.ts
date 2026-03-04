import { test, expect } from '@playwright/test'

test('Deployment: app displays data and supports updates', async ({ page }) => {
  // Step 1: Navigate to main page and verify data loads
  await page.goto('/')
  await expect(page).toHaveTitle(/.+/)

  // Wait for todo items to load from the database (seeded data)
  const todoItems = page.getByTestId('todo-item')
  await expect(todoItems.first()).toBeVisible({ timeout: 30000 })

  const initialCount = await todoItems.count()
  expect(initialCount).toBeGreaterThan(0)

  // Verify at least one todo has visible text
  const firstTodoText = page.getByTestId('todo-text').first()
  await expect(firstTodoText).toBeVisible()
  const text = await firstTodoText.textContent()
  expect(text).toBeTruthy()

  // Step 2: Perform a write operation — add a new todo
  const newTodoTitle = `Deploy test ${Date.now()}`
  const addInput = page.getByTestId('add-todo-input')
  await expect(addInput).toBeVisible({ timeout: 10000 })
  await addInput.fill(newTodoTitle)
  await addInput.press('Enter')

  // Verify the new todo appears in the list
  const newTodo = page.getByTestId('todo-item').filter({ hasText: newTodoTitle })
  await expect(newTodo).toBeVisible({ timeout: 15000 })

  // Verify the count increased
  const updatedCount = await todoItems.count()
  expect(updatedCount).toBe(initialCount + 1)
})
