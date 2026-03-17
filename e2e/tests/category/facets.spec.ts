import { expect, test } from '@playwright/test';

import { checkAccessibility } from '../accessibility-utils';
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
    await page.goto('/category');
    await expect(
      page.getByRole('heading', { name: 'Categories' })
    ).toBeVisible();

    await checkAccessibility(page);

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit facet rule' }).click();

    await expect(
      page.getByRole('heading', { name: 'Facet Rule Editor' })
    ).toBeVisible();

    await checkAccessibility(page);

    await expect(page.getByText('Colours')).toBeVisible();

    await page
      .getByTestId('Row showing Collections as algoControl')
      .getByRole('button', {
        name: 'Select to set as included, excluded or algo control',
      })
      .first()
      .click();
    await page
      .getByRole('menuitemradio', { name: 'Include only', exact: true })
      .click();

    await expect(
      page.getByTestId('Row showing Collections as included')
    ).toBeVisible();

    await checkAccessibility(page);

    await page.keyboard.down('End');

    await page
      .getByTestId('Row showing Colours as included')
      .getByRole('button', {
        name: 'Select to set as included, excluded or algo control',
      })
      .first()
      .click();
    await page
      .getByRole('menuitemradio', { name: 'Exclude only', exact: true })
      .click();

    await expect(
      page.getByTestId('Row showing Colours as excluded')
    ).toBeVisible();

    await expect(page.getByTestId(/Row showing/).first()).toContainText(
      'Categories'
    );

    const dragHandle = page.getByLabel('Reorder Categories');
    const targetRow = page.getByTestId('Row showing Collections as included');

    await expect(dragHandle).toBeVisible();

    const sourceBox = await dragHandle.boundingBox();
    const targetBox = await targetRow.boundingBox();

    if (sourceBox && targetBox) {
      await page.mouse.move(
        sourceBox.x + sourceBox.width / 2,
        sourceBox.y + sourceBox.height / 2
      );
      await page.mouse.down();
      await page.mouse.move(
        targetBox.x + targetBox.width / 2,
        targetBox.y + targetBox.height / 2,
        { steps: 10 }
      );
      await page.mouse.up();
    }

    await expect(page.getByTestId(/Row showing/).first()).toContainText(
      'Collections'
    );
  });

  test('edits facet values', async ({ page }) => {
    page.goto('/category/facets/edit/5e1002e8-bb08-4215-b26f-b5f6814b010a');

    await expect(
      page.getByRole('heading', { name: 'Facet Rule Editor' })
    ).toBeVisible();

    await page.getByRole('link', { name: 'Edit values' }).first().click();

    await expect(
      page.getByRole('heading', { name: 'Value settings of: Colours' })
    ).toBeVisible();

    await page
      .getByTestId('button to open facet order dropdown for SMOKE')
      .click();
    await page.getByRole('menuitemradio', { name: 'Include only' }).click();

    await expect(page.getByTestId('included attribute 1 SMOKE')).toBeVisible();

    await page.getByRole('spinbutton', { name: 'Order for SMOKE' }).click();
    await page.getByRole('spinbutton', { name: 'Order for SMOKE' }).fill('1');
    await page
      .getByRole('spinbutton', { name: 'Order for SMOKE' })
      .press('Enter');

    await expect(page.getByTestId('included attribute 0 SMOKE')).toBeVisible();
  });
});
