import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const deploymentTxt = fs.readFileSync(
  path.join(__dirname, '..', 'deployment.txt'),
  'utf-8'
);
const urlMatch = deploymentTxt.match(/^url:\s*(.+)$/m);
if (!urlMatch) throw new Error('No url found in deployment.txt');
const DEPLOYED_URL = urlMatch[1].trim();

const API_URL = `${DEPLOYED_URL}/.netlify/functions/todos`;

test('Deployed app displays data and supports updates', async ({ page }) => {
  // Navigate to the deployed app
  await page.goto(DEPLOYED_URL);
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });

  // Create a todo via the API to ensure data exists
  const uniqueText = `Deploy test ${Date.now()}`;
  const createRes = await page.request.post(API_URL, {
    data: { text: uniqueText },
  });
  expect(createRes.ok()).toBeTruthy();

  // Reload and verify the todo appears in the UI
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  await expect(
    page.getByTestId('todo-text').filter({ hasText: uniqueText })
  ).toBeVisible({ timeout: 15000 });

  // Toggle the todo's completion to verify write operations work
  const todoItem = page.getByTestId('todo-item').filter({ hasText: uniqueText });
  await todoItem.getByTestId('todo-checkbox').click();
  await expect(
    todoItem.getByTestId('todo-text')
  ).toHaveCSS('text-decoration-line', 'line-through', { timeout: 10000 });

  // Reload and confirm the update persisted
  await page.reload();
  await expect(page.getByTestId('header')).toBeVisible({ timeout: 30000 });
  const persistedItem = page.getByTestId('todo-item').filter({ hasText: uniqueText });
  await expect(
    persistedItem.getByTestId('todo-text')
  ).toHaveCSS('text-decoration-line', 'line-through', { timeout: 15000 });

  // Clean up: delete the test todo
  const listRes = await page.request.get(API_URL);
  const todos = await listRes.json();
  const testTodo = todos.find((t: { text: string }) => t.text === uniqueText);
  if (testTodo) {
    await page.request.delete(`${API_URL}/${testTodo.id}`);
  }
});
