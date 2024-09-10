import { expect, test } from '@playwright/test';

import { setupElastic } from '../../elastic/elastic';
import { create500ErrorsCollector } from '../utils';

test('creates and deletes new ruleset', async ({ page }) => {
  await setupElastic();

  const get500Errors = create500ErrorsCollector(page);

  await page.goto('/category/rulesets');
  await expect(
    page.getByRole('heading', { name: 'Category ranking rules' })
  ).toBeVisible();

  await page.waitForLoadState('networkidle');
  expect(get500Errors()).toEqual([]);

  await page.getByRole('link', { name: 'Add new rule' }).click();

  await page.waitForLoadState();

  await page.getByPlaceholder('Search...').click();
  await page.getByPlaceholder('Search...').fill('SubCategory_10102');
  await page.getByText('SubCategory_10102 | Joggers').click();

  await expect(page.getByLabel('Position 1')).toBeVisible();

  await page
    .getByLabel('Position 1')
    .getByRole('button', { name: 'Open menu' })
    .click();
  await page.getByRole('button', { name: 'Boost to Top' }).click();

  await page
    .getByLabel('Position 2')
    .getByRole('button', { name: 'Open menu' })
    .click();
  await page.getByRole('button', { name: 'Bury to Bottom' }).click();

  await page.getByRole('button', { name: 'Changes2' }).click();
  await expect(
    page.getByRole('heading', { name: 'Boosted Products (1)' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Buried Products (1)' })
  ).toBeVisible();

  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('SubCategory_10102 |').first()).toBeVisible();

  await page.getByRole('button', { name: 'More options' }).first().click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.getByLabel('Delete rule').click();

  await expect(page.getByText('0 results')).toBeVisible();
});
