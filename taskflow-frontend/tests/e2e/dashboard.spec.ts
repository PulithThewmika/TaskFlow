import { test, expect } from '@playwright/test';
import { uniqueEmail, registerUser, loginUser, createProjectViaUI, createTaskViaUI } from './helpers/test-utils';

test.describe('Dashboard View', () => {

  async function setupDashboard(page: import('@playwright/test').Page) {
    const email = uniqueEmail();
    const password = 'Test@1234';
    const name = 'Dashboard Test User';

    await registerUser(page, name, email, password);
    await loginUser(page, email, password);
  }

  test('dashboard loads stat cards', async ({ page }) => {
    await setupDashboard(page);
    await expect(page.locator('.stat-label', { hasText: 'Total Tasks' })).toBeVisible();
    await expect(page.locator('.stat-label', { hasText: 'In Progress' })).toBeVisible();
    await expect(page.locator('.stat-label', { hasText: 'Overdue' })).toBeVisible();
    await expect(page.locator('.stat-label', { hasText: 'Done' })).toBeVisible();
  });

  test('stats reflect zero state', async ({ page }) => {
    await setupDashboard(page);
    // There are 4 stat cards, check that all .stat-val show "0"
    const statCards = page.locator('.stat-card');
    await expect(statCards).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await expect(statCards.nth(i).locator('.stat-val')).toHaveText('0');
    }
  });

  test('stats update after creating tasks', async ({ page }) => {
    await setupDashboard(page);
    const projectName = `Dash Project ${Date.now()}`;
    await createProjectViaUI(page, projectName);

    await page.locator('.prj-card', { hasText: projectName }).click();
    await createTaskViaUI(page, 'New Task for Stats');

    await page.locator('.sb-item', { hasText: 'Dashboard' }).click();
    await expect(page.locator('.topbar-ttl')).toHaveText('Overview');

    // Wait a bit for backend update or poll the value
    const totalTasksVal = page.locator('.stat-card').filter({ hasText: 'Total Tasks' }).locator('.stat-val');
    await expect(totalTasksVal).not.toHaveText('0', { timeout: 10000 });
    await expect(totalTasksVal).toHaveText('1');
  });

  test('sidebar navigation works', async ({ page }) => {
    await setupDashboard(page);
    await expect(page.locator('.topbar-ttl')).toHaveText('Overview');

    await page.locator('.sb-item', { hasText: 'Projects' }).click();
    await expect(page.locator('.topbar-ttl')).toHaveText('Projects');

    // To click board, we need a project created first.
    const projectName = `Side Project ${Date.now()}`;
    await createProjectViaUI(page, projectName);
    
    // Now click Board from sidebar
    await page.locator('.sb-item span', { hasText: /^Board$/ }).click();
    await expect(page.locator('.topbar-ttl')).toHaveText('Kanban Board');
  });

  test('theme toggle switches theme', async ({ page }) => {
    await setupDashboard(page);
    const themeWrapper = page.locator('div[data-theme]').first();
    const initialTheme = await themeWrapper.getAttribute('data-theme');
    
    // There are two ThemeToggle components (one in sidebar, one in topbar), we pick the topbar one.
    await page.locator('.topbar-actions .theme-toggle').click();
    
    const newTheme = await themeWrapper.getAttribute('data-theme');
    expect(newTheme).not.toBe(initialTheme);
  });

  test('overdue pill shows when tasks overdue', async ({ page }) => {
    await setupDashboard(page);
    const projectName = `Overdue Project ${Date.now()}`;
    await createProjectViaUI(page, projectName);

    await page.locator('.prj-card', { hasText: projectName }).click();
    
    // Create overdue task
    await page.getByRole('button', { name: '+ New Task' }).click();
    await expect(page.locator('.modal')).toBeVisible({ timeout: 5000 });
    await page.locator('.modal .field').filter({ hasText: 'Title' }).locator('.field-input').fill('Overdue Task');
    
    // Set past deadline
    await page.locator('.modal .field').filter({ hasText: 'Deadline' }).locator('.field-input').fill('2020-01-01');
    await page.getByRole('button', { name: '✦ Create Task' }).click();
    await expect(page.locator('.modal')).not.toBeVisible({ timeout: 5000 });

    // Go to dashboard
    await page.locator('.sb-item', { hasText: 'Dashboard' }).click();

    // Check overdue pill
    const overduePill = page.locator('.topbar-actions .overdue-pill');
    await expect(overduePill).toBeVisible({ timeout: 10000 });
    await expect(overduePill).toContainText('overdue');
  });

});
