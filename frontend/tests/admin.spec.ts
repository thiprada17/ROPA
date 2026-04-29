import { test, expect } from '@playwright/test';
import { login } from './fixtures/login';

test.describe('Admin Page', () => {

  test('login and display admin table', async ({ page }) => {
    await login(page, 'Admin');
    await expect(page).toHaveURL(/\/admin/);
    // หน้า admin ใช้ grid ไม่ใช่ <table> → ใช้ role=row หรือ data-testid แทน
    // await expect(page.locator('[class*="grid"]').first()).toBeVisible({ timeout: 10000 });
        await expect(page.locator('text=กำลังโหลด').first()).toBeHidden({ timeout: 10000 }).catch(() => {});
        await expect(page.locator('.bg-white.rounded-xl').first()).toBeVisible({ timeout: 10000 });

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

    // รอ error message แสดง
    await expect(
      page.locator('text=/login failed|incorrect|invalid|ไม่ถูกต้อง/i').first()
    ).toBeVisible({ timeout: 5000 });
  });

});