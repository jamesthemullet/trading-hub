import { test, expect } from '@playwright/test';
import { setupElastic } from '../../elastic/elastic';

test('creates and deletes new global facet ruleset', async ({ page }) => {
  await setupElastic();

  await page.goto('/global/facets');
  await expect(
    page.getByRole('heading', { name: 'Global Facet Management' })
  ).toBeVisible();

  await page.getByRole('button', { name: 'Add rule' }).click();

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
  await expect(page.getByLabel('Row showing Color as excluded')).toBeVisible();
  await expect(page.getByLabel('Label for Color')).toBeVisible();

  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByTitle('Toggle').locator('span').click();
  await page.getByRole('link', { name: 'Edit' }).click();

  await expect(page.getByLabel('Row showing Categories as')).toBeVisible();
  await expect(page.getByLabel('Row showing Color as excluded')).toBeVisible();
  await expect(page.getByLabel('Label for Color')).toBeVisible();

  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('button', { name: 'Close without saving' }).click();

  await page.getByRole('button', { name: 'More options' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.getByLabel('Delete rule').click();

  await expect(page.getByText('0 results')).toBeVisible();
});
