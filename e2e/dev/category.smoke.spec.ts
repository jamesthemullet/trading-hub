import { expect, test } from '@playwright/test';

import {
  clickCreateAndConfirmReview,
  clickSaveAndConfirmReviewIfPresent,
  searchAndWaitForResults,
} from '../helpers';

test.describe.configure({ mode: 'serial' });

const TEST_CATEGORY_ID = 'SubCategory_1842397';
const TEST_CATEGORY_NAME = 'SubCategory_1842397 | Socks | l/men/socks';
const TEST_CATEGORY_IDENTIFIER = 'SubCategory_1842397 - Socks';

test.describe('Category Ranking', () => {
  test.beforeAll(async ({ request }) => {
    const res = await request.get(
      `/api/search/beta/merchandising/category/ruleset?q=${TEST_CATEGORY_ID}&start=0&rows=100`
    );
    if (!res.ok()) throw new Error(`Cleanup GET failed: ${res.status()}`);
    const { ruleSets = [] } = await res.json();
    const deletes = await Promise.all(
      ruleSets.map(({ id }: { id: string }) =>
        request.delete(`/api/search/beta/merchandising/category/ruleset/${id}`)
      )
    );
    for (const del of deletes) {
      if (!del.ok()) throw new Error(`Cleanup DELETE failed: ${del.status()}`);
    }
  });

  test('creates new ruleset', async ({ page }) => {
    await page.goto('/category');
    await expect(
      page.getByRole('heading', { name: 'Categories' })
    ).toBeVisible();

    await expect(
      page.getByRole('link', { name: 'Add facet rule' })
    ).toBeVisible();
    await expect(page.getByText('0 results', { exact: true })).toBeHidden();

    await page.getByRole('link', { name: 'Add facet rule' }).click();

    await expect(
      page.getByRole('heading', { name: 'Facet Rule Editor' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.getByLabel('Search categories').click();
    await page.getByLabel('Search categories').fill(TEST_CATEGORY_ID);

    await expect(page.getByText(TEST_CATEGORY_NAME)).toBeVisible();
    await page.getByText(TEST_CATEGORY_NAME).click();
    await page.getByRole('button', { name: 'Close' }).click();

    await clickCreateAndConfirmReview(page);
    await expect(
      page.getByRole('heading', { name: 'Categories' })
    ).toBeVisible();

    await searchAndWaitForResults(page, TEST_CATEGORY_ID);

    const checkbox = page
      .locator('label[title="Toggle"] input[type="checkbox"]')
      .first();

    await expect(checkbox).toBeChecked();

    await page.locator('label[title="Toggle"]').first().click();

    await expect(
      page.getByRole('heading', { name: 'Review changes' })
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'Save changes', exact: true })
      .click();

    await expect(checkbox).not.toBeChecked();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit facet rule' }).click();

    await expect(page.getByText('fabric')).toBeVisible();
    await expect(page.getByText('categoryId')).toBeVisible();

    await page
      .getByTestId('Row showing Material as algoControl')
      .getByRole('button', { name: 'Algo control' })
      .first()
      .click();
    await page
      .getByRole('menuitemradio', { name: 'Include only', exact: true })
      .click();

    await page
      .getByTestId('Row showing Denier as algoControl')
      .getByRole('button', { name: 'Algo control' })
      .first()
      .click();
    await page
      .getByRole('menuitemradio', { name: 'Exclude only', exact: true })
      .click();

    await page.getByRole('button', { name: 'Preview', exact: true }).click();

    await expect(
      page.getByRole('button', { name: 'Brand', exact: true })
    ).toBeVisible();

    await page.getByRole('button', { name: 'close modal' }).click();
    await clickSaveAndConfirmReviewIfPresent(page);
  });

  test('edits a ruleset', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2024-11-05T10:00:00'));
    await page.goto('/category');

    await searchAndWaitForResults(page, TEST_CATEGORY_ID);

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit ranking rule' }).click();

    const product2Id =
      (await page
        .getByTestId('Position 2')
        .getByTestId('product id')
        .textContent()) ?? '';

    await page
      .getByTestId('Position 1')
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Boost to Top' }).click();

    await expect(page.getByTestId('Position 2')).toBeVisible();
    await page
      .getByTestId('Position 2')
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Bury to Bottom' }).click();

    await expect(page.getByText(product2Id)).not.toBeInViewport();

    await expect(page.getByRole('button', { name: 'Changes2' })).toBeVisible();
    await page.getByRole('button', { name: 'Changes2' }).click();
    await expect(
      page.getByRole('heading', { name: 'Boosted Products (1)' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Buried Products (1)' })
    ).toBeVisible();

    await page.getByPlaceholder('Select date range').click();

    await expect(
      page.getByRole('heading', { name: 'Rule date and time duration' })
    ).toBeVisible();

    await page.getByTitle('Toggle').click();
    await page.getByLabel('14 November 2024').click();
    await page.getByLabel('14 November 2024').click();
    await page.getByLabel('19 November 2024').click();
    await expect(
      page.getByText('Nov 14 2024 00:00 - Nov 19 2024 23:59')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Close schedule editor' }).click();

    await page.getByRole('button', { name: 'Product', exact: true }).click();

    await page
      .getByTestId('Position 5')
      .getByLabel('Select', { exact: false })
      .click();
    await page
      .getByTestId('Position 6')
      .getByLabel('Select', { exact: false })
      .click();

    await expect(page.getByText('2 items selected')).toBeVisible();

    await page.getByPlaceholder('Search for product').fill('black');

    await expect(page.getByText('result', { exact: false })).toBeVisible();

    await expect(
      page
        .getByTestId('Product Search Container')
        .getByTestId('Position 1')
        .getByLabel('Select', { exact: false })
    ).toBeDisabled();

    await page.getByRole('button', { name: 'Bulk actions' }).click();
    await page.getByRole('button', { name: 'Block Product' }).click();

    await expect(page.getByText('Apply new bulk action')).toBeVisible();
    await page.getByRole('button', { name: 'Apply action' }).click();

    await page.getByRole('button', { name: 'Changes', exact: false }).click();

    await expect(
      page.getByRole('heading', { name: 'Blocked Products (2)' })
    ).toBeVisible();

    await clickSaveAndConfirmReviewIfPresent(page);

    await expect(
      page.getByText(TEST_CATEGORY_IDENTIFIER).first()
    ).toBeVisible();
    await expect(page.getByRole('time').first()).toHaveText(
      '14 Nov 2024 - 19 Nov 2024'
    );
  });

  test('keeps changes for facets and products', async ({ page }) => {
    await page.goto('/category');

    await searchAndWaitForResults(page, TEST_CATEGORY_ID);

    await expect(page.getByRole('time').first()).toHaveText(
      '14 Nov 2024 - 19 Nov 2024'
    );

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit facet rule' }).click();

    await expect(
      page.getByTestId('Row showing Material as included')
    ).toBeVisible();
    await expect(
      page.getByTestId('Row showing Denier as excluded')
    ).toBeVisible();

    await page.getByTitle('Category Rules').click();

    await expect(
      page.getByRole('heading', { name: 'Categories' })
    ).toBeVisible();

    await searchAndWaitForResults(page, TEST_CATEGORY_ID);

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit ranking rule' }).click();
    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();

    await expect(page.getByRole('button', { name: 'Changes4' })).toBeVisible();
  });

  test('duplicates and edits a rule', async ({ page }) => {
    await page.goto('/category');

    await searchAndWaitForResults(page, TEST_CATEGORY_ID);

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('button', { name: 'Duplicate' }).click();
    await expect(
      page.getByRole('heading', { name: 'Create a duplicate rule' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(
      page.getByText('SubCategory_1842397 - Socks').first()
    ).toBeVisible();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit ranking rule' }).click();
    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Select country' }).click();

    await page.getByRole('menuitemradio', { name: 'IE market only' }).click();

    await page.getByRole('button', { name: 'Edit', exact: true }).click();

    await page.getByLabel('Search categories').click();
    await page.getByLabel('Search categories').fill('Scarves');

    await page
      .getByRole('button', { name: 'Select category IE_SubCategory_1012341' })
      .click();
    await page.getByRole('button', { name: 'Additional category' }).click();

    await expect(
      page.getByText('Scarf', { exact: false }).first()
    ).toBeVisible();

    await page.getByRole('button', { name: 'Close' }).click();

    await clickSaveAndConfirmReviewIfPresent(page);

    await expect(
      page.getByRole('heading', { name: 'Categories' })
    ).toBeVisible();
    await expect(
      page.getByText('IE_SubCategory_1012341 - Scarves').first()
    ).toBeVisible();
  });

  test('deletes a ruleset', async ({ page }) => {
    await page.goto('/category');

    await searchAndWaitForResults(page, TEST_CATEGORY_ID);

    const currentCount =
      (await page.getByTestId('results count').textContent()) ?? '';
    const totalItemsMatch = currentCount.match(/out of\s+(\d+)/);
    expect(
      totalItemsMatch,
      `Unexpected results count format: "${currentCount}"`
    ).not.toBeNull();
    const totalItems = parseInt(totalItemsMatch?.[1] ?? '', 10);
    expect(
      totalItems,
      `Expected at least 2 rulesets before deletion, but found ${totalItems}`
    ).toBeGreaterThanOrEqual(2);
    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByTestId('Delete rule').click();

    await expect(page.getByTestId('results count')).toContainText(
      `out of ${totalItems - 1}`
    );

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByTestId('Delete rule').click();

    await expect(page.getByTestId('results count')).toContainText(
      `out of ${totalItems - 2}`
    );
  });
});
