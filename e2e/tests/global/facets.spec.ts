import { expect, test } from '@playwright/test';

import { checkAccessibility } from '../accessibility-utils';
import {
  mockAttributeValues,
  mockEditedFacet,
  mockGlobalFacet,
  mockGlobalRuleset,
  mockGlobalRulesets,
} from './global.mocks';

test.describe('global facets', () => {
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
    await page.route(
      '*/**/api/search/beta/merchandising/facet/f0bc2d42-563e-11ef-a364-000000000000/attributeValues*',

      async (route) => {
        const json = mockAttributeValues;
        await route.fulfill({ status: 200, json });
      }
    );
    await page.goto('/global');
  });

  test('edits a facet name', async ({ page }) => {
    await page.goto('/global');
    await expect(page.getByRole('heading', { name: 'Global' })).toBeVisible();

    await checkAccessibility(page);
    await expect(
      page.getByRole('link', { name: 'Add facet rule' })
    ).toBeVisible();
    await page.getByRole('link', { name: 'Add facet rule' }).click();

    await expect(
      page.getByRole('heading', { name: 'Facet Rule Editor' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Create', exact: true }).click();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit facet rule' }).click();

    await expect(
      page.getByText(
        'You are currently editing all pages on the M&S website and app'
      )
    ).toBeVisible();

    await checkAccessibility(page);

    await page
      .getByTestId('Row showing Age as algoControl')
      .getByTestId('button to open facet order dropdown')
      .click();

    await checkAccessibility(page);

    await page
      .getByTestId('Row showing Age as algoControl')
      .getByRole('menuitemradio', { name: 'Include only', exact: true })
      .click();
    await page.getByLabel('Edit display name for Age').click();
    await page.getByLabel('Edit Age input field').press('ArrowLeft');
    await page.getByLabel('Edit Age input field').fill('Hue');
    await page.getByLabel('Save Age change').click();

    await expect(page.getByTestId('Label for Hue')).toBeVisible();
  });

  test('includes and excludes facets', async ({ page }) => {
    await page.goto('/global/facets/edit/b118cd93-1767-447b-ace5-74084bcf56eb');
    await expect(
      page.getByTestId('Row showing Age as algoControl')
    ).toBeVisible();
    await expect(
      page.getByTestId('Row showing Alcohol Type as algoControl')
    ).toBeVisible();

    await checkAccessibility(page);

    await page
      .getByTestId('Row showing Age as algoControl')
      .getByTestId('button to open facet order dropdown')
      .click();
    await page
      .getByTestId('Row showing Age as algoControl')
      .getByRole('menuitemradio', { name: 'Include only', exact: true })
      .click();

    await page
      .getByTestId('Row showing Alcohol Type as algoControl')
      .getByTestId('button to open facet order dropdown')
      .click();
    await page
      .getByTestId('Row showing Alcohol Type as algoControl')
      .getByRole('menuitemradio', { name: 'Exclude only', exact: true })
      .click();

    await expect(page.getByTestId('Row showing Age as included')).toBeVisible();
    await expect(
      page.getByTestId('Row showing Alcohol Type as excluded')
    ).toBeVisible();
  });

  test('edits facet values by repositioning, including and excluding', async ({
    page,
  }) => {
    await page.goto('/global/facets/edit/b118cd93-1767-447b-ace5-74084bcf56eb');
    await page.getByRole('button', { name: 'Edit values' }).nth(1).click();

    await expect(
      page.getByRole('heading', { name: 'Facet value settings of: Age' })
    ).toBeVisible();

    await expect(
      page.getByTestId('included attribute 1 3+ years')
    ).toBeVisible();

    await page.getByLabel('Move 3+ years row down').click();

    await expect(
      page.getByTestId('included attribute 2 3+ years')
    ).toBeVisible();

    await page
      .getByTestId(
        'button to open facet order dropdown for Not suitable under 36 mth'
      )
      .click();
    await page.getByRole('menuitemradio', { name: 'Include only' }).click();

    await expect(
      page.getByTestId('included attribute 3 Not suitable under 36 mth')
    ).toBeVisible();

    await page
      .getByTestId('button to open facet order dropdown for 3-5 years')
      .click();
    await page.getByRole('menuitemradio', { name: 'Exclude only' }).click();

    await expect(
      page.getByTestId('excluded attribute 1 3-5 years')
    ).toBeVisible();
  });

  test('merges facet values', async ({ page }) => {
    await page.goto('/global/facets/edit/b118cd93-1767-447b-ace5-74084bcf56eb');
    await page.getByRole('button', { name: 'Edit values' }).nth(1).click();

    await expect(
      page.getByRole('heading', { name: 'Facet value settings of: Age' })
    ).toBeVisible();

    await checkAccessibility(page);

    await page.getByLabel('Select 0-2 Years to merge').click();
    await page.getByLabel('Select 3-5 Years to merge').click();

    await expect(page.getByRole('button', { name: 'Merge (2)' })).toBeVisible();

    await page.getByRole('button', { name: 'Merge (2)' }).click();

    await page.getByLabel('Edit 0-2 Years input field').click();
    await page
      .getByLabel('Edit 0-2 Years input field')
      .fill('A merged group name');

    await page.getByLabel('Save 0-2 Years change').click();

    await expect(
      page.getByLabel('Edit display name for A merged group name')
    ).toBeVisible();

    await page.getByLabel('Select Not suitable under 36 mth to merge').click();
    await page.getByLabel('Select A merged group name to merge').click();

    await expect(page.getByRole('button', { name: 'Merge (3)' })).toBeVisible();

    await page.getByRole('button', { name: 'Merge (3)' }).click();

    await page.getByLabel('Edit 0-2 years').click();
    await page
      .getByLabel('Edit 0-2 years')
      .fill('A merge into a merged group name');

    await page.getByLabel('Save 0-2 years change').click();

    await expect(
      page.getByLabel('Edit display name for A merge into a merged group name')
    ).toBeVisible();

    await expect(
      page.getByLabel('Edit display name for Name your mergey')
    ).toBeVisible();

    await page.getByLabel('Remove merged facet for 6+ years').click();

    await expect(
      page.getByLabel('Edit display name for 6+ years')
    ).toBeVisible();
  });
});
