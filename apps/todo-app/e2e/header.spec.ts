import { test, expect } from './fixtures';

const API_URL = '/.netlify/functions/todos';

async function deleteAllTodos(page: import('@playwright/test').Page) {
  const res = await page.request.get(API_URL);
  const todos = await res.json();
  for (const todo of todos) {
    await page.request.delete(`${API_URL}/${todo.id}`);
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await deleteAllTodos(page);
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
});

test('App title is displayed', async ({ page }) => {
  await expect(page.getByTestId('header-title')).toHaveText('Todo App');
});

test('Add todo input field is visible with placeholder', async ({ page }) => {
  const input = page.getByTestId('todo-input');
  await expect(input).toBeVisible();
  await expect(input).toHaveAttribute('placeholder', 'What needs to be done?');
});

test('Submit button is visible', async ({ page }) => {
  await expect(page.getByTestId('add-todo-button')).toBeVisible();
});

test('Add todo via submit button', async ({ page }) => {
  await page.getByTestId('todo-input').fill('Buy groceries');
  await expect(page.getByTestId('todo-input')).toHaveValue('Buy groceries');
  await page.getByTestId('add-todo-button').click();

  await expect(page.getByTestId('todo-text').filter({ hasText: 'Buy groceries' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId('todo-input')).toHaveValue('');
});

test('Add todo by pressing Enter', async ({ page }) => {
  await page.getByTestId('todo-input').fill('Walk the dog');
  await expect(page.getByTestId('todo-input')).toHaveValue('Walk the dog');
  await page.getByTestId('todo-input').press('Enter');

  await expect(page.getByTestId('todo-text').filter({ hasText: 'Walk the dog' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId('todo-input')).toHaveValue('');
});

test('Cannot add empty todo', async ({ page }) => {
  await page.getByTestId('add-todo-button').click();
  await expect(page.getByTestId('empty-state')).toBeVisible();
  await expect(page.getByTestId('todo-input')).toHaveValue('');
});

test('Cannot add whitespace-only todo', async ({ page }) => {
  await page.getByTestId('todo-input').fill('   ');
  await page.getByTestId('add-todo-button').click();
  await expect(page.getByTestId('empty-state')).toBeVisible();
});

test('Added todo persists after page reload', async ({ page }) => {
  await page.getByTestId('todo-input').fill('Persistent task');
  await page.getByTestId('add-todo-button').click();
  await expect(page.getByTestId('todo-text').filter({ hasText: 'Persistent task' })).toBeVisible({ timeout: 10000 });

  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-text').filter({ hasText: 'Persistent task' })).toBeVisible({ timeout: 10000 });
});
