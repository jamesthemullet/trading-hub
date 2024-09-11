import { expect, test } from '@playwright/test';

import { setupElastic } from '../../elastic/elastic';
import { create500ErrorsCollector } from '../utils';

test.describe('global facets', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async () => {
    await setupElastic();
  });

  test.beforeEach(async ({ page }) => {
    const get500Errors = create500ErrorsCollector(page);

    await page.goto('/global/facets');
    await page.waitForLoadState('networkidle');
    expect(get500Errors()).toEqual([]);
  });

  test('creates and deletes new global facet ruleset', async ({ page }) => {
    await setupElastic();

    await page.goto('/global/facets');
    await expect(
      page.getByRole('heading', { name: 'Global Facet Management' })
    ).toBeVisible();

    await page.getByRole('link', { name: 'Add new rule' }).click();

    await expect(
      page.getByText('Applies to all pages in marksandspencer.com')
    ).toBeVisible();

    await page
      .getByLabel('Row showing Categories as')
      .getByTestId('button to open facet order dropdown')
      .click();
    await page.getByRole('button', { name: 'include' }).click();
    await page.getByLabel('Edit display name for Colour').click();
    await page.getByLabel('Edit Colour input field').press('ArrowLeft');
    await page.getByLabel('Edit Colour input field').fill('Color');
    await page.getByLabel('Save Colour change').click();

    await expect(page.getByLabel('Row showing Categories as')).toBeVisible();
    await expect(
      page.getByLabel('Row showing Color as algoControl')
    ).toBeVisible();
    await expect(page.getByLabel('Label for Color')).toBeVisible();

    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByTitle('Toggle').nth(0).locator('span').click();
    await page.getByRole('link', { name: 'Edit' }).nth(0).click();

    await expect(page.getByLabel('Row showing Categories as')).toBeVisible();
    await expect(
      page.getByLabel('Row showing Color as algoControl')
    ).toBeVisible();
    await expect(page.getByLabel('Label for Color')).toBeVisible();

    await page.getByLabel('Edit display name for Color').click();
    await page.getByLabel('Edit Color input field').press('ArrowLeft');
    await page.getByLabel('Edit Color input field').fill('Colour');
    await page.getByLabel('Save Color change').click();

    await page.getByRole('button', { name: 'Cancel' }).click();
    await page.getByRole('button', { name: 'Close without saving' }).click();

    await page.getByRole('button', { name: 'More options' }).nth(0).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(
      page.getByText('Do you want to delete this rule')
    ).toBeVisible();
    await page.getByLabel('Delete rule').click();

    await expect(
      page.getByText('Do you want to delete this rule')
    ).not.toBeVisible();
  });

  test('edit existing global facet ruleset', async ({ page }) => {
    await setupElastic();

    await page.goto('/global/facets');
    await expect(
      page.getByRole('heading', { name: 'Global Facet Management' })
    ).toBeVisible();

    await page.getByRole('link', { name: 'Add new rule' }).click();

    await expect(
      page.getByText('Applies to all pages in marksandspencer.com')
    ).toBeVisible();
    await page.getByRole('button', { name: 'Save' }).click();

    await page.getByRole('link', { name: 'Edit' }).nth(0).click();
    await expect(page.getByLabel('Row showing Categories as')).toBeVisible();

    await page.getByPlaceholder('Search...').fill('Colour');
    await expect(
      page.getByLabel('Row showing Categories as')
    ).not.toBeVisible();
    await expect(
      page.getByLabel('Row showing Colour as algoControl')
    ).toBeVisible();

    await page.getByPlaceholder('Search...').fill('Notafacet');
    await expect(
      page.getByLabel('Row showing Categories as')
    ).not.toBeVisible();
    await expect(
      page.getByLabel('Row showing Colour as algoControl')
    ).not.toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Remove selected category' })
    ).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Preview' })
    ).not.toBeVisible();

    await page.getByPlaceholder('Search...').fill('');
    await expect(
      page.getByLabel('Row showing Colour as algoControl')
    ).toBeVisible();

    await expect(
      page.getByTestId('button to open facet order dropdown').nth(0)
    ).toContainText('Algo control');

    await page
      .getByTestId('button to open facet order dropdown')
      .nth(0)
      .click();
    await page.getByRole('button', { name: 'include' }).nth(0).click();
    await expect(
      page.getByTestId('button to open facet order dropdown').nth(0)
    ).toContainText('Include only');

    await expect(
      page.getByTestId('button to open facet order dropdown').nth(1)
    ).toContainText('Algo control');

    await page
      .getByTestId('button to open facet order dropdown')
      .nth(1)
      .click();
    await page.getByRole('button', { name: 'exclude' }).nth(0).click();
    await expect(
      page.getByTestId('button to open facet order dropdown').nth(1)
    ).toContainText('Exclude only');

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(
      page.getByRole('link', { name: 'Add new rule' })
    ).toBeVisible();
    await page.getByTitle('Toggle').nth(0).locator('span').click();
    await page.getByRole('link', { name: 'Edit' }).nth(0).click();
    await expect(
      page.getByTestId('button to open facet order dropdown').nth(0)
    ).toContainText('Include only');

    await expect(
      page.getByTestId('button to open facet order dropdown').nth(1)
    ).toContainText('Exclude only');
  });
});
