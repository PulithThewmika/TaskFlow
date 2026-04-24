import { test, expect } from '@playwright/test';

test.describe('Task Form — Edge Cases & Validation', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('email-input').fill('demo@taskflow.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.goto('/projects/1/board');
  });

  test('should show validation error when task title is empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.getByRole('button', { name: 'Create Task' }).click();  // Submit empty

    await expect(page.getByTestId('title-error')).toBeVisible();
    await expect(page.getByTestId('title-error')).toHaveText('Title is required');
  });

  test('should show empty state when no tasks exist', async ({ page }) => {
    // Navigate to a fresh project
    await page.goto('/projects/999/board');
    await expect(page.getByTestId('empty-board-state')).toBeVisible();
    await expect(page.getByText('No tasks yet')).toBeVisible();
  });

  test('should disable Create button when submitting', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.getByTestId('task-title-input').fill('Async test task');
    await page.getByRole('button', { name: 'Create Task' }).click();

    // Button should be disabled during submission
    await expect(page.getByRole('button', { name: 'Creating...' })).toBeDisabled();
  });

  test('should reject past deadline date', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.getByTestId('task-title-input').fill('Past deadline task');
    await page.getByTestId('task-deadline-input').fill('2020-01-01');
    await page.getByRole('button', { name: 'Create Task' }).click();

    await expect(page.getByTestId('deadline-error'))
      .toHaveText('Deadline cannot be in the past');
  });
});
