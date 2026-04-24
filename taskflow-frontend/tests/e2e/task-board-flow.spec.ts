import { test, expect } from '@playwright/test';

test.describe('Task Board — Full User Journey', () => {

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByTestId('email-input').fill('demo@taskflow.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create project, add task, and verify on board', async ({ page }) => {
    // Step 1: Create a project
    await page.getByRole('button', { name: 'New Project' }).click();
    await page.getByTestId('project-name-input').fill('E2E Test Project');
    await page.getByTestId('project-desc-input').fill('Created by Playwright');
    await page.getByRole('button', { name: 'Create Project' }).click();

    // Step 2: Verify project appears
    await expect(page.getByText('E2E Test Project')).toBeVisible();

    // Step 3: Navigate into project and create a task
    await page.getByText('E2E Test Project').click();
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.getByTestId('task-title-input').fill('Implement login feature');
    await page.getByTestId('task-priority-select').selectOption('HIGH');
    await page.getByRole('button', { name: 'Create Task' }).click();

    // Step 4: Verify task on Kanban board under TODO column
    const todoColumn = page.getByTestId('column-TODO');
    await expect(todoColumn.getByText('Implement login feature')).toBeVisible();

    // Step 5: Move task to IN_PROGRESS
    await page.getByTestId('task-card-Implement login feature')
              .getByRole('button', { name: 'Move to In Progress' }).click();

    // Step 6: Verify it moved
    const inProgressColumn = page.getByTestId('column-IN_PROGRESS');
    await expect(inProgressColumn.getByText('Implement login feature')).toBeVisible();
  });
});
