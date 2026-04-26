import { test, expect } from '@playwright/test';
import { uniqueEmail, registerUser, goToLanding, goToLoginFromLanding, clearAuthState } from './helpers/test-utils';

test.describe('Authentication — 8 Tests', () => {

  // ─── 1. Landing page loads correctly ────────────────────────────────────────
  test('landing page loads correctly', async ({ page }) => {
    await goToLanding(page);

    // "Ship features" heading is visible
    await expect(page.locator('.land-h1')).toContainText('Ship features');

    // Nav links are present
    await expect(page.locator('.land-nav-link', { hasText: 'Features' })).toBeVisible();
    await expect(page.locator('.land-nav-link', { hasText: 'Tech Stack' })).toBeVisible();
    await expect(page.locator('.land-nav-link', { hasText: 'Workflow' })).toBeVisible();

    // Sign in button visible in nav
    await expect(page.locator('.land-nav-actions').getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
  });

  // ─── 2. Sign in button navigates to login ───────────────────────────────────
  test('sign in button navigates to login', async ({ page }) => {
    await goToLanding(page);

    // Click "Sign in" in nav (scoped to nav actions to avoid hero duplicate)
    await goToLoginFromLanding(page);

    // Login form with email + password fields visible
    await expect(page.locator('.field-label', { hasText: 'Email' })).toBeVisible();
    await expect(page.locator('.field-label', { hasText: 'Password' })).toBeVisible();

    // Login heading text
    await expect(page.getByText('Sign in to your workspace')).toBeVisible();
  });

  // ─── 3. "Create one" link navigates to register ────────────────────────────
  test('create one link navigates to register', async ({ page }) => {
    await goToLanding(page);
    await goToLoginFromLanding(page);

    // Click the toggle link to register
    await page.getByRole('button', { name: /Don't have an account/i }).click();

    // Register form with name/email/password/confirm fields
    await expect(page.getByText('Create your account')).toBeVisible();
    await expect(page.locator('.field-label', { hasText: 'Name' })).toBeVisible();
    await expect(page.locator('.field-label', { hasText: 'Email' })).toBeVisible();
    await expect(page.locator('.field-label', { hasText: /^Password$/ })).toBeVisible();
    await expect(page.locator('.field-label', { hasText: 'Confirm Password' })).toBeVisible();
  });

  // ─── 4. Register new user successfully ──────────────────────────────────────
  test('register new user successfully', async ({ page }) => {
    const email = uniqueEmail();
    const password = 'Test@1234';
    const name = 'E2E Test User';

    await registerUser(page, name, email, password);

    // Success toast message shown
    await expect(page.locator('.toast.success')).toContainText('Registration successful', { timeout: 10000 });

    // Auto-redirected to login page
    await expect(page.getByText('Sign in to your workspace')).toBeVisible({ timeout: 5000 });
  });

  // ─── 5. Register with existing email shows error ────────────────────────────
  test('register with existing email shows error', async ({ page }) => {
    const email = uniqueEmail();
    const password = 'Test@1234';
    const name = 'Duplicate User';

    // Register the first time
    await registerUser(page, name, email, password);
    await expect(page.locator('.toast.success')).toContainText('Registration successful', { timeout: 10000 });

    // Wait for the redirect to login
    await expect(page.getByText('Sign in to your workspace')).toBeVisible({ timeout: 5000 });

    // Toggle to register form from login page
    await page.getByRole('button', { name: /Don't have an account/i }).click();
    await expect(page.getByText('Create your account')).toBeVisible({ timeout: 5000 });

    // Fill in same email again
    await page.locator('.field').filter({ hasText: 'Name' }).locator('.field-input').fill(name);
    await page.locator('.field').filter({ hasText: 'Email' }).locator('.field-input').fill(email);
    await page.locator('.field').filter({ hasText: /^Password$/ }).locator('.field-input').fill(password);
    await page.locator('.field').filter({ hasText: 'Confirm Password' }).locator('.field-input').fill(password);

    await page.getByRole('button', { name: /Create account/i }).click();

    // "Email already exists" error banner visible
    await expect(page.locator('.app-error')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.app-error')).toContainText(/email already exists|already registered|already in use/i);
  });

  // ─── 6. Register validates password match ───────────────────────────────────
  test('register validates password match', async ({ page }) => {
    await goToLanding(page);
    await goToLoginFromLanding(page);

    // Toggle to register
    await page.getByRole('button', { name: /Don't have an account/i }).click();
    await expect(page.getByText('Create your account')).toBeVisible({ timeout: 5000 });

    // Fill form with mismatched passwords
    await page.locator('.field').filter({ hasText: 'Name' }).locator('.field-input').fill('Mismatch User');
    await page.locator('.field').filter({ hasText: 'Email' }).locator('.field-input').fill(uniqueEmail());
    await page.locator('.field').filter({ hasText: /^Password$/ }).locator('.field-input').fill('Password123');
    await page.locator('.field').filter({ hasText: 'Confirm Password' }).locator('.field-input').fill('DifferentPassword');

    // Submit
    await page.getByRole('button', { name: /Create account/i }).click();

    // "Passwords do not match" shown
    await expect(page.locator('.app-error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.app-error')).toContainText('Passwords do not match');
  });

  // ─── 7. Login with valid credentials ────────────────────────────────────────
  test('login with valid credentials', async ({ page }) => {
    const email = uniqueEmail();
    const password = 'Test@1234';
    const name = 'Login Test User';

    // Register first
    await registerUser(page, name, email, password);
    await expect(page.locator('.toast.success')).toContainText('Registration successful', { timeout: 10000 });
    await expect(page.getByText('Sign in to your workspace')).toBeVisible({ timeout: 5000 });

    // Now login (we're already on the login page after registration redirect)
    await page.locator('.field').filter({ hasText: 'Email' }).locator('.field-input').fill(email);
    await page.locator('.field').filter({ hasText: 'Password' }).locator('.field-input').fill(password);
    await page.getByRole('button', { name: /Sign in/i }).click();

    // Dashboard loads with user's name displayed
    await expect(page.locator('.app-shell')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.u-name')).toContainText(name);
  });

  // ─── 8. Login with wrong password shows error ───────────────────────────────
  test('login with wrong password shows error', async ({ page }) => {
    await goToLanding(page);
    await goToLoginFromLanding(page);

    // Enter invalid credentials
    await page.locator('.field').filter({ hasText: 'Email' }).locator('.field-input').fill('nonexistent@test.com');
    await page.locator('.field').filter({ hasText: 'Password' }).locator('.field-input').fill('WrongPassword123');

    await page.getByRole('button', { name: /Sign in/i }).click();

    // Error banner with "Invalid credentials" visible
    await expect(page.locator('.app-error')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.app-error')).toContainText(/invalid credentials|login failed|unauthorized/i);
  });
});
