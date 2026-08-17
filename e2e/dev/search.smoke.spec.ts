import { expect, test } from '@playwright/test';

import {
  clickCreateAndConfirmReview,
  clickSaveAndConfirmReviewIfPresent,
  searchAndWaitForResults,
} from '../helpers';

test.describe.configure({ mode: 'serial' });

test.describe('Search Ranking', () => {
  test.beforeAll(async ({ request }) => {
    const res = await request.get(
      `/api/search/beta/merchandising/keyword/ruleset?q=Sequin+Dress&start=0&rows=100`
    );
    if (!res.ok()) throw new Error(`Cleanup GET failed: ${res.status()}`);
    const { ruleSets = [] } = await res.json();
    const deletes = await Promise.all(
      ruleSets.map(({ id }: { id: string }) =>
        request.delete(`/api/search/beta/merchandising/keyword/ruleset/${id}`)
      )
    );
    for (const del of deletes) {
      if (!del.ok()) throw new Error(`Cleanup DELETE failed: ${del.status()}`);
    }
  });

  test('creates new ruleset', async ({ page }) => {
    await page.goto('/search');
    await expect(page.getByRole('heading', { name: 'Search' })).toBeVisible();

    await expect(
      page.getByRole('link', { name: 'Add facet rule' })
    ).toBeVisible();
    await expect(page.getByText('0 results', { exact: true })).toBeHidden();

    await page.getByRole('link', { name: 'Add facet rule' }).click();
    await expect(
      page.getByRole('heading', { name: 'Facet Rule Editor' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Edit', exact: true }).click();

    await page.getByLabel('Add keyword to list').click();
    await page.getByLabel('Add keyword to list').fill('Black Dress');
    await page.getByLabel('Add keyword to list').press('Enter');
    await page.getByLabel('Add keyword to list').fill('Sequin Dress');
    await page.getByLabel('Add keyword to list').press('Enter');

    await page.getByRole('button', { name: 'Close' }).click();

    const resultsButton = page.getByText('Black Dress').first();
    await expect(resultsButton).toBeVisible();
    await resultsButton.click();

    await clickCreateAndConfirmReview(page);
    await expect(page.getByRole('heading', { name: 'Search' })).toBeVisible();

    await searchAndWaitForResults(page, 'Sequin Dress');
    await expect(page.getByText('Sequin Dress').first()).toBeVisible();

    const checkbox = page
      .locator('label[title="Toggle"] input[type="checkbox"]')
      .first();

    await expect(checkbox).not.toBeChecked();

    await page.locator('label[title="Toggle"]').first().click();

    await expect(
      page.getByRole('heading', { name: 'Review changes' })
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'Save changes', exact: true })
      .click();

    await expect(checkbox).toBeChecked();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit ranking rule' }).click();
  });

  test('edits a ruleset', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2024-11-05T10:00:00'));
    await page.goto('/search');
    await searchAndWaitForResults(page, 'Sequin Dress');
    await expect(page.getByText('Sequin Dress').first()).toBeVisible();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit ranking rule' }).click();

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
    await clickSaveAndConfirmReviewIfPresent(page);

    await expect(page.getByText('Sequin Dress').first()).toBeVisible();
    await expect(page.getByRole('time').first()).toHaveText(
      '14 Nov 2024 - 19 Nov 2024'
    );
  });

  test('duplicates and edits a rule', async ({ page }) => {
    await page.goto('/search');
    await searchAndWaitForResults(page, 'Sequin Dress');
    await expect(page.getByText('Sequin Dress').first()).toBeVisible();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('button', { name: 'Duplicate' }).click();
    await expect(
      page.getByRole('heading', { name: 'Create a duplicate rule' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit ranking rule' }).click();
    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();

    await page.getByTestId('button to open country selector dropdown').click();
    await page.getByRole('menuitemradio', { name: 'IE market only' }).click();

    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page
      .getByRole('button', { name: 'Remove keyword: Black Dress' })
      .click();

    await page.getByLabel('Add keyword to list').click();
    await page.getByLabel('Add keyword to list').fill('Green Dress');
    await page.getByLabel('Add keyword to list').press('Enter');

    await page.getByRole('button', { name: 'Close' }).click();

    await expect(page.getByRole('button', { name: 'Close' })).toBeHidden();

    await expect(page.getByText('sequin dress', { exact: true })).toBeVisible();

    await clickSaveAndConfirmReviewIfPresent(page);

    await expect(page.getByText('Green Dress').first()).toBeVisible();
  });

  test('deletes a ruleset', async ({ page }) => {
    await page.goto('/search');
    await searchAndWaitForResults(page, 'Sequin Dress');
    await expect(page.getByText('Sequin Dress').first()).toBeVisible();

    const currentCount =
      (await page.getByTestId('results count').textContent()) ?? '';
    const totalItems = parseInt(currentCount.split('out of')[1]?.trim() ?? '0');
    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByTestId('Delete rule').click();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByTestId('Delete rule').click();

    await expect(page.getByTestId('results count')).toContainText(
      `out of ${totalItems - 2}`
    );
  });
});
