import { test, expect } from '@playwright/test';

test.describe('Dashboard Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('skify_token', 'mock-token');
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          user: {
            id: 'test-user-id',
            username: 'testuser',
            email: 'test@example.com',
            tier: 'free',
            uploadLimit: 5,
            uploadsUsed: 2
          },
          isAuthenticated: true
        },
        version: 0
      }));
    });

    await page.goto('/');
  });

  test('should display dashboard for authenticated user', async ({ page }) => {
    // Check for dashboard elements
    await expect(page.locator('h1')).toContainText('SkifyMagicAI');
    await expect(page.locator('[data-testid="tab-upload"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-templates"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-jobs"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-settings"]')).toBeVisible();
  });

  test('should show upload quota information', async ({ page }) => {
    // Check quota display
    await expect(page.locator('text=2 / 5')).toBeVisible();
    await expect(page.locator('text=Resets daily')).toBeVisible();
  });

  test('should show upgrade button for free users', async ({ page }) => {
    await expect(page.locator('[data-testid="button-upgrade"]')).toBeVisible();
    await expect(page.locator('text=🆓 Free')).toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    // Test templates tab
    await page.locator('[data-testid="tab-templates"]').click();
    await expect(page.locator('text=My Templates')).toBeVisible();

    // Test jobs tab
    await page.locator('[data-testid="tab-jobs"]').click();
    await expect(page.locator('text=My Renders')).toBeVisible();

    // Test settings tab
    await page.locator('[data-testid="tab-settings"]').click();
    await expect(page.locator('text=Profile Information')).toBeVisible();

    // Back to upload tab
    await page.locator('[data-testid="tab-upload"]').click();
    await expect(page.locator('text=Upload Video for Analysis')).toBeVisible();
  });

  test('should handle file upload dropzone', async ({ page }) => {
    // Check dropzone is present
    await expect(page.locator('text=Drag & drop your video')).toBeVisible();
    
    // Test search functionality would require mocking file selection
    // This is a basic UI test to ensure elements are present
  });

  test('should open upgrade dialog when clicking upgrade button', async ({ page }) => {
    await page.locator('[data-testid="button-upgrade"]').click();
    await expect(page.locator('text=Upgrade to Pro')).toBeVisible();
    await expect(page.locator('text=Pro Monthly')).toBeVisible();
    await expect(page.locator('text=Pro Yearly')).toBeVisible();
  });
});