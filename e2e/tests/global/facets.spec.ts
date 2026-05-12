import { expect, test } from '@playwright/test';

import { checkAccessibility } from '../accessibility-utils';
import {
  mockAttributeValues,
  mockEditedFacet,
  mockGlobalFacet,
  mockGlobalRuleset,
  mockGlobalRulesets,
  mockMaterialTypeAttributeValues,
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
    await page.getByRole('link', { name: 'Edit values' }).nth(1).click();

    await expect(
      page.getByRole('heading', { name: 'Value settings of: Age' })
    ).toBeVisible();

    await checkAccessibility(page);

    await expect(
      page.getByTestId('included attribute 1 3+ years')
    ).toBeVisible();

    await page.getByRole('spinbutton', { name: 'Order for 3+ years' }).click();
    await page
      .getByRole('spinbutton', { name: 'Order for 3+ years' })
      .fill('3');
    await page
      .getByRole('spinbutton', { name: 'Order for 3+ years' })
      .press('Enter');

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
    await page.getByRole('link', { name: 'Edit values' }).nth(1).click();

    await expect(
      page.getByRole('heading', { name: 'Value settings of: Age' })
    ).toBeVisible();

    await checkAccessibility(page);

    await page.getByLabel('Select 0-2 Years to merge').click();
    await page.getByLabel('Select 3-5 Years to merge').click();

    await expect(page.getByText('2 selected')).toBeVisible();

    await page.getByRole('button', { name: 'Merge', exact: true }).click();

    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Save' })
      .click();

    await expect(
      page
        .getByTestId('algoControl attribute 0 0-2 Years')
        .getByText('Merged Value Group')
    ).toBeVisible();

    await expect(
      page.getByLabel('Edit display name for 0-2 Years')
    ).toBeVisible();

    await page.getByLabel('Select Not suitable under 36 mth to merge').click();
    await page.getByLabel('Select 0-2 Years to merge').click();

    await expect(page.getByText('2 selected')).toBeVisible();

    await page.getByRole('button', { name: 'Merge', exact: true }).click();

    await page
      .getByRole('dialog')
      .getByRole('textbox')
      .fill('A merge into a merged group name');

    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Save' })
      .click();

    await expect(
      page.getByLabel('Edit display name for A merge into a merged group name')
    ).toBeVisible();

    await page.getByLabel('Remove merged facet for 3-5 years').click();

    await expect(
      page.getByLabel('Edit display name for 3-5 years')
    ).toBeVisible();
  });
});

const MATERIAL_TYPE_FACET_ID = 'a1b2c3d4-1234-5678-0000-000000000002';
const RULESET_ID = 'b118cd93-1767-447b-ace5-74084bcf56eb';
const materialTypeValuesEditorUrl = `/global/facets/values/edit/${MATERIAL_TYPE_FACET_ID}?ruleSetId=${RULESET_ID}&displayName=Material+Type&countryCode=UK_IE`;

test.describe('global Material Type facet value merging', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(
      '*/**/api/search/beta/merchandising/facet*',
      async (route) => {
        const json = mockGlobalFacet;
        await route.fulfill({ status: 200, json });
      }
    );
    await page.route(
      `*/**/api/search/beta/merchandising/facet/${MATERIAL_TYPE_FACET_ID}/attributeValues*`,
      async (route) => {
        const json = mockMaterialTypeAttributeValues;
        await route.fulfill({ status: 200, json });
      }
    );
  });

  test('merges Material Type facet values and reverses the merge', async ({
    page,
  }) => {
    await page.goto(materialTypeValuesEditorUrl);
    await expect(
      page.getByRole('heading', { name: 'Value settings of: Material Type' })
    ).toBeVisible();

    await checkAccessibility(page);

    await page.getByLabel('Select Animal to merge').click();
    await page.getByLabel('Select Animal print to merge').click();

    await expect(page.getByText('2 selected')).toBeVisible();

    await page.getByRole('button', { name: 'Merge', exact: true }).click();

    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Save' })
      .click();

    await expect(
      page
        .getByTestId('algoControl attribute 3 Animal')
        .getByText('Merged Value Group')
    ).toBeVisible();

    await checkAccessibility(page);

    // Add Geometric to the existing Animal merged group
    await page.getByLabel('Select Animal to merge').click();
    await page.getByLabel('Select Geometric to merge').click();

    await expect(page.getByText('2 selected')).toBeVisible();

    await page.getByRole('button', { name: 'Merge', exact: true }).click();

    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Save' })
      .click();

    await expect(
      page.getByLabel('Remove merged facet for Geometric')
    ).toBeVisible();

    await checkAccessibility(page);

    // Reverse: remove Animal print, then Geometric to fully dissolve the group
    await page.getByLabel('Remove merged facet for Animal print').click();

    await expect(
      page.getByLabel('Edit display name for Animal print')
    ).toBeVisible();

    await page.getByLabel('Remove merged facet for Geometric').click();

    await expect(
      page.getByLabel('Edit display name for Geometric')
    ).toBeVisible();
  });

  test('merges Material Type values with a custom display name and reverses', async ({
    page,
  }) => {
    await page.goto(materialTypeValuesEditorUrl);
    await expect(
      page.getByRole('heading', { name: 'Value settings of: Material Type' })
    ).toBeVisible();

    await page.getByLabel('Select Leopard print to merge').click();
    await page.getByLabel('Select Camouflage to merge').click();

    await expect(page.getByText('2 selected')).toBeVisible();

    await page.getByRole('button', { name: 'Merge', exact: true }).click();

    await page.getByRole('dialog').getByRole('textbox').fill('Wildlife Prints');

    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Save' })
      .click();

    await expect(
      page.getByLabel('Edit display name for Wildlife Prints')
    ).toBeVisible();

    await checkAccessibility(page);

    await page.getByLabel('Remove merged facet for Camouflage').click();

    await expect(
      page.getByLabel('Edit display name for Camouflage')
    ).toBeVisible();
  });
});
