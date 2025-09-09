import { expect, test } from '@playwright/test';

import { mockAttributeValue, mockFacets } from '../category/category.mocks';
import {
  mockPreview,
  mockProducts,
  mockRuleSet,
  mockRulesetsList,
} from './search.mocks';

test.describe('Search rulesets', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(
      '*/**/api/search/beta/merchandising/keyword/ruleset*',
      async (route) => {
        const json = mockRulesetsList;
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
      '*/**/api/search/beta/merchandising/keyword/ruleset/2b948868-cbe2-4d21-8b8a-0fd713516add*',
      async (route) => {
        const json = mockRuleSet;
        await route.fulfill({ status: 200, json });
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/keyword/ruleset/abcdcae5-c3c4-455b-aeff-b7d2af65b702*',
      async (route) => {
        const json = mockRuleSet;
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
    await page.goto('/search');
    await expect(page.getByRole('heading', { name: 'Search' })).toBeVisible();

    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit facet rule' }).click();

    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Facet Rule Editor' })
    ).toBeVisible();

    await expect(page.getByText('Colours')).toBeVisible();

    await page
      .getByTestId('Row showing Collections as algoControl')
      .getByRole('button', {
        name: 'Select to set as included, excluded or algo control',
      })
      .click();
    await page
      .getByRole('option', { name: 'Include only', exact: true })
      .click();

    await expect(
      page.getByTestId('Row showing Collections as included')
    ).toBeVisible();

    await page.keyboard.down('End');

    await page.getByRole('button', { name: 'Algo control' }).first().click();
    await page
      .getByRole('option', { name: 'Exclude only', exact: true })
      .click();

    await expect(
      page.getByTestId('Row showing Colours as excluded')
    ).toBeVisible();

    await expect(page.getByTestId(/Row showing/).first()).toContainText(
      'Categories'
    );

    await page
      .getByRole('button', { name: 'Move Categories row down' })
      .click();

    await expect(page.getByTestId(/Row showing/).first()).toContainText(
      'Collections'
    );
  });

  test('edits facet values', async ({ page }) => {
    page.goto('/search/facets/edit/abcdcae5-c3c4-455b-aeff-b7d2af65b702');

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
    await page.getByRole('option', { name: 'Include only' }).click();
    await page.getByLabel('Move SMOKE row up').click();

    await page
      .getByTestId('button to open facet order dropdown for SMOKE')
      .click();
    await page.getByRole('option', { name: 'Exclude only' }).click();

    await expect(page.getByLabel('Move SMOKE row up')).not.toBeVisible();
  });
});
