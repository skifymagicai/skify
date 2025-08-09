const { test, expect } = require('@playwright/test');

test.describe('Skify Core - Smoke Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load authentication page', async ({ page }) => {
    // Should show login form
    await expect(page.getByTestId('input-email')).toBeVisible();
    await expect(page.getByTestId('input-password')).toBeVisible();
    await expect(page.getByTestId('button-submit')).toBeVisible();
    await expect(page.getByTestId('button-demo')).toBeVisible();

    // Should have proper title
    await expect(page).toHaveTitle(/Skify/);
  });

  test('should login with demo account', async ({ page }) => {
    // Click demo login
    await page.getByTestId('button-demo').click();

    // Should redirect to upload page after login
    await expect(page.getByTestId('drop-zone')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('input-video-url')).toBeVisible();
  });

  test('should navigate between pages', async ({ page }) => {
    // Login first
    await page.getByTestId('button-demo').click();
    await expect(page.getByTestId('drop-zone')).toBeVisible({ timeout: 10000 });

    // Navigate to templates
    await page.click('text=Templates');
    await expect(page.getByText('Template Library')).toBeVisible();

    // Navigate to renders
    await page.click('text=My Renders');
    await expect(page.getByText('My Renders')).toBeVisible();
    
    // Check for upgrade button (free tier)
    await expect(page.getByTestId('button-upgrade')).toBeVisible();

    // Navigate back to upload
    await page.click('text=Upload');
    await expect(page.getByTestId('drop-zone')).toBeVisible();
  });

  test('should analyze video URL', async ({ page }) => {
    // Login first
    await page.getByTestId('button-demo').click();
    await expect(page.getByTestId('drop-zone')).toBeVisible({ timeout: 10000 });

    // Enter video URL and analyze
    await page.getByTestId('input-video-url').fill('https://example.com/video.mp4');
    await page.getByTestId('button-analyze-url').click();

    // Should show analysis results
    await expect(page.getByText('Analysis Results')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('button-save-template')).toBeVisible();
    await expect(page.getByTestId('button-apply-now')).toBeVisible();
  });

  test('should display templates', async ({ page }) => {
    // Login first
    await page.getByTestId('button-demo').click();
    await expect(page.getByTestId('drop-zone')).toBeVisible({ timeout: 10000 });

    // Navigate to templates
    await page.click('text=Templates');
    
    // Should show template library
    await expect(page.getByText('Template Library')).toBeVisible();
    
    // Should show at least one template (from sample data)
    await expect(page.getByTestId('template-card-1')).toBeVisible();
    await expect(page.getByTestId('button-apply-1')).toBeVisible();
  });

  test('should show renders page with tier info', async ({ page }) => {
    // Login first
    await page.getByTestId('button-demo').click();
    await expect(page.getByTestId('drop-zone')).toBeVisible({ timeout: 10000 });

    // Navigate to renders
    await page.click('text=My Renders');
    
    // Should show renders page
    await expect(page.getByText('My Renders')).toBeVisible();
    
    // Should show free tier info
    await expect(page.getByText('Free Plan')).toBeVisible();
    await expect(page.getByText('720p exports')).toBeVisible();
    await expect(page.getByTestId('button-upgrade')).toBeVisible();
  });

  test('should handle file upload interaction', async ({ page }) => {
    // Login first
    await page.getByTestId('button-demo').click();
    await expect(page.getByTestId('drop-zone')).toBeVisible({ timeout: 10000 });

    // Click on drop zone to trigger file input
    await page.getByTestId('drop-zone').click();
    
    // File input should be present (even if hidden)
    await expect(page.getByTestId('input-file')).toBePresent();
  });

  test('should toggle between login and signup', async ({ page }) => {
    // Should start with login mode
    await expect(page.getByTestId('button-submit')).toHaveText('Sign In');
    await expect(page.getByTestId('button-switch-mode')).toHaveText('Need an account? Sign up');

    // Switch to signup
    await page.getByTestId('button-switch-mode').click();
    await expect(page.getByTestId('button-submit')).toHaveText('Sign Up');
    await expect(page.getByTestId('button-switch-mode')).toHaveText('Have an account? Sign in');

    // Switch back to login
    await page.getByTestId('button-switch-mode').click();
    await expect(page.getByTestId('button-submit')).toHaveText('Sign In');
  });

  test('should show password toggle', async ({ page }) => {
    // Password should be hidden by default
    await expect(page.getByTestId('input-password')).toHaveAttribute('type', 'password');

    // Click toggle button
    await page.getByTestId('button-toggle-password').click();
    await expect(page.getByTestId('input-password')).toHaveAttribute('type', 'text');

    // Click again to hide
    await page.getByTestId('button-toggle-password').click();
    await expect(page.getByTestId('input-password')).toHaveAttribute('type', 'password');
  });

});