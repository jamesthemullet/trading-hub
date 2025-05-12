/* eslint-disable testing-library/prefer-screen-queries */

import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('Search Ranking', () => {
  test('creates new ruleset', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Search' })).toBeVisible();

    await expect(
      page.getByRole('link', { name: 'Add facet rule' })
    ).toBeVisible();
    await expect(
      page.getByText('0 results', { exact: true })
    ).not.toBeVisible();

    await page.getByRole('link', { name: 'Add facet rule' }).click();

    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Facet Rule Editor' })
    ).toBeVisible();

    await page.getByLabel('Add keyword').click();
    await page.getByLabel('Add keyword').fill('Black Dress');
    await page.getByLabel('Add keyword').press('Enter');
    await page.getByLabel('Add keyword').fill('Sequin Dress');
    await page.getByLabel('Add keyword').press('Enter');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(page.getByText('Black Dress')).toBeVisible();

    await page.getByRole('button', { name: 'Create' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Search' })).toBeVisible();

    await page.getByPlaceholder('Search...').click();
    await page.getByPlaceholder('Search...').fill('Sequin Dress');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(page.getByText('Sequin Dress').first()).toBeVisible();

    const checkbox = page
      .locator('label[title="Toggle"] input[type="checkbox"]')
      .first();

    await expect(checkbox).not.toBeChecked();

    await page.locator('label[title="Toggle"]').first().click();

    await expect(checkbox).toBeChecked();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit ranking rule' }).click();
    await page.waitForLoadState('networkidle');
  });

  test('edits a ruleset', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2024-11-05T10:00:00'));
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('Search...').click();
    await page.getByPlaceholder('Search...').fill('Sequin Dress');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(page.getByText('Sequin Dress').first()).toBeVisible();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit ranking rule' }).click();
    await page.waitForLoadState('networkidle');

    const product2Id =
      (await page
        .getByLabel('Position 2', { exact: true })
        .getByTestId('product id')
        .textContent()) || '';

    await page
      .getByLabel('Position 1', { exact: true })
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Boost to Top' }).click();

    await expect(page.getByLabel('Position 2', { exact: true })).toBeVisible();
    await page
      .getByLabel('Position 2', { exact: true })
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Bury to Bottom' }).click();

    await page.waitForTimeout(3000);
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
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByText('Sequin Dress').first()).toBeVisible();
    await expect(page.getByRole('time').first()).toHaveText(
      '14 Nov 2024 - 19 Nov 2024'
    );
  });

  test('duplicates and edits a rule', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('Search...').click();
    await page.getByPlaceholder('Search...').fill('Sequin Dress');
    await page.waitForTimeout(2000);
    await expect(page.getByText('Sequin Dress').first()).toBeVisible();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('button', { name: 'Duplicate' }).click();
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Create a duplicate rule' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit ranking rule' }).click();
    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'select market' }).click();
    await page.getByRole('button', { name: 'select IE market only' }).click();

    await page
      .getByRole('button', { name: 'Remove keyword: Black Dress' })
      .click();

    await page.getByLabel('Add keyword').click();
    await page.getByLabel('Add keyword').fill('Green Dress');
    await page.getByLabel('Add keyword').press('Enter');

    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Green Dress')).toBeVisible();

    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Green Dress')).toBeVisible();
  });

  test('deletes a ruleset', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('Search...').click();
    await page.getByPlaceholder('Search...').fill('Sequin Dress');
    await page.waitForTimeout(2000);
    await expect(page.getByText('Sequin Dress').first()).toBeVisible();

    const currentCount =
      (await page.getByTestId('results count').textContent()) || '';
    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByTestId('Delete rule').click();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByTestId('Delete rule').click();

    await expect(
      page.getByText(`${parseInt(currentCount) - 1} results`, { exact: true })
    ).toBeVisible();
  });
});
