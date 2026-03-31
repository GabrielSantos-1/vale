import { test, expect } from '@playwright/test'

test('home page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Verde Vale/)
  await expect(
    page.getByRole('heading', {
      name: /Internet fibra com mais profundidade, clareza e percepção de alto padrão/i,
      level: 1,
    })
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: /Ver planos/i }).first()
  ).toBeVisible()
})
