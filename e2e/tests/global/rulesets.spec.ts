/* eslint-disable testing-library/prefer-screen-queries */
import { expect, test } from '@playwright/test';

import {
  mockCategoryAlphanumericAttributes,
  mockCategoryNumericAttributes,
  mockEditedFacet,
  mockGlobalFacet,
  mockGlobalRuleset,
  mockGlobalRulesets,
  mockProducts,
} from './global.mocks';

test.describe('global rulesets', () => {
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
      '*/**/api/search/beta/merchandising/product*',
      async (route) => {
        const json = mockProducts;
        await route.fulfill({ status: 200, json });
      }
    );
    // swagger ampersand issue https://github.com/acacode/swagger-typescript-api/issues/621
    await page.route(
      '*/**/api/search/beta/merchandising/attributes?&type=numeric&catalogue=MANDSUK',
      async (route) => {
        const json = mockCategoryNumericAttributes;
        await route.fulfill({ status: 200, json });
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/attributes?&type=alphanumeric&catalogue=MANDSUK',
      async (route) => {
        const json = mockCategoryAlphanumericAttributes;
        await route.fulfill({ status: 200, json });
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/attributes?&type=numeric&catalogue=MANDSIE',
      async (route) => {
        const json = mockCategoryNumericAttributes;
        await route.fulfill({ status: 200, json });
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/attributes?&type=alphanumeric&catalogue=MANDSIE',
      async (route) => {
        const json = mockCategoryAlphanumericAttributes;
        await route.fulfill({ status: 200, json });
      }
    );

    await page.goto('/global/rulesets');
    await page.waitForLoadState('networkidle');
  });

  test('lists global rulesets', async ({ page }) => {
    await page.goto('/global/rulesets');
    await expect(page.getByRole('heading', { name: 'Global' })).toBeVisible();
    await expect(page.getByText('Graham Licence')).toBeVisible();
  });

  test('edits a global ruleset to bury, boost and block', async ({ page }) => {
    await page.goto('/global/rulesets');
    await expect(page.getByRole('heading', { name: 'Global' })).toBeVisible();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit ranking rule' }).click();
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();

    await page.getByPlaceholder('Search for product').fill('dress');
    await page.waitForTimeout(400);
    await page.waitForLoadState('networkidle');

    await page
      .getByLabel('Position 2')
      .first()
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Boost to Top' }).click();

    await page
      .getByLabel('Position 3')
      .first()
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Bury to Bottom' }).click();

    await page
      .getByLabel('Position 5')
      .first()
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Block Product' }).click();

    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: 'Changes3' })).toBeVisible();
  });

  test('edits a global ruleset to include attributes', async ({ page }) => {
    await page.goto('/global/rulesets');
    await expect(page.getByRole('heading', { name: 'Global' })).toBeVisible();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit ranking rule' }).click();
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Attribute' }).click();

    await page
      .getByRole('button', { name: 'Create new attribute rule' })
      .click();

    await page.waitForLoadState('networkidle');

    await page
      .getByRole('button', { name: 'Product description attributes' })
      .click();

    await page.getByRole('button', { name: 'Boost' }).nth(1).click();

    await page.getByRole('button', { name: 'Include only' }).click();

    await page.getByRole('button', { name: 'fit' }).first().click();

    await page.getByLabel('Regular fit').first().click();

    await page.getByRole('button', { name: 'Done' }).click();

    await expect(page.getByRole('button', { name: 'Changes1' })).toBeVisible();
  });

  test('edits a global ruleset to exclude attributes', async ({ page }) => {
    await page.goto('/global/rulesets');
    await expect(page.getByRole('heading', { name: 'Global' })).toBeVisible();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit ranking rule' }).click();
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Attribute' }).click();

    await page
      .getByRole('button', { name: 'Create new attribute rule' })
      .click();

    await page.waitForLoadState('networkidle');

    await page
      .getByRole('button', { name: 'Product description attributes' })
      .click();

    await page.getByRole('button', { name: 'Boost' }).nth(1).click();

    await page.getByRole('button', { name: 'Exclude only' }).click();

    await page.getByRole('button', { name: 'fit' }).first().click();

    await page.getByLabel('Regular fit').first().click();

    await page.getByRole('button', { name: 'Done' }).click();

    await expect(page.getByRole('button', { name: 'Changes1' })).toBeVisible();
  });

  test('edits a global ruleset to bury attributes', async ({ page }) => {
    await page.goto('/global/rulesets');
    await expect(page.getByRole('heading', { name: 'Global' })).toBeVisible();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit ranking rule' }).click();
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Attribute' }).click();

    await page
      .getByRole('button', { name: 'Create new attribute rule' })
      .click();

    await page.waitForLoadState('networkidle');

    await page
      .getByRole('button', { name: 'Product description attributes' })
      .click();

    await page.getByRole('button', { name: 'Boost' }).nth(1).click();

    await page.getByRole('button', { name: 'Bury' }).click();

    await page.getByRole('button', { name: 'fit' }).first().click();

    await page.getByLabel('Regular fit').first().click();

    await page.getByRole('button', { name: 'Done' }).click();

    await expect(page.getByRole('button', { name: 'Changes1' })).toBeVisible();
  });

  test('edits a global ruleset to boost attributes', async ({ page }) => {
    await page.goto('/global/rulesets');
    await expect(page.getByRole('heading', { name: 'Global' })).toBeVisible();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit ranking rule' }).click();
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Attribute' }).click();

    await page
      .getByRole('button', { name: 'Create new attribute rule' })
      .click();

    await page.waitForLoadState('networkidle');

    await page
      .getByRole('button', { name: 'Product description attributes' })
      .click();

    await page.getByRole('button', { name: 'fit' }).first().click();

    await page.getByLabel('Regular fit').first().click();

    await page.getByRole('button', { name: 'Done' }).click();

    await expect(page.getByRole('button', { name: 'Changes1' })).toBeVisible();
  });
});
