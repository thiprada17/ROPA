// tests/example.spec.ts
import { test, expect } from '@playwright/test';

test('has login page', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('button', { name: /LOGIN/i })).toBeVisible();
});