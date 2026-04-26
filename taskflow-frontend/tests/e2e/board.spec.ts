import { test, expect } from '@playwright/test';
import { uniqueEmail, registerUser, loginUser, createProjectViaUI, createTaskViaUI } from './helpers/test-utils';

test.describe('Board View — Task Management', () => {

  async function setupBoard(page: import('@playwright/test').Page) {
    const email = uniqueEmail();
    const password = 'Test@1234';
    const name = 'Board Test User';

    await registerUser(page, name, email, password);
    await loginUser(page, email, password);

    const projectName = `Board Project ${Date.now()}`;
    await createProjectViaUI(page, projectName);

    await page.locator('.prj-card', { hasText: projectName }).click();
    await expect(page.locator('.board-cols')).toBeVisible({ timeout: 5000 });
  }

  test('board shows four columns', async ({ page }) => {
    await setupBoard(page);
    await expect(page.locator('.board-col').filter({ hasText: 'To Do' })).toBeVisible();
    await expect(page.locator('.board-col').filter({ hasText: 'In Progress' })).toBeVisible();
    await expect(page.locator('.board-col').filter({ hasText: 'In Review' })).toBeVisible();
    await expect(page.locator('.board-col').filter({ hasText: 'Done' })).toBeVisible();
  });

  test('create task from board', async ({ page }) => {
    await setupBoard(page);
    await createTaskViaUI(page, 'New Board Task');
    const todoCol = page.locator('.board-col').filter({ hasText: 'To Do' }).locator('.col-body');
    await expect(todoCol.locator('.task-card', { hasText: 'New Board Task' })).toBeVisible();
  });

  test('create task with all fields', async ({ page }) => {
    await setupBoard(page);
    
    await page.getByRole('button', { name: '+ New Task' }).click();
    await expect(page.locator('.modal')).toBeVisible({ timeout: 5000 });

    await page.locator('.modal .field').filter({ hasText: 'Title' }).locator('.field-input').fill('Full Task');
    await page.locator('.modal .field').filter({ hasText: 'Description' }).locator('.field-input').fill('Task description');
    await page.locator('.modal .field').filter({ hasText: 'Priority' }).locator('.field-input').selectOption('HIGH');
    await page.locator('.modal .field').filter({ hasText: 'Deadline' }).locator('.field-input').fill('2025-12-31');

    await page.getByRole('button', { name: '✦ Create Task' }).click();
    await expect(page.locator('.modal')).not.toBeVisible({ timeout: 5000 });

    const taskCard = page.locator('.task-card', { hasText: 'Full Task' });
    await expect(taskCard).toBeVisible();
    await expect(taskCard.locator('.p-badge', { hasText: 'HIGH' })).toBeVisible();
  });

  test('create task validates title required', async ({ page }) => {
    await setupBoard(page);
    await page.getByRole('button', { name: '+ New Task' }).click();
    await expect(page.locator('.modal')).toBeVisible({ timeout: 5000 });
    
    // empty title, click create -> no close
    await page.getByRole('button', { name: '✦ Create Task' }).click();
    
    // empty title, click create -> no close
    await page.getByRole('button', { name: '✦ Create Task' }).click();
    await expect(page.getByText('Title is required')).toBeVisible();
  });

  test('task card click opens detail drawer', async ({ page }) => {
    await setupBoard(page);
    await createTaskViaUI(page, 'Drawer Task');
    await page.locator('.task-card', { hasText: 'Drawer Task' }).click();
    const drawer = page.locator('.drawer');
    await expect(drawer).toBeVisible();
    await expect(drawer.locator('.drawer-ttl')).toHaveText('Drawer Task');
  });

  test('move task via drawer transition buttons', async ({ page }) => {
    await setupBoard(page);
    await createTaskViaUI(page, 'Move Task');
    await page.locator('.task-card', { hasText: 'Move Task' }).click();
    await page.locator('.drawer').locator('.trans-btn', { hasText: '-> In Progress' }).click();
    
    const inProgressCol = page.locator('.board-col').filter({ hasText: 'In Progress' }).locator('.col-body');
    await expect(inProgressCol.locator('.task-card', { hasText: 'Move Task' })).toBeVisible();
  });

  test('invalid transitions not shown in drawer', async ({ page }) => {
    await setupBoard(page);
    await createTaskViaUI(page, 'Invalid Trans Task');
    await page.locator('.task-card', { hasText: 'Invalid Trans Task' }).click();
    const drawer = page.locator('.drawer');
    await expect(drawer.locator('.trans-btn', { hasText: '-> In Progress' })).toBeVisible();
    await expect(drawer.locator('.trans-btn', { hasText: '-> Done' })).toHaveCount(0);
    await expect(drawer.locator('.trans-btn', { hasText: '-> In Review' })).toHaveCount(0);
  });

  test('delete task from drawer', async ({ page }) => {
    await setupBoard(page);
    await createTaskViaUI(page, 'Delete Task');
    await page.locator('.task-card', { hasText: 'Delete Task' }).click();
    await page.locator('.drawer').getByRole('button', { name: 'Delete Task' }).click();
    
    await expect(page.locator('.task-card', { hasText: 'Delete Task' })).toHaveCount(0);
  });

});
