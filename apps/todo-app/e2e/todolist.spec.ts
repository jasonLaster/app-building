import { test, expect } from './fixtures';

const API_URL = '/.netlify/functions/todos';

async function deleteAllTodos(page: import('@playwright/test').Page) {
  const res = await page.request.get(API_URL);
  const todos = await res.json();
  for (const todo of todos) {
    await page.request.delete(`${API_URL}/${todo.id}`);
  }
}

async function createTodo(page: import('@playwright/test').Page, text: string, completed = false) {
  const res = await page.request.post(API_URL, {
    data: { text },
  });
  const todo = await res.json();
  if (completed) {
    await page.request.put(`${API_URL}/${todo.id}`, {
      data: { completed: true },
    });
  }
  return todo;
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await deleteAllTodos(page);
});

test('Empty state message when no todos exist', async ({ page }) => {
  await page.reload();
  await expect(page.getByTestId('empty-state')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('empty-state')).toHaveText('No todos yet. Add one above!');
});

test('Todos displayed in a vertical list', async ({ page }) => {
  await createTodo(page, 'Task A');
  await createTodo(page, 'Task B');
  await createTodo(page, 'Task C');
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });

  const todoItems = page.getByTestId('todo-item');
  await expect(todoItems).toHaveCount(3, { timeout: 10000 });

  const todoTexts = page.getByTestId('todo-text');
  await expect(todoTexts.nth(0)).toHaveText('Task C');
  await expect(todoTexts.nth(1)).toHaveText('Task B');
  await expect(todoTexts.nth(2)).toHaveText('Task A');
});

test('Each todo shows checkbox, text, and delete button on hover', async ({ page }) => {
  await createTodo(page, 'Review code');
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });

  const todoItem = page.getByTestId('todo-item');
  await expect(todoItem).toBeVisible({ timeout: 10000 });

  await expect(page.getByTestId('todo-checkbox')).toBeVisible();
  await expect(page.getByTestId('todo-text')).toHaveText('Review code');

  await todoItem.hover();
  await expect(page.getByTestId('delete-todo-button')).toBeVisible();
});

test('Delete button is hidden when not hovering', async ({ page }) => {
  await createTodo(page, 'Some task');
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-item')).toBeVisible({ timeout: 10000 });

  const deleteBtn = page.getByTestId('delete-todo-button');
  await expect(deleteBtn).toHaveCSS('opacity', '0');
});

test('Toggle todo completion via checkbox', async ({ page }) => {
  await createTodo(page, 'Clean house');
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-item')).toBeVisible({ timeout: 10000 });

  await page.getByTestId('todo-checkbox').click();

  await expect(page.getByTestId('todo-text')).toHaveCSS('text-decoration-line', 'line-through', { timeout: 10000 });
  await expect(page.getByTestId('todo-checkbox')).toHaveClass(/todo-checkbox--checked/);
});

test('Untoggle completed todo via checkbox', async ({ page }) => {
  await createTodo(page, 'Clean house', true);
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-item')).toBeVisible({ timeout: 10000 });

  await expect(page.getByTestId('todo-checkbox')).toHaveClass(/todo-checkbox--checked/);
  await expect(page.getByTestId('todo-text')).toHaveCSS('text-decoration-line', 'line-through');

  await page.getByTestId('todo-checkbox').click();

  await expect(page.getByTestId('todo-text')).not.toHaveCSS('text-decoration-line', 'line-through', { timeout: 10000 });
  await expect(page.getByTestId('todo-checkbox')).not.toHaveClass(/todo-checkbox--checked/);
});

test('Toggle completion persists after page reload', async ({ page }) => {
  await createTodo(page, 'Finish report');
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-item')).toBeVisible({ timeout: 10000 });

  await page.getByTestId('todo-checkbox').click();
  await expect(page.getByTestId('todo-text')).toHaveCSS('text-decoration-line', 'line-through', { timeout: 10000 });

  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-text').filter({ hasText: 'Finish report' })).toHaveCSS('text-decoration-line', 'line-through', { timeout: 10000 });
  await expect(page.getByTestId('todo-checkbox')).toHaveClass(/todo-checkbox--checked/);
});

test('Delete a todo via delete button', async ({ page }) => {
  await createTodo(page, 'Keep me');
  await createTodo(page, 'Delete me');
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-item')).toHaveCount(2, { timeout: 10000 });

  const deleteTarget = page.getByTestId('todo-item').filter({ hasText: 'Delete me' });
  await deleteTarget.hover();
  await deleteTarget.getByTestId('delete-todo-button').click();

  await expect(page.getByTestId('todo-item')).toHaveCount(1, { timeout: 10000 });
  await expect(page.getByTestId('todo-text').filter({ hasText: 'Keep me' })).toBeVisible();
  await expect(page.getByTestId('todo-text').filter({ hasText: 'Delete me' })).toHaveCount(0);
});

test('Deleted todo does not reappear after page reload', async ({ page }) => {
  await createTodo(page, 'Temporary task');
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-item')).toBeVisible({ timeout: 10000 });

  const todoItem = page.getByTestId('todo-item').filter({ hasText: 'Temporary task' });
  await todoItem.hover();
  await todoItem.getByTestId('delete-todo-button').click();

  await expect(page.getByTestId('todo-text').filter({ hasText: 'Temporary task' })).toHaveCount(0, { timeout: 10000 });

  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-text').filter({ hasText: 'Temporary task' })).toHaveCount(0, { timeout: 10000 });
});

test('Completed todo displays strikethrough styling', async ({ page }) => {
  await createTodo(page, 'Done task', true);
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-item')).toBeVisible({ timeout: 10000 });

  await expect(page.getByTestId('todo-text')).toHaveCSS('text-decoration-line', 'line-through');
  await expect(page.getByTestId('todo-checkbox')).toHaveClass(/todo-checkbox--checked/);
});

test('Active todo displays normal styling', async ({ page }) => {
  await createTodo(page, 'Active task');
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-item')).toBeVisible({ timeout: 10000 });

  await expect(page.getByTestId('todo-text')).not.toHaveCSS('text-decoration-line', 'line-through');
  await expect(page.getByTestId('todo-checkbox')).not.toHaveClass(/todo-checkbox--checked/);
});
