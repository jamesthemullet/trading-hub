import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

const validProduct = '60509377';

test.describe('Product Status', () => {
  test('displays correct product status and finds operational product', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Product Status' }).click();

    await expect(
      page.getByRole('heading', { name: 'Product status search' })
    ).toBeVisible();

    const searchBox = page.getByRole('searchbox', {
      name: 'Search by P number',
    });
    await searchBox.click();
    await searchBox.fill(validProduct);
    await searchBox.press('Enter');

    await expect(page.getByRole('main')).toContainText(
      'Product is operational'
    );
  });

  test('displays correct product status and finds non-operational product', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Product Status' }).click();

    await expect(
      page.getByRole('heading', { name: 'Product status search' })
    ).toBeVisible();

    const searchBox = page.getByRole('searchbox', {
      name: 'Search by P number',
    });
    await searchBox.click();
    await searchBox.fill('123');
    await searchBox.press('Enter');
    await expect(page.getByRole('main')).toContainText('2 issues detected');
  });
});
