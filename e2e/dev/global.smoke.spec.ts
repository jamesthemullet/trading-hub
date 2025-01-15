/* eslint-disable testing-library/prefer-screen-queries */

import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('Global Ranking', () => {
  test('creates new ruleset', async ({ page }) => {
    await page.goto('/global/facets');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Global Facet Management' })
    ).toBeVisible();

    await expect(
      page.getByRole('link', { name: 'Add new rule' })
    ).toBeVisible();
    await expect(
      page.getByText('0 results', { exact: true })
    ).not.toBeVisible();

    await page.getByRole('link', { name: 'Add new rule' }).click();

    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Global Facet Rule Editor' })
    ).toBeVisible();

    await expect(
      page.getByLabel('Row showing Age as algoControl')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Global Facet Management' })
    ).toBeVisible();

    const checkbox = page
      .locator('label[title="Toggle"] input[type="checkbox"]')
      .first();

    await expect(checkbox).not.toBeChecked();

    await page.locator('label[title="Toggle"]').first().click();

    await expect(checkbox).toBeChecked();

    await page.getByRole('link', { name: 'Edit' }).first().click();
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByLabel('Row showing Absorbency Level 1 as algoControl')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Algo control' }).first().click();
    await page.getByRole('button', { name: 'include', exact: true }).click();

    await page.getByRole('button', { name: 'Algo control' }).first().click();
    await page.getByRole('button', { name: 'exclude', exact: true }).click();

    await expect(
      page.getByLabel('Row showing Absorbency Level 1 as included')
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'Edit display name for Absorbency Level 1' })
      .click();
    await page
      .getByLabel('Edit Absorbency Level 1 input field')
      .fill('Level Of Absorbency 1');
    await page
      .getByRole('button', { name: 'Save Absorbency Level 1 change' })
      .click();

    await page.waitForLoadState('networkidle');

    await expect(
      page.getByLabel('Row showing Absorbency Level 1 as included')
    ).not.toBeVisible();
    await expect(
      page.getByLabel('Row showing Level Of Absorbency 1 as included')
    ).toBeVisible();

    await page
      .getByRole('button', {
        name: 'Edit display name for Level Of Absorbency 1',
      })
      .click();
    await page
      .getByLabel('Edit Level Of Absorbency 1 input field')
      .fill('Absorbency Level 1');
    await page
      .getByRole('button', { name: 'Save Level Of Absorbency 1 change' })
      .click();

    await expect(
      page.getByLabel('Row showing Absorbency Level 1 as included')
    ).toBeVisible();
    await expect(
      page.getByLabel('Row showing Level Of Absorbency 1 as included')
    ).not.toBeVisible();

    await page.getByRole('button', { name: 'Save' }).click();

    await page.waitForLoadState('networkidle');
  });

  test('edits a ruleset', async ({ page }) => {
    await page.goto('/global/rulesets');
    await page.waitForLoadState('networkidle');

    await page.getByRole('link', { name: 'Edit' }).first().click();
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
  });

  test('keeps changes for facets and products', async ({ page }) => {
    await page.goto('/global/facets');
    await page.waitForLoadState('networkidle');

    await page.getByRole('link', { name: 'Edit' }).first().click();
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByLabel('Row showing Absorbency Level 1 as included')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Setup' }).click();
    await page.getByRole('link', { name: 'Global Category Ranking' }).click();

    await expect(
      page.getByRole('heading', { name: 'Global category ranking rules' })
    ).toBeVisible();

    await page.getByRole('link', { name: 'Edit' }).first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: 'Changes2' })).toBeVisible();
  });

  test('sets up a merge group', async ({ page }) => {
    await page.goto('/global/facets');
    await page.waitForLoadState('networkidle');

    await page.getByRole('link', { name: 'Edit' }).first().click();
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder('Search...').click();
    await page.getByPlaceholder('Search...').fill('Assembly Type');
    await page.waitForTimeout(2000);

    await page.getByRole('button', { name: 'Edit values' }).first().click();
    await page.waitForTimeout(5000);

    await expect(
      page.getByRole('heading', {
        name: 'Facet value settings of: Assembly Type',
      })
    ).toBeVisible();

    await page.getByLabel('Select Easy fit to merge').click();
    await page.getByLabel('Select Partial assembly required to merge').click();

    await expect(page.getByRole('button', { name: 'Merge (2)' })).toBeVisible();

    await page.getByRole('button', { name: 'Merge (2)' }).click();

    await page.getByLabel('Edit Name your merge input field').click();
    await page
      .getByLabel('Edit Name your merge input field')
      .fill('A merged group name');

    await page.getByLabel('Save Name your merge change').click();

    await page.waitForTimeout(3000);

    await expect(
      page.getByLabel('Edit display name for A merged group name')
    ).toBeVisible();
  });

  test('deletes a ruleset', async ({ page }) => {
    await page.goto('/global/rulesets');
    await page.waitForLoadState('networkidle');

    const currentCount =
      (await page.getByLabel('results count').textContent()) || '';
    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByLabel('Delete rule').click();

    await expect(
      page.getByText(`${parseInt(currentCount) - 1} results`, { exact: true })
    ).toBeVisible();
  });
});
