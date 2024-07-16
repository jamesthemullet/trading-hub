import { test, expect } from '@playwright/test';
import { setupElastic } from './elastic/elastic';

test('loads the page', async ({ page }) => {
  await setupElastic();

  await page.goto('/category/rulesets');
  await expect(
    page.getByRole('heading', { name: 'Category ranking rules' })
  ).toBeVisible();
});
