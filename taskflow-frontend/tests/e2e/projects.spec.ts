import { test, expect } from '@playwright/test';
import { uniqueEmail, registerUser, createProjectViaUI, createTaskViaUI } from './helpers/test-utils';

test.describe('Projects — 7 Tests', () => {

  // Helper: register + login a fresh user for test isolation
  async function authenticateUser(page: import('@playwright/test').Page) {
    const email = uniqueEmail();
    const password = 'Test@1234';
    const name = 'Project Test User';

    await registerUser(page, name, email, password);
    // Wait for redirect to login
    await expect(page.getByText('Sign in to your workspace')).toBeVisible({ timeout: 10000 });

    // Now login
    await page.locator('.field').filter({ hasText: 'Email' }).locator('.field-input').fill(email);
    await page.locator('.field').filter({ hasText: 'Password' }).locator('.field-input').fill(password);
    await page.getByRole('button', { name: /Sign in/i }).click();

    // Wait for dashboard
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 10000 });
  }

  // ─── 1. Projects page shows empty state ─────────────────────────────────────
  test('projects page shows empty state', async ({ page }) => {
    await authenticateUser(page);

    // Navigate to Projects tab via sidebar
    await page.locator('.sb-item', { hasText: 'Projects' }).click();
    await expect(page.locator('.page-wrap')).toBeVisible({ timeout: 5000 });

    // "0 active projects" text visible
    await expect(page.getByText('0 active projects')).toBeVisible();
  });

  // ─── 2. Create project successfully ─────────────────────────────────────────
  test('create project successfully', async ({ page }) => {
    await authenticateUser(page);

    const projectName = `Test Project ${Date.now()}`;
    await createProjectViaUI(page, projectName);

    // Project card appears with correct name
    await expect(page.locator('.prj-card-name', { hasText: projectName })).toBeVisible({ timeout: 5000 });
  });

  // ─── 3. Create project requires name ────────────────────────────────────────
  test('create project requires name', async ({ page }) => {
    await authenticateUser(page);

    // Navigate to Projects view
    await page.locator('.sb-item', { hasText: 'Projects' }).click();
    await expect(page.locator('.page-wrap')).toBeVisible({ timeout: 5000 });

    // Open modal
    await page.getByRole('button', { name: '+ New Project' }).click();
    await expect(page.locator('.modal')).toBeVisible({ timeout: 5000 });

    // Click "Create Project" with empty name
    await page.getByRole('button', { name: 'Create Project' }).click();

    // Modal should stay open (nothing happens because name is empty)
    await expect(page.locator('.modal')).toBeVisible();

    // The name field should still be empty
    const nameInput = page.locator('.modal .field').filter({ hasText: 'Project Name' }).locator('.field-input');
    await expect(nameInput).toHaveValue('');
  });

  // ─── 4. Color tag selection persists ────────────────────────────────────────
  test('color tag selection persists', async ({ page }) => {
    await authenticateUser(page);

    // Navigate to Projects view
    await page.locator('.sb-item', { hasText: 'Projects' }).click();
    await expect(page.locator('.page-wrap')).toBeVisible({ timeout: 5000 });

    // Open modal
    await page.getByRole('button', { name: '+ New Project' }).click();
    await expect(page.locator('.modal')).toBeVisible({ timeout: 5000 });

    // Select the pink color (#ec4899)
    const pinkColor = '#ec4899';
    await page.locator('.color-swatch').nth(1).click();

    // Verify the pink swatch is now selected
    await expect(page.locator('.color-swatch').nth(1)).toHaveClass(/selected/);

    // Fill name and create
    const projectName = `Pink Project ${Date.now()}`;
    await page.locator('.modal .field').filter({ hasText: 'Project Name' }).locator('.field-input').fill(projectName);
    await page.getByRole('button', { name: 'Create Project' }).click();
    await expect(page.locator('.modal')).not.toBeVisible({ timeout: 5000 });

    // Project card left border should show the selected color
    const projectCard = page.locator('.prj-card', { hasText: projectName });
    await expect(projectCard).toBeVisible({ timeout: 5000 });

    // Check the CSS variable --pc is set to pink
    await expect(projectCard).toHaveCSS('--pc', pinkColor);
  });

  // ─── 5. Multiple projects show in grid ──────────────────────────────────────
  test('multiple projects show in grid', async ({ page }) => {
    await authenticateUser(page);

    const ts = Date.now();
    const projects = [
      `Project Alpha ${ts}`,
      `Project Beta ${ts}`,
      `Project Gamma ${ts}`,
    ];

    // Create 3 projects
    for (const projectName of projects) {
      await createProjectViaUI(page, projectName);
      await page.waitForTimeout(500);
    }

    // Navigate to projects view to see all
    await page.locator('.sb-item', { hasText: 'Projects' }).click();
    await expect(page.locator('.page-wrap')).toBeVisible({ timeout: 5000 });

    // All 3 project cards should be visible
    for (const projectName of projects) {
      await expect(page.locator('.prj-card-name', { hasText: projectName })).toBeVisible();
    }
  });

  // ─── 6. Click project navigates to board ────────────────────────────────────
  test('click project navigates to board', async ({ page }) => {
    await authenticateUser(page);

    const projectName = `Board Nav Project ${Date.now()}`;
    await createProjectViaUI(page, projectName);

    // Navigate back to projects view
    await page.locator('.sb-item', { hasText: 'Projects' }).click();
    await expect(page.locator('.page-wrap')).toBeVisible({ timeout: 5000 });

    // Click on the project card
    await page.locator('.prj-card', { hasText: projectName }).click();

    // Board view loads with the 4 columns
    await expect(page.locator('.board-cols')).toBeVisible({ timeout: 5000 });

    const columns = page.locator('.col-label');
    await expect(columns).toHaveCount(4);
    await expect(page.locator('.col-label', { hasText: 'To Do' })).toBeVisible();
    await expect(page.locator('.col-label', { hasText: 'In Progress' })).toBeVisible();
    await expect(page.locator('.col-label', { hasText: 'In Review' })).toBeVisible();
    await expect(page.locator('.col-label', { hasText: 'Done' })).toBeVisible();
  });

  // ─── 7. Project shows task count ────────────────────────────────────────────
  test('project shows task count', async ({ page }) => {
    await authenticateUser(page);

    const projectName = `Task Count Project ${Date.now()}`;
    await createProjectViaUI(page, projectName);

    // Navigate to board view
    await expect(page.locator('.board-cols')).toBeVisible({ timeout: 5000 });

    // Add 2 tasks
    await createTaskViaUI(page, 'Count Task 1');
    await page.waitForTimeout(500);
    await createTaskViaUI(page, 'Count Task 2');
    await page.waitForTimeout(500);

    // Go back to projects view
    await page.locator('.sb-item', { hasText: 'Projects' }).click();
    await expect(page.locator('.page-wrap')).toBeVisible({ timeout: 5000 });

    // Verify the project card has 2 tasks listed in its meta section
    const projectCard = page.locator('.prj-card', { hasText: projectName });
    await expect(projectCard).toBeVisible();

    const taskCountItem = projectCard.locator('.prj-meta-item').filter({ hasText: 'tasks' });
    await expect(taskCountItem).toContainText('2');
  });
});
