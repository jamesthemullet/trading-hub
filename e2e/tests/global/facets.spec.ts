/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable testing-library/prefer-screen-queries */
import { expect, test } from '@playwright/test';

import {
  mockEditedFacet,
  mockGlobalFacet,
  mockGlobalRuleset,
  mockGlobalRulesets,
} from './global.mocks';

test.describe('global facets', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.route(
      '*/**/api/search/beta/merchandising/global/ruleset*',
      async (route) => {
        if (route.request().method() === 'GET') {
          const json = mockGlobalRulesets;
          await route.fulfill({ status: 200, json });
        }
        if (route.request().method() === 'POST') {
          const json = mockGlobalRuleset;
          await route.fulfill({ status: 200, json });
        }
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/global/ruleset/847f1f8b-dc75-4e97-9364-cecc9b66651c',
      async (route) => {
        const json = mockGlobalRuleset;
        await route.fulfill({ status: 200, json });
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/global/ruleset/b118cd93-1767-447b-ace5-74084bcf56eb',
      async (route) => {
        const json = mockGlobalRuleset;
        await route.fulfill({ status: 200, json });
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/facet*',
      async (route) => {
        const json = mockGlobalFacet;
        await route.fulfill({ status: 200, json });
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/facet/f0bc2d42-563e-11ef-a364-000000000000',
      async (route) => {
        const json = mockEditedFacet;
        await route.fulfill({ status: 200, json });
      }
    );
    await page.goto('/global/facets');
    await page.waitForLoadState('networkidle');
  });

  test('creates and deletes new global facet ruleset', async ({ page }) => {
    await page.goto('/global/facets');
    await expect(
      page.getByRole('heading', { name: 'Global Facet Management' })
    ).toBeVisible();

    await page.getByRole('link', { name: 'Add new rule' }).click();

    await expect(
      page.getByText('Applies to all pages in marksandspencer.com')
    ).toBeVisible();

    await page
      .getByLabel('Row showing Age as')
      .getByTestId('button to open facet order dropdown')
      .click();
    await page.getByRole('button', { name: 'include' }).click();
    await page.getByLabel('Edit display name for Age').click();
    await page.getByLabel('Edit Age input field').press('ArrowLeft');
    await page.getByLabel('Edit Age input field').fill('Hue');
    await page.getByLabel('Save Age change').click();

    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByTitle('Toggle').nth(0).locator('span').click();
    await page.getByRole('link', { name: 'Edit' }).nth(0).click();

    await expect(page.getByLabel('Row showing Age as')).toBeVisible();
    await expect(
      page.getByLabel('Row showing Age as algoControl')
    ).toBeVisible();
    await expect(page.getByLabel('Label for Age')).toBeVisible();

    await page.getByLabel('Edit display name for Age').click();
    await page.getByLabel('Edit Age input field').press('ArrowLeft');
    await page.getByLabel('Edit Age input field').fill('Colour');
    await page.getByLabel('Save Age change').click();

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
});
