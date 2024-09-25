/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable testing-library/prefer-screen-queries */

import { expect, test } from '@playwright/test';

test.describe('Smoke tests', () => {
  test('edits ruleset facets', async ({ page }) => {
    await page.goto('/category/facets');
    await expect(
      page.getByRole('heading', { name: 'Category Facet Management' })
    ).toBeVisible();

    await expect(
      page.getByRole('link', { name: 'Add new facet' })
    ).toBeVisible();
    await expect(page.getByText('0 results')).not.toBeVisible();
  });
});
