/* eslint-disable testing-library/prefer-screen-queries */

import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('Global Ranking', () => {
  test('creates new ruleset', async ({ page }) => {
    await page.goto('/global');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Global' })).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Add facet rule' })
    ).toBeVisible();
    await expect(
      page.getByText('0 results', { exact: true })
    ).not.toBeVisible();

    await page.getByRole('button', { name: 'Add facet rule' }).click();

    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Global Facet Rule Editor' })
    ).toBeVisible();

    await expect(
      page.getByTestId('Row showing Age as algoControl')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(
      page.getByRole('heading', {
        name: 'Apply global changes',
      })
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'Apply action', exact: true })
      .click();

    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Global' })).toBeVisible();

    const checkbox = page
      .locator('label[title="Toggle"] input[type="checkbox"]')
      .first();

    await expect(checkbox).not.toBeChecked();

    await page.locator('label[title="Toggle"]').first().click();

    await expect(
      page.getByRole('heading', {
        name: 'Apply global changes',
      })
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'Apply action', exact: true })
      .click();

    await expect(checkbox).toBeChecked();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit facet rule' }).click();
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByTestId('Row showing Absorbency Level 1 as algoControl')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Algo control' }).first().click();
    await page.getByRole('button', { name: 'include', exact: true }).click();

    await expect(
      page.getByTestId('Row showing Absorbency Level 1 as included')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(
      page.getByRole('heading', {
        name: 'Apply global changes',
      })
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'Apply action', exact: true })
      .click();

    await page.waitForLoadState('networkidle');
  });

  test('edits a ruleset', async ({ page }) => {
    await page.goto('/global/rulesets');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit ranking rule' }).click();
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder('Search for product').fill('black dress');
    await page.waitForTimeout(400);
    await page.waitForLoadState('networkidle');

    await page
      .getByTestId('product-search-result')
      .getByLabel('Position 1', { exact: true })
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Boost to Top' }).click();

    await expect(page.getByLabel('Position 2', { exact: true })).toBeVisible();
    await page
      .getByTestId('product-search-result')
      .getByLabel('Position 2', { exact: true })
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Bury to Bottom' }).click();

    await page.waitForTimeout(3000);

    await expect(page.getByRole('button', { name: 'Changes2' })).toBeVisible();
    await page.getByRole('button', { name: 'Changes2' }).click();
    await expect(
      page.getByRole('heading', { name: 'Boosted Products (1)' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Buried Products (1)' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(
      page.getByRole('heading', {
        name: 'Apply global changes',
      })
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'Apply action', exact: true })
      .click();
  });

  test('keeps changes for facets and products', async ({ page }) => {
    await page.goto('/global');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit facet rule' }).click();
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: 'Global Facet Rule Editor' })
    ).toBeVisible();

    await expect(
      page.getByTestId('Row showing Absorbency Level 1 as included')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Global Ranking Rules' }).click();
    await page.getByRole('link', { name: 'Global Category Ranking' }).click();

    await expect(page.getByRole('heading', { name: 'Global' })).toBeVisible();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit ranking rule' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: 'Changes2' })).toBeVisible();
  });

  test('deletes a ruleset', async ({ page }) => {
    await page.goto('/global/rulesets');
    await page.waitForLoadState('networkidle');

    const currentCount =
      (await page.getByTestId('results count').textContent()) || '';
    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByTestId('Delete rule').click();

    await expect(
      page.getByText(`${parseInt(currentCount) - 1} results`, { exact: true })
    ).toBeVisible();
  });
});
