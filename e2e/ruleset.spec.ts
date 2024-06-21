import { test, expect } from '@playwright/test';
import { cookies } from './helpers';

test.beforeEach(async ({ page, context }) => {
  await context.addCookies(cookies);

  await page.route('*/**/api/auth/session', async (route) => {
    const response = await route.fetch();

    const json = {
      expires: '3000-01-01T00:00:00.000Z',
      accessToken: 'abcdefghijklmnopqrst',
    };
    await route.fulfill({ response, json });
  });

  await page.goto('/category/rulesets');
});

test('loads the page', async ({ page }) => {
  await expect(
    page.getByRole('heading', { name: 'Category ranking rules' })
  ).toBeVisible();
});

test('shows rulesets', async ({ page }) => {
  await expect(page.getByText('SubCategory_26225228').first()).toBeVisible();
});
