import { Page } from '@playwright/test';

const emailMap = {
  Admin: 'admin01@gmail.com',
  DPO: 'helloitme2288@gmail.com',
  User: 'user02@gmail.com',
};

const passwordMap = {
  Admin: 'Qwerty123456',
  DPO: 'Qwerty123456',
  User: 'Qwerty123456',
};

export async function login(page: Page, role: 'Admin' | 'DPO' | 'User') {
  await page.goto('/login');

  await page.locator('#username').fill(emailMap[role]);
  await page.locator('input[type="password"]').fill(passwordMap[role]);

  await Promise.all([
    page.waitForResponse(
      resp => resp.url().includes('/api/auth/login') && resp.status() === 200,
      { timeout: 15000 }
    ),
    page.locator('button:has-text("LOGIN")').click(),
  ]);

  if (role === 'Admin') {
    await page.waitForURL(/\/admin/, { timeout: 15000 });
  } else if (role === 'DPO') {
    await page.waitForURL(/\/dpo/, { timeout: 15000 });
  } else if (role === 'User') {
    await page.waitForURL(/\/[Rr]opa/, { timeout: 15000 });
  }
}