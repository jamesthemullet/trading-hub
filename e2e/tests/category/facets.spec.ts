/* eslint-disable testing-library/prefer-screen-queries */

import { expect, test } from '@playwright/test';

import {
  mockAttributeValue,
  mockCategoryList,
  mockCategoryRuleset,
  mockCategoryRulesets,
  mockFacets,
  mockPreview,
  mockProducts,
} from './category.mocks';

test.describe('Category rulesets', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(
      '*/**/api/search/beta/merchandising/category/ruleset*',
      async (route) => {
        const json = mockCategoryRulesets;
        await route.fulfill({ status: 200, json });
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/category*',
      async (route) => {
        const json = mockCategoryList;
        await route.fulfill({ status: 200, json });
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/preview*',
      async (route) => {
        const json = { ...mockPreview, ruleSet: route.request().postData() };
        await route.fulfill({ status: 200, json });
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/product*',
      async (route) => {
        const json = mockProducts;
        await route.fulfill({ status: 200, json });
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/facet*',
      async (route) => {
        const json = mockFacets;
        await route.fulfill({ status: 200, json });
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/category/ruleset/5e1002e8-bb08-4215-b26f-b5f6814b010a',
      async (route) => {
        const json = mockCategoryRuleset;
        await route.fulfill({ status: 200, json });
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/facet/4f8d4803-3eb0-11ef-9a6a-000000000000/attributeValues*',
      async (route) => {
        const json = mockAttributeValue;
        await route.fulfill({ status: 200, json });
      }
    );
  });

  test('edits ruleset facets for UK', async ({ page }) => {
    await page.goto('/category/facets');
    await expect(
      page.getByRole('heading', { name: 'Category Facet Management' })
    ).toBeVisible();

    await page.waitForLoadState('networkidle');

    await page.getByRole('link', { name: 'Edit' }).first().click();

    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Facet Rule Editor' })
    ).toBeVisible();

    await expect(page.getByText('Colours')).toBeVisible();

    await page.getByRole('button', { name: 'Algo control' }).first().click();
    await page.getByRole('button', { name: 'include', exact: true }).click();

    await expect(
      page.getByTestId('Row showing Collections as included')
    ).toBeVisible();

    await page.keyboard.down('End');

    await page.getByRole('button', { name: 'Algo control' }).first().click();
    await page.getByRole('button', { name: 'exclude', exact: true }).click();

    await expect(
      page.getByTestId('Row showing Colour as excluded')
    ).toBeVisible();

    await expect(page.getByTestId(/Row showing/).first()).toContainText(
      'Colours'
    );

    await page.getByRole('button', { name: 'Move Colours row down' }).click();

    await expect(page.getByTestId(/Row showing/).first()).toContainText(
      'Categories'
    );

    await page.getByRole('button', { name: 'Move Collections row up' }).click();
    await page.getByRole('button', { name: 'Move Collections row up' }).click();

    await expect(page.getByTestId(/Row showing/).first()).toContainText(
      'Collections'
    );
  });

  test('edits ruleset facets for IE', async ({ page }) => {
    await page.goto('/category/facets');
    await expect(
      page.getByRole('heading', { name: 'Category Facet Management' })
    ).toBeVisible();

    await page.waitForLoadState('networkidle');

    await page.getByRole('link', { name: 'Edit' }).first().click();

    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Facet Rule Editor' })
    ).toBeVisible();

    await expect(page.getByText('Colours')).toBeVisible();

    await page.getByRole('button', { name: 'select market' }).click();

    await page.getByRole('button', { name: 'select IE market only' }).click();

    await expect(
      page.getByRole('heading', { name: 'Facet Rule Editor' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Algo control' }).first().click();
    await page.getByRole('button', { name: 'include', exact: true }).click();

    await expect(
      page.getByTestId('Row showing Collections as included')
    ).toBeVisible();

    await page.keyboard.down('End');

    await page.getByRole('button', { name: 'Algo control' }).first().click();
    await page.getByRole('button', { name: 'exclude', exact: true }).click();

    await expect(
      page.getByTestId('Row showing Colour as excluded')
    ).toBeVisible();

    await expect(page.getByTestId(/Row showing/).first()).toContainText(
      'Colours'
    );

    await page.getByRole('button', { name: 'Move Colours row down' }).click();

    await expect(page.getByTestId(/Row showing/).first()).toContainText(
      'Categories'
    );

    await page.getByRole('button', { name: 'Move Collections row up' }).click();
    await page.getByRole('button', { name: 'Move Collections row up' }).click();

    await expect(page.getByTestId(/Row showing/).first()).toContainText(
      'Collections'
    );
  });

  test('edits facet values', async ({ page }) => {
    page.goto('/category/facets/edit/5e1002e8-bb08-4215-b26f-b5f6814b010a');

    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Facet Rule Editor' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Edit values' }).first().click();
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByTestId('algoControl attribute 0 SMOKE')
    ).toBeVisible();

    await page
      .getByTestId('button to open facet order dropdown for SMOKE')
      .click();
    await page.getByLabel('include SMOKE').click();
    await page.getByLabel('Move SMOKE row up').click();

    await page
      .getByTestId('button to open facet order dropdown for SMOKE')
      .click();
    await page.getByLabel('exclude SMOKE').click();

    await expect(page.getByLabel('Move SMOKE row up')).not.toBeVisible();
  });
});
