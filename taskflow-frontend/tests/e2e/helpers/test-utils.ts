import { Page, expect } from '@playwright/test';

/**
 * Generate a unique email to avoid conflicts between test runs.
 */
export function uniqueEmail(): string {
  return `testuser_${Date.now()}_${Math.floor(Math.random() * 10000)}@test.com`;
}

/**
 * Clear all auth state from localStorage so the app starts at the landing page.
 */
export async function clearAuthState(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
  });
}

/**
 * Navigate to landing page with a clean state (no token).
 */
export async function goToLanding(page: Page) {
  await clearAuthState(page);
  await page.goto('/');
  await expect(page.locator('.land-hero')).toBeVisible({ timeout: 10000 });
}

/**
 * From the landing page, click the nav "Sign in" button to go to login form.
 * Uses the nav-scoped button to avoid the duplicate in the hero section.
 */
export async function goToLoginFromLanding(page: Page) {
  await page.locator('.land-nav-actions').getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.locator('.login-card')).toBeVisible({ timeout: 5000 });
}

/**
 * Register a new user via the UI.
 * Starts from any page — navigates to landing → login → register form.
 * After successful registration, the app redirects to the login page.
 */
export async function registerUser(
  page: Page,
  name: string,
  email: string,
  password: string
) {
  // Navigate to landing page with clean state
  await goToLanding(page);

  // Click "Sign in" in nav to go to login page
  await goToLoginFromLanding(page);

  // Toggle to register form
  await page.getByRole('button', { name: /Don't have an account/i }).click();

  // Wait for the Name field to appear (register mode)
  await expect(page.locator('.field-label', { hasText: 'Name' })).toBeVisible({ timeout: 5000 });

  // Fill in registration form
  await page.locator('.field').filter({ hasText: 'Name' }).locator('.field-input').fill(name);
  await page.locator('.field').filter({ hasText: 'Email' }).locator('.field-input').fill(email);
  await page.locator('.field').filter({ hasText: /^Password$/ }).locator('.field-input').fill(password);
  await page.locator('.field').filter({ hasText: 'Confirm Password' }).locator('.field-input').fill(password);

  // Submit
  await page.getByRole('button', { name: /Create account/i }).click();
}

/**
 * Login an existing user via the UI.
 * Starts from any page — navigates to landing → login form → dashboard.
 */
export async function loginUser(page: Page, email: string, password: string) {
  // Navigate to landing page with clean state
  await goToLanding(page);

  // Click "Sign in" in nav to go to login page
  await goToLoginFromLanding(page);

  // Fill in login form
  await page.locator('.field').filter({ hasText: 'Email' }).locator('.field-input').fill(email);
  await page.locator('.field').filter({ hasText: 'Password' }).locator('.field-input').fill(password);

  // Submit
  await page.getByRole('button', { name: /Sign in/i }).click();

  // Wait for the app shell (dashboard) to load
  await expect(page.locator('.app-shell')).toBeVisible({ timeout: 10000 });
}

/**
 * Create a project via the Projects view UI.
 * Assumes user is already logged in and on the app.
 */
export async function createProjectViaUI(page: Page, name: string, colorTag?: string) {
  // Navigate to Projects view via sidebar
  await page.locator('.sb-item', { hasText: 'Projects' }).click();
  await expect(page.locator('.page-wrap')).toBeVisible({ timeout: 5000 });

  // Click "+ New Project" button
  await page.getByRole('button', { name: '+ New Project' }).click();
  await expect(page.locator('.modal')).toBeVisible({ timeout: 5000 });

  // Fill project name
  await page.locator('.modal .field').filter({ hasText: 'Project Name' }).locator('.field-input').fill(name);

  // Optionally select a color tag
  if (colorTag) {
    await page.locator(`.color-swatch[style*="${colorTag}"]`).click();
  }

  // Click "Create Project"
  await page.getByRole('button', { name: 'Create Project' }).click();

  // Wait for the modal to close
  await expect(page.locator('.modal')).not.toBeVisible({ timeout: 5000 });
}

/**
 * Create a task via the Board view UI.
 * Assumes user is already logged in and on the board view.
 */
export async function createTaskViaUI(page: Page, title: string, priority?: string) {
  // Click "+ New Task" button
  await page.getByRole('button', { name: '+ New Task' }).click();
  await expect(page.locator('.modal')).toBeVisible({ timeout: 5000 });

  // Fill task title
  await page.locator('.modal .field').filter({ hasText: 'Title' }).locator('.field-input').fill(title);

  // Optionally select priority
  if (priority) {
    await page.locator('.modal .field').filter({ hasText: 'Priority' }).locator('.field-input').selectOption(priority);
  }

  // Click "Create Task"
  await page.getByRole('button', { name: '✦ Create Task' }).click();
  await expect(page.locator('.modal')).not.toBeVisible({ timeout: 5000 });
}
