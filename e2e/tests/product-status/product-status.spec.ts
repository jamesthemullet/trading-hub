import { expect, test } from '@playwright/test';

import { checkAccessibility } from '../accessibility-utils';
import {
  mockNonOperationalProduct,
  mockOperationalProduct,
} from './product-status.mocks';

const DIAGNOSTICS_URL =
  '*/**/api/search/beta/merchandising/product/diagnostics*';

test.describe('Product Status', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Product Status' }).click();
    await expect(
      page.getByRole('heading', { name: 'Product status search' })
    ).toBeVisible();
    await checkAccessibility(page);
  });

  test('displays operational status for a product with no issues', async ({
    page,
  }) => {
    await page.route(DIAGNOSTICS_URL, (route) =>
      route.fulfill({ status: 200, json: mockOperationalProduct })
    );

    const searchBox = page.getByRole('searchbox', {
      name: 'Search by P number',
    });
    await searchBox.click();
    await searchBox.fill('P60509377');
    await searchBox.press('Enter');

    await expect(page.getByRole('main')).toContainText(
      'Product is operational'
    );
    await checkAccessibility(page);
  });

  test('displays issue count for a non-operational product', async ({
    page,
  }) => {
    await page.route(DIAGNOSTICS_URL, (route) =>
      route.fulfill({ status: 200, json: mockNonOperationalProduct })
    );

    const searchBox = page.getByRole('searchbox', {
      name: 'Search by P number',
    });
    await searchBox.click();
    await searchBox.fill('P60509378');
    await searchBox.press('Enter');

    await expect(page.getByRole('main')).toContainText('2 issues detected');
    await checkAccessibility(page);
  });
});
