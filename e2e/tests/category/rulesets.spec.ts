/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable testing-library/prefer-screen-queries */
import { ReturnedCategoryRuleSets } from '@/libs/api';

import { expect, test } from '@playwright/test';

import {
  mockCategoryList,
  mockCategoryRulesets,
  mockPreview,
  mockProducts,
} from './category.mocks';

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
    '*/**/api/search/beta/merchandising/category/ruleset/5e1002e8-bb08-4215-b26f-b5f6814b010a',
    async (route) => {
      await route.fulfill({ status: 200 });
    }
  );
});

test('creates and deletes new ruleset', async ({ page }) => {
  await page.goto('/category/rulesets');
  await expect(
    page.getByRole('heading', { name: 'Category ranking rules' })
  ).toBeVisible();

  await page.waitForLoadState('networkidle');

  await page.getByRole('link', { name: 'Add new rule' }).click();

  await page.waitForLoadState();
  await expect(page.getByLabel('Visual Editor')).toBeVisible();

  await page.getByPlaceholder('Search...').click();
  await page.getByPlaceholder('Search...').fill('Dresses');
  await page.getByText('SubCategory_429 | Dresses | l/women/dresses').click();

  await page.waitForLoadState('networkidle');

  await expect(page.getByLabel('Position 1', { exact: true })).toBeVisible();

  await page
    .getByLabel('Position 1', { exact: true })
    .getByRole('button', { name: 'Open menu' })
    .click();
  await page.getByRole('button', { name: 'Boost to Top' }).click();

  await page
    .getByLabel('Position 2')
    .getByRole('button', { name: 'Open menu' })
    .click();
  await page.getByRole('button', { name: 'Bury to Bottom' }).click();

  await page.getByRole('button', { name: 'Changes2' }).click();
  await expect(
    page.getByRole('heading', { name: 'Boosted Products (1)' })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Buried Products (1)' })
  ).toBeVisible();

  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('SubCategory_429 |').first()).toBeVisible();

  await page.getByRole('button', { name: 'More options' }).first().click();
  await page.getByRole('button', { name: 'Delete' }).click();

  await page.route(
    '*/**/api/search/beta/merchandising/category/ruleset*',
    async (route) => {
      const json: ReturnedCategoryRuleSets = {
        pagination: { totalItems: 6 },
        ruleSets: mockCategoryRulesets.ruleSets.filter(
          (ruleset) => ruleset.id !== '22ce8ae9-a7b3-4a52-bea4-e31ebf1f5f10'
        ),
      };
      await route.fulfill({ status: 200, json });
    }
  );
  await page.getByLabel('Delete rule').click();

  await expect(page.getByText('6 results')).toBeVisible();
});
