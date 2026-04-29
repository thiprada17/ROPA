import { test, expect } from '@playwright/test';
import { login } from './fixtures/login';

test.describe('ROPA Page', () => {

  test('login and display ROPA table', async ({ page }) => {
    await login(page, 'User');
    await expect(page).toHaveURL(/\/[Rr]opa/);
    // รอ loading หายก่อน แล้วค่อยหา row ใน table
    await expect(page.locator('text=กำลังโหลดข้อมูล ROPA...').first()).toBeHidden({ timeout: 10000 }).catch(() => {});
    await expect(page.locator('.bg-white.rounded-xl').first()).toBeVisible({ timeout: 30000 });
  });

  test('show error with wrong credentials', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#username').fill('wrong@email.com');
    await page.locator('input[type="password"]').fill('wrongpassword');

    await Promise.all([
      page.waitForResponse(
        resp => resp.url().includes('/api/auth/login'),
        { timeout: 300000 }
      ),
      page.locator('button:has-text("LOGIN")').click(),
    ]);

    await expect(
      page.locator('text=/login failed|incorrect|invalid|ไม่ถูกต้อง/i').first()
    ).toBeVisible({ timeout: 5000 });
  });

});