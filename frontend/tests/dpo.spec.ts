import { test, expect } from '@playwright/test';
import { login } from './fixtures/login';

test.describe('DPO Page', () => {

  test('login and display DPO table', async ({ page }) => {
    await login(page, 'DPO');
    await expect(page).toHaveURL(/\/dpo/);
    await expect(page.locator('[class*="grid"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('show error with wrong credentials', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#username').fill('wrong@email.com');
    await page.locator('input[type="password"]').fill('wrongpassword');

    await Promise.all([
      page.waitForResponse(
        resp => resp.url().includes('/api/auth/login'),
        { timeout: 15000 }
      ),
      page.locator('button:has-text("LOGIN")').click(),
    ]);

    await expect(
      page.locator('text=/login failed|incorrect|invalid|ไม่ถูกต้อง/i').first()
    ).toBeVisible({ timeout: 5000 });
  });

});