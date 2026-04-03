import { test, expect } from '@playwright/test';

test('home page loads', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Verde Vale/);
  await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  await expect(
    page.getByRole('link', { name: /Ver planos/i }).first(),
  ).toBeVisible();
});
