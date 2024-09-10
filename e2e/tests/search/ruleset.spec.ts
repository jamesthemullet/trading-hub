import { expect, test } from '@playwright/test';

import { setupElastic } from '../../elastic/elastic';
import { create500ErrorsCollector } from '../utils';

test.describe.configure({ mode: 'serial' });

test.describe('Keyword search', () => {
  test.beforeAll(async () => {
    await setupElastic();
  });

  test.beforeEach(async ({ page }) => {
    const get500Errors = create500ErrorsCollector(page);

    await page.goto('/search/rulesets');
    await page.waitForLoadState('networkidle');
    expect(get500Errors()).toEqual([]);
  });

  test('creates a new ruleset', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Search ranking rules' })
    ).toBeVisible();

    await page.getByRole('link', { name: 'Add new rule' }).click();

    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();

    await page.getByLabel('Add keyword').fill('sock');
    await page.getByLabel('Add keyword').press('Enter');

    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Create' }).click();

    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: 'Search ranking rules' })
    ).toBeVisible();
  });

  test('enables a ruleset', async ({ page }) => {
    await expect(page.getByTitle('sock').first()).toBeVisible();

    await page.getByTitle('Toggle').first().locator('span').click();

    await page.waitForLoadState('networkidle');

    await expect(
      page.getByTitle('Toggle').first().locator('input')
    ).toBeChecked();
  });

  test('deletes a ruleset', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Search ranking rules' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByLabel('Delete rule').click();

    await expect(page.getByText('0 results')).toBeVisible();
  });
});
