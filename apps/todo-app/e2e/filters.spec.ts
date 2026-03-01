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

test('Filter buttons All Active Completed are displayed', async ({ page }) => {
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });

  await expect(page.getByTestId('filter-all')).toBeVisible();
  await expect(page.getByTestId('filter-active')).toBeVisible();
  await expect(page.getByTestId('filter-completed')).toBeVisible();

  await expect(page.getByTestId('filter-all')).toHaveText('All');
  await expect(page.getByTestId('filter-active')).toHaveText('Active');
  await expect(page.getByTestId('filter-completed')).toHaveText('Completed');
});

test('All filter is active by default', async ({ page }) => {
  await createTodo(page, 'Active one');
  await createTodo(page, 'Completed one', true);
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-item')).toHaveCount(2, { timeout: 10000 });

  await expect(page.getByTestId('filter-all')).toHaveClass(/filters-btn--active/);
  await expect(page.getByTestId('filter-active')).not.toHaveClass(/filters-btn--active/);
  await expect(page.getByTestId('filter-completed')).not.toHaveClass(/filters-btn--active/);
});

test('Filter by Active shows only uncompleted todos', async ({ page }) => {
  await createTodo(page, 'Task A');
  await createTodo(page, 'Task B');
  await createTodo(page, 'Task C', true);
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-item')).toHaveCount(3, { timeout: 10000 });

  await page.getByTestId('filter-active').click();

  await expect(page.getByTestId('todo-item')).toHaveCount(2, { timeout: 10000 });
  await expect(page.getByTestId('todo-text').filter({ hasText: 'Task A' })).toBeVisible();
  await expect(page.getByTestId('todo-text').filter({ hasText: 'Task B' })).toBeVisible();
  await expect(page.getByTestId('todo-text').filter({ hasText: 'Task C' })).toHaveCount(0);
  await expect(page.getByTestId('filter-active')).toHaveClass(/filters-btn--active/);
});

test('Filter by Completed shows only completed todos', async ({ page }) => {
  await createTodo(page, 'Task A');
  await createTodo(page, 'Task B');
  await createTodo(page, 'Task C', true);
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-item')).toHaveCount(3, { timeout: 10000 });

  await page.getByTestId('filter-completed').click();

  await expect(page.getByTestId('todo-item')).toHaveCount(1, { timeout: 10000 });
  await expect(page.getByTestId('todo-text').filter({ hasText: 'Task C' })).toBeVisible();
  await expect(page.getByTestId('todo-text').filter({ hasText: 'Task A' })).toHaveCount(0);
  await expect(page.getByTestId('todo-text').filter({ hasText: 'Task B' })).toHaveCount(0);
  await expect(page.getByTestId('filter-completed')).toHaveClass(/filters-btn--active/);
});

test('Filter by All shows all todos', async ({ page }) => {
  await createTodo(page, 'Active todo');
  await createTodo(page, 'Completed todo', true);
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-item')).toHaveCount(2, { timeout: 10000 });

  await page.getByTestId('filter-completed').click();
  await expect(page.getByTestId('todo-item')).toHaveCount(1, { timeout: 10000 });

  await page.getByTestId('filter-all').click();
  await expect(page.getByTestId('todo-item')).toHaveCount(2, { timeout: 10000 });
  await expect(page.getByTestId('todo-text').filter({ hasText: 'Active todo' })).toBeVisible();
  await expect(page.getByTestId('todo-text').filter({ hasText: 'Completed todo' })).toBeVisible();
  await expect(page.getByTestId('filter-all')).toHaveClass(/filters-btn--active/);
});

test('Active filter is visually highlighted', async ({ page }) => {
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });

  await expect(page.getByTestId('filter-all')).toHaveClass(/filters-btn--active/);
  await expect(page.getByTestId('filter-active')).not.toHaveClass(/filters-btn--active/);
  await expect(page.getByTestId('filter-completed')).not.toHaveClass(/filters-btn--active/);

  await page.getByTestId('filter-active').click();
  await expect(page.getByTestId('filter-active')).toHaveClass(/filters-btn--active/);
  await expect(page.getByTestId('filter-all')).not.toHaveClass(/filters-btn--active/);
  await expect(page.getByTestId('filter-completed')).not.toHaveClass(/filters-btn--active/);

  await page.getByTestId('filter-completed').click();
  await expect(page.getByTestId('filter-completed')).toHaveClass(/filters-btn--active/);
  await expect(page.getByTestId('filter-all')).not.toHaveClass(/filters-btn--active/);
  await expect(page.getByTestId('filter-active')).not.toHaveClass(/filters-btn--active/);

  await page.getByTestId('filter-all').click();
  await expect(page.getByTestId('filter-all')).toHaveClass(/filters-btn--active/);
  await expect(page.getByTestId('filter-active')).not.toHaveClass(/filters-btn--active/);
  await expect(page.getByTestId('filter-completed')).not.toHaveClass(/filters-btn--active/);
});

test('Remaining active items count is displayed', async ({ page }) => {
  await createTodo(page, 'A1');
  await createTodo(page, 'A2');
  await createTodo(page, 'A3');
  await createTodo(page, 'C1', true);
  await createTodo(page, 'C2', true);
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-item')).toHaveCount(5, { timeout: 10000 });

  await expect(page.getByTestId('items-left')).toHaveText('3 items left');
});

test('Singular item count displays 1 item left', async ({ page }) => {
  await createTodo(page, 'Only one');
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-item')).toBeVisible({ timeout: 10000 });

  await expect(page.getByTestId('items-left')).toHaveText('1 item left');
});

test('Zero items count displays 0 items left', async ({ page }) => {
  await createTodo(page, 'Done one', true);
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-item')).toBeVisible({ timeout: 10000 });

  await expect(page.getByTestId('items-left')).toHaveText('0 items left');
});

test('Active items count updates when todo is completed', async ({ page }) => {
  await createTodo(page, 'A');
  await createTodo(page, 'B');
  await createTodo(page, 'C');
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-item')).toHaveCount(3, { timeout: 10000 });

  await expect(page.getByTestId('items-left')).toHaveText('3 items left');

  const todoA = page.getByTestId('todo-item').filter({ hasText: 'A' });
  await todoA.getByTestId('todo-checkbox').click();

  await expect(page.getByTestId('items-left')).toHaveText('2 items left', { timeout: 10000 });
});

test('Active items count updates when todo is added', async ({ page }) => {
  await createTodo(page, 'First');
  await createTodo(page, 'Second');
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-item')).toHaveCount(2, { timeout: 10000 });

  await expect(page.getByTestId('items-left')).toHaveText('2 items left');

  await page.getByTestId('todo-input').fill('New task');
  await page.getByTestId('add-todo-button').click();

  await expect(page.getByTestId('items-left')).toHaveText('3 items left', { timeout: 10000 });
});

test('Active items count updates when todo is deleted', async ({ page }) => {
  await createTodo(page, 'One');
  await createTodo(page, 'Two');
  await createTodo(page, 'Three');
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-item')).toHaveCount(3, { timeout: 10000 });

  await expect(page.getByTestId('items-left')).toHaveText('3 items left');

  const todoToDelete = page.getByTestId('todo-item').filter({ hasText: 'One' });
  await todoToDelete.hover();
  await todoToDelete.getByTestId('delete-todo-button').click();

  await expect(page.getByTestId('items-left')).toHaveText('2 items left', { timeout: 10000 });
});

test('Completing a todo while Active filter is selected hides it', async ({ page }) => {
  await createTodo(page, 'Task A');
  await createTodo(page, 'Task B');
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-item')).toHaveCount(2, { timeout: 10000 });

  await page.getByTestId('filter-active').click();
  await expect(page.getByTestId('todo-item')).toHaveCount(2, { timeout: 10000 });

  const taskA = page.getByTestId('todo-item').filter({ hasText: 'Task A' });
  await taskA.getByTestId('todo-checkbox').click();

  await expect(page.getByTestId('todo-item')).toHaveCount(1, { timeout: 10000 });
  await expect(page.getByTestId('todo-text').filter({ hasText: 'Task B' })).toBeVisible();
  await expect(page.getByTestId('todo-text').filter({ hasText: 'Task A' })).toHaveCount(0);
});

test('Uncompleting a todo while Completed filter is selected hides it', async ({ page }) => {
  await createTodo(page, 'Task A', true);
  await createTodo(page, 'Task B', true);
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-item')).toHaveCount(2, { timeout: 10000 });

  await page.getByTestId('filter-completed').click();
  await expect(page.getByTestId('todo-item')).toHaveCount(2, { timeout: 10000 });

  const taskA = page.getByTestId('todo-item').filter({ hasText: 'Task A' });
  await taskA.getByTestId('todo-checkbox').click();

  await expect(page.getByTestId('todo-item')).toHaveCount(1, { timeout: 10000 });
  await expect(page.getByTestId('todo-text').filter({ hasText: 'Task B' })).toBeVisible();
  await expect(page.getByTestId('todo-text').filter({ hasText: 'Task A' })).toHaveCount(0);
});

test('Clear completed button visible when completed todos exist', async ({ page }) => {
  await createTodo(page, 'Active one');
  await createTodo(page, 'Completed one', true);
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-item')).toHaveCount(2, { timeout: 10000 });

  await expect(page.getByTestId('clear-completed')).toBeVisible();
});

test('Clear completed button hidden when no completed todos exist', async ({ page }) => {
  await createTodo(page, 'Active one');
  await createTodo(page, 'Active two');
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-item')).toHaveCount(2, { timeout: 10000 });

  await expect(page.getByTestId('clear-completed')).toHaveCount(0);
});

test('Clear completed removes all completed todos', async ({ page }) => {
  await createTodo(page, 'A');
  await createTodo(page, 'B');
  await createTodo(page, 'C', true);
  await createTodo(page, 'D', true);
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-item')).toHaveCount(4, { timeout: 10000 });

  await page.getByTestId('clear-completed').click();

  await expect(page.getByTestId('todo-item')).toHaveCount(2, { timeout: 10000 });
  await expect(page.getByTestId('todo-text').filter({ hasText: 'A' })).toBeVisible();
  await expect(page.getByTestId('todo-text').filter({ hasText: 'B' })).toBeVisible();
  await expect(page.getByTestId('todo-text').filter({ hasText: 'C' })).toHaveCount(0);
  await expect(page.getByTestId('todo-text').filter({ hasText: 'D' })).toHaveCount(0);
  await expect(page.getByTestId('clear-completed')).toHaveCount(0);
});

test('Clear completed persists after page reload', async ({ page }) => {
  await createTodo(page, 'A');
  await createTodo(page, 'B', true);
  await createTodo(page, 'C', true);
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-item')).toHaveCount(3, { timeout: 10000 });

  await page.getByTestId('clear-completed').click();
  await expect(page.getByTestId('todo-item')).toHaveCount(1, { timeout: 10000 });

  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });

  await expect(page.getByTestId('todo-item')).toHaveCount(1, { timeout: 10000 });
  await expect(page.getByTestId('todo-text').filter({ hasText: 'A' })).toBeVisible();
  await expect(page.getByTestId('todo-text').filter({ hasText: 'B' })).toHaveCount(0);
  await expect(page.getByTestId('todo-text').filter({ hasText: 'C' })).toHaveCount(0);
});

test('Filtering is client-side only', async ({ page }) => {
  await createTodo(page, 'Active item');
  await createTodo(page, 'Completed item', true);
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('todo-item')).toHaveCount(2, { timeout: 10000 });

  const networkRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/.netlify/functions/todos')) {
      networkRequests.push(request.url());
    }
  });

  await page.getByTestId('filter-active').click();
  await expect(page.getByTestId('todo-item')).toHaveCount(1, { timeout: 10000 });

  await page.getByTestId('filter-completed').click();
  await expect(page.getByTestId('todo-item')).toHaveCount(1, { timeout: 10000 });

  await page.getByTestId('filter-all').click();
  await expect(page.getByTestId('todo-item')).toHaveCount(2, { timeout: 10000 });

  expect(networkRequests).toHaveLength(0);
});
