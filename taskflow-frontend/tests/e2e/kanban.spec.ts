import { test, expect } from '@playwright/test';
import { uniqueEmail, registerUser, loginUser, createProjectViaUI, createTaskViaUI } from './helpers/test-utils';

test.describe('Kanban Board — Drag and Drop & Transitions', () => {

  async function setupBoard(page: import('@playwright/test').Page) {
    const email = uniqueEmail();
    const password = 'Test@1234';
    const name = 'Kanban Test User';

    await registerUser(page, name, email, password);
    await loginUser(page, email, password);

    const projectName = `Kanban Project ${Date.now()}`;
    await createProjectViaUI(page, projectName);

    await page.locator('.prj-card', { hasText: projectName }).click();
    await expect(page.locator('.board-cols')).toBeVisible({ timeout: 5000 });
  }

  test('valid transition: TODO to IN_PROGRESS', async ({ page }) => {
    await setupBoard(page);
    await createTaskViaUI(page, 'Transition Task');

    // Drag from TODO to IN_PROGRESS
    const taskCard = page.locator('.task-card', { hasText: 'Transition Task' });
    const inProgressCol = page.locator('.board-col').filter({ hasText: 'In Progress' }).locator('.col-body');

    await taskCard.dragTo(inProgressCol);

    // Verify task is now in IN_PROGRESS
    await expect(inProgressCol.locator('.task-card', { hasText: 'Transition Task' })).toBeVisible();
    
    // Verify TODO is empty
    const todoCol = page.locator('.board-col').filter({ hasText: 'To Do' }).locator('.col-body');
    await expect(todoCol.locator('.task-card', { hasText: 'Transition Task' })).toHaveCount(0);
  });

  test('invalid transition: TODO to DONE should be blocked', async ({ page }) => {
    await setupBoard(page);
    await createTaskViaUI(page, 'Blocked Task');

    const taskCard = page.locator('.task-card', { hasText: 'Blocked Task' });
    const doneCol = page.locator('.board-col').filter({ hasText: 'Done' }).locator('.col-body');

    await taskCard.dragTo(doneCol);

    // Verify task did NOT move to DONE
    await expect(doneCol.locator('.task-card', { hasText: 'Blocked Task' })).toHaveCount(0);

    // Verify task is still in TODO
    const todoCol = page.locator('.board-col').filter({ hasText: 'To Do' }).locator('.col-body');
    await expect(todoCol.locator('.task-card', { hasText: 'Blocked Task' })).toBeVisible();
  });

  test('multi-step transitions: TODO -> IN_PROGRESS -> IN_REVIEW -> DONE', async ({ page }) => {
    await setupBoard(page);
    await createTaskViaUI(page, 'Multi Step Task');

    const taskCard = page.locator('.task-card', { hasText: 'Multi Step Task' }).first();

    const inProgressCol = page.locator('.board-col').filter({ hasText: 'In Progress' }).locator('.col-body');
    const inReviewCol = page.locator('.board-col').filter({ hasText: 'In Review' }).locator('.col-body');
    const doneCol = page.locator('.board-col').filter({ hasText: 'Done' }).locator('.col-body');

    async function safeDrag(source: import('@playwright/test').Locator, target: import('@playwright/test').Locator) {
      await source.hover();
      await page.mouse.down();
      await page.waitForTimeout(300);
      await target.hover();
      await page.waitForTimeout(300);
      await page.mouse.up();
      await page.waitForTimeout(1000); // Wait for React to process drop
    }

    // 1. TODO -> IN_PROGRESS
    await safeDrag(taskCard, inProgressCol);
    await expect(inProgressCol.locator('.task-card', { hasText: 'Multi Step Task' })).toBeVisible();

    // 2. IN_PROGRESS -> IN_REVIEW
    await safeDrag(taskCard, inReviewCol);
    await expect(inReviewCol.locator('.task-card', { hasText: 'Multi Step Task' })).toBeVisible();

    // 3. IN_REVIEW -> DONE
    await safeDrag(taskCard, doneCol);
    await expect(doneCol.locator('.task-card', { hasText: 'Multi Step Task' })).toBeVisible();
  });

});
