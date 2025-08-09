import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show landing page for unauthenticated users', async ({ page }) => {
    // Check for landing page elements
    await expect(page.locator('h1')).toContainText('SkifyMagicAI');
    await expect(page.locator('[data-testid="button-get-started"]')).toBeVisible();
  });

  test('should open auth dialog when clicking get started', async ({ page }) => {
    await page.locator('[data-testid="button-get-started"]').click();
    await expect(page.locator('[data-testid="auth-dialog"]')).toBeVisible();
  });

  test('should register a new user', async ({ page }) => {
    // Open auth dialog
    await page.locator('[data-testid="button-get-started"]').click();
    
    // Switch to register tab
    await page.locator('[data-testid="register-tab"]').click();
    
    // Fill registration form
    await page.locator('[data-testid="input-username"]').fill('testuser');
    await page.locator('[data-testid="input-email"]').fill('test@example.com');
    await page.locator('[data-testid="input-password"]').fill('password123');
    
    // Submit form
    await page.locator('[data-testid="button-submit"]').click();
    
    // Wait for redirect to dashboard
    await expect(page.locator('[data-testid="tab-upload"]')).toBeVisible();
  });

  test('should login existing user', async ({ page }) => {
    // Open auth dialog
    await page.locator('[data-testid="button-get-started"]').click();
    
    // Fill login form
    await page.locator('[data-testid="input-email"]').fill('test@example.com');
    await page.locator('[data-testid="input-password"]').fill('password123');
    
    // Submit form
    await page.locator('[data-testid="button-submit"]').click();
    
    // Wait for redirect to dashboard
    await expect(page.locator('[data-testid="tab-upload"]')).toBeVisible();
  });

  test('should show validation error for invalid credentials', async ({ page }) => {
    // Open auth dialog
    await page.locator('[data-testid="button-get-started"]').click();
    
    // Fill with invalid credentials
    await page.locator('[data-testid="input-email"]').fill('invalid@example.com');
    await page.locator('[data-testid="input-password"]').fill('wrongpassword');
    
    // Submit form
    await page.locator('[data-testid="button-submit"]').click();
    
    // Check for error message
    await expect(page.locator('[data-testid="error-alert"]')).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    // Open auth dialog
    await page.locator('[data-testid="button-get-started"]').click();
    
    // Check password field is hidden
    await expect(page.locator('[data-testid="input-password"]')).toHaveAttribute('type', 'password');
    
    // Click toggle button
    await page.locator('[data-testid="toggle-password"]').click();
    
    // Check password field is visible
    await expect(page.locator('[data-testid="input-password"]')).toHaveAttribute('type', 'text');
  });
});