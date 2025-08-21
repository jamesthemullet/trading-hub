import type { MerchandisingReturnedCategoryRuleSets } from '@/libs/api';

import { expect, test } from '@playwright/test';

import {
  mockCategoryAlphanumericAttributes,
  mockCategoryList,
  mockCategoryNumericAttributes,
  mockCategoryRuleset,
  mockCategoryRulesets,
  mockIECategoryList,
  mockPreview,
  mockProducts,
} from './category.mocks';

test.describe('Categories', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(
      '*/**/api/search/beta/merchandising/category/ruleset?q=&start=0&rows=10',
      async (route) => {
        const json = mockCategoryRulesets;
        await route.fulfill({ status: 200, json });
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/category*',
      async (route, request) => {
        const json = request.url().includes('MANDSIE')
          ? mockIECategoryList
          : mockCategoryList;
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
        const json = mockCategoryRuleset;
        await route.fulfill({ status: 200, json });
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/category/ruleset/5e1002e8-bb08-4215-b26f-b5f6814b010b',
      async (route) => {
        const json = {
          ...mockCategoryRuleset,
          rules: {
            ...mockCategoryRuleset.rules,
            boosts: { numeric: [], alphanumeric: [], product: [] },
            pinnedProducts: [...Array(100).keys()].map((val) => ({
              id: `${val + 1000}`,
            })),
          },
        };
        await route.fulfill({ status: 200, json });
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/category/ruleset',
      async (route) => {
        await route.fulfill({ status: 200 });
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/attributes?categoryId=SubCategory_2933925&type=numeric&catalogue=MANDSUK',
      async (route) => {
        const json = mockCategoryNumericAttributes;
        await route.fulfill({ status: 200, json });
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/attributes?categoryId=SubCategory_2933925&type=alphanumeric&catalogue=MANDSUK',
      async (route) => {
        const json = mockCategoryAlphanumericAttributes;
        await route.fulfill({ status: 200, json });
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/attributes?categoryId=IE_SubCategory_19025005&type=numeric&catalogue=MANDSIE',
      async (route) => {
        const json = mockCategoryNumericAttributes;
        await route.fulfill({ status: 200, json });
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/attributes?categoryId=IE_SubCategory_19025005&type=alphanumeric&catalogue=MANDSIE',
      async (route) => {
        const json = mockCategoryAlphanumericAttributes;
        await route.fulfill({ status: 200, json });
      }
    );
  });

  test('creates a new ruleset', async ({ page }) => {
    await page.goto('/category');
    await expect(
      page.getByRole('heading', { name: 'Categories' })
    ).toBeVisible();

    await page.waitForLoadState('networkidle');

    await page.getByRole('link', { name: 'Add ranking rule' }).click();

    await page.waitForLoadState();
    await expect(
      page.getByText('No, there are no product rankings yet')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.getByPlaceholder('Search...').click();
    await page.getByPlaceholder('Search...').fill('Dresses');
    await page
      .getByText('SubCategory_429 | Dresses | l/women/dresses', { exact: true })
      .click();

    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Close' }).click();

    await expect(page.getByLabel('Position 1', { exact: true })).toBeVisible();

    await page
      .getByLabel('Position 1', { exact: true })
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Boost to Top' }).click();

    await page
      .getByLabel('Position 2', { exact: true })
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
  });

  test('creates a new ruleset for ROI', async ({ page }) => {
    await page.goto('/category');
    await expect(
      page.getByRole('heading', { name: 'Categories' })
    ).toBeVisible();

    await page.waitForLoadState('networkidle');

    await page.getByRole('link', { name: 'Add ranking rule' }).click();

    await page.waitForLoadState();
    await expect(
      page.getByText('No, there are no product rankings yet')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Select country' }).click();

    await page
      .getByRole('button', {
        name: 'IE market only',
      })
      .click();

    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.getByPlaceholder('Search...').click();
    await page.getByPlaceholder('Search...').fill('Dresses');
    await page
      .getByText('IE_SubCategory_1002041 | Dresses | ie/l/women/dresses')
      .click();

    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Close' }).click();

    await expect(page.getByLabel('Position 1', { exact: true })).toBeVisible();

    await page
      .getByLabel('Position 1', { exact: true })
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Boost to Top' }).click();

    await page
      .getByLabel('Position 2', { exact: true })
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
  });

  test('should add multiple categories to a ruleset', async ({ page }) => {
    await page.goto('/category');
    await expect(
      page.getByRole('heading', { name: 'Categories' })
    ).toBeVisible();

    await page.waitForLoadState('networkidle');

    await page.getByRole('link', { name: 'Add ranking rule' }).click();

    await page.waitForLoadState();
    await expect(
      page.getByText('No, there are no product rankings yet')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.getByPlaceholder('Search...').click();
    await page.getByPlaceholder('Search...').fill('Dresses');
    await page.getByText('SubCategory_429 | Dresses | l/women/dresses').click();

    await page
      .getByRole('button', {
        name: 'Remove category from modal: SubCategory_429',
      })
      .click();

    await page.getByPlaceholder('Search...').fill('Dresses');
    await page
      .getByText('IE_SubCategory_7585102 | Dresses | ie/l/baby/dresses')
      .click();

    await page.getByPlaceholder('Search...').click();
    await page.getByPlaceholder('Search...').fill('Dresses');
    await page
      .getByText('IE_SubCategory_1002041 | Dresses | ie/l/women/dresses')
      .click();

    await page.getByPlaceholder('Search...').click();

    await page.getByRole('button', { name: 'Close' }).click();
  });

  test('deletes a ruleset', async ({ page }) => {
    await page.goto('/category');
    await expect(
      page.getByRole('heading', { name: 'Categories' })
    ).toBeVisible();

    await expect(page.getByText('SubCategory_429 -').first()).toBeVisible();

    await expect(page.getByText('7 results')).toBeVisible();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();

    await page.route(
      '*/**/api/search/beta/merchandising/category/ruleset?q=&start=0&rows=10',
      async (route) => {
        const json: MerchandisingReturnedCategoryRuleSets = {
          pagination: { totalItems: 6 },
          ruleSets: mockCategoryRulesets.ruleSets.filter(
            (ruleset) => ruleset.id !== '22ce8ae9-a7b3-4a52-bea4-e31ebf1f5f10'
          ),
        };
        await route.fulfill({ status: 200, json });
      }
    );
    await page.getByTestId('Delete rule').click();

    await expect(page.getByText('6 results')).toBeVisible();
  });

  test('pin/block/bury/boost from visual editor', async ({ page }) => {
    await page.goto(
      '/category/rulesets/edit/5e1002e8-bb08-4215-b26f-b5f6814b010a'
    );

    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Changes8' })).toBeVisible();

    await page
      .getByLabel('Position 1', { exact: true })
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Boost to Top' }).click();

    await page
      .getByLabel('Position 2', { exact: true })
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Bury to Bottom' }).click();

    await page
      .getByLabel('Position 3', { exact: true })
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Pin in position' }).click();

    await page.getByPlaceholder('i.e. 3').fill('1');
    await page
      .getByLabel('Position 3', { exact: true })
      .getByRole('button', { name: 'Confirm' })
      .click();

    await page
      .getByLabel('Position 4', { exact: true })
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Block Product' }).click();

    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: 'Changes12' })).toBeVisible();
  });

  test('disallow pinning more than 100 products', async ({ page }) => {
    await page.goto(
      '/category/rulesets/edit/5e1002e8-bb08-4215-b26f-b5f6814b010b'
    );

    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Changes100' })
    ).toBeVisible();

    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder('Search for product').fill('dress');
    await page.waitForLoadState('networkidle');

    await page
      .getByLabel('Position 1', { exact: true })
      .first()
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Pin in position' }).click();
    await page.getByPlaceholder('i.e. 3').fill('1');
    await page.getByRole('button', { name: 'Confirm' }).click();

    const saveButton = page.getByRole('button', { name: 'Save' });

    await expect(
      page.getByText('Error: Please only pin 100 or fewer products')
    ).toBeVisible();

    expect(saveButton.isDisabled()).toBeTruthy();
  });

  test('pin/block/bury/boost from search', async ({ page }) => {
    await page.goto(
      '/category/rulesets/edit/5e1002e8-bb08-4215-b26f-b5f6814b010a'
    );

    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Changes8' })).toBeVisible();

    await page.getByPlaceholder('Search for product').fill('dress');
    await page.waitForTimeout(400);
    await page.waitForLoadState('networkidle');

    await page
      .getByLabel('Position 2')
      .first()
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Boost to Top' }).click();
    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();

    await page
      .getByLabel('Position 3')
      .first()
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Bury to Bottom' }).click();

    await page
      .getByLabel('Position 4')
      .first()
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Pin in position' }).click();

    await page.getByPlaceholder('i.e. 3').fill('1');
    await page
      .getByLabel('Position 4')
      .first()
      .getByRole('button', { name: 'Confirm' })
      .click();

    await page
      .getByLabel('Position 5')
      .first()
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Block Product' }).click();

    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: 'Changes12' })).toBeVisible();
  });

  test('boost numeric attribute', async ({ page }) => {
    await page.goto(
      '/category/rulesets/edit/5e1002e8-bb08-4215-b26f-b5f6814b010a'
    );

    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Changes8' })).toBeVisible();

    await page.getByRole('button', { name: 'Attribute' }).click();

    await page
      .getByRole('button', { name: 'Create new attribute rule' })
      .click();

    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Numeric Attributes' }).click();

    await page.getByRole('radio', { name: 'newInFreshNess' }).click();

    await page.getByRole('button', { name: 'Done' }).click();

    await expect(page.getByRole('button', { name: 'Changes9' })).toBeVisible();
  });

  test('bury numeric attribute', async ({ page }) => {
    await page.goto(
      '/category/rulesets/edit/5e1002e8-bb08-4215-b26f-b5f6814b010a'
    );

    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Changes8' })).toBeVisible();

    await page.getByRole('button', { name: 'Attribute' }).click();

    await page
      .getByRole('button', { name: 'Create new attribute rule' })
      .click();

    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Numeric Attributes' }).click();

    await page
      .getByRole('button', { name: 'Select to boost or bury' })
      .first()
      .click();

    await page.getByRole('button', { name: 'Select to boost or bury' }).click();

    await page
      .getByLabel('predictions.salesIn1Day.normalisedValue')
      .first()
      .click();

    await page.getByRole('button', { name: 'Done' }).click();

    await expect(page.getByRole('button', { name: 'Changes9' })).toBeVisible();
  });

  test('boost alphanumeric attribute', async ({ page }) => {
    await page.goto(
      '/category/rulesets/edit/5e1002e8-bb08-4215-b26f-b5f6814b010a'
    );

    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Changes8' })).toBeVisible();

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

    await expect(page.getByRole('button', { name: 'Changes9' })).toBeVisible();
  });

  test('bury alphanumeric attribute', async ({ page }) => {
    await page.goto(
      '/category/rulesets/edit/5e1002e8-bb08-4215-b26f-b5f6814b010a'
    );

    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Changes8' })).toBeVisible();

    await page.getByRole('button', { name: 'Attribute' }).click();

    await page
      .getByRole('button', { name: 'Create new attribute rule' })
      .click();

    await page.waitForLoadState('networkidle');

    await page
      .getByRole('button', { name: 'Product description attributes' })
      .click();

    await page
      .getByRole('button', {
        name: 'Select to include, exclude, boost or bury',
      })
      .click();

    await page.getByRole('button', { name: 'Bury', exact: true }).click();

    await page.getByRole('button', { name: 'fit' }).first().click();

    await page.getByLabel('Regular fit').first().click();

    await page.getByRole('button', { name: 'Done' }).click();

    await expect(page.getByRole('button', { name: 'Changes9' })).toBeVisible();
  });

  test('include alphanumeric attribute', async ({ page }) => {
    await page.goto(
      '/category/rulesets/edit/5e1002e8-bb08-4215-b26f-b5f6814b010a'
    );

    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Changes8' })).toBeVisible();

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

    await expect(page.getByRole('button', { name: 'Changes9' })).toBeVisible();
  });

  test('exclude alphanumeric attribute', async ({ page }) => {
    await page.goto(
      '/category/rulesets/edit/5e1002e8-bb08-4215-b26f-b5f6814b010a'
    );

    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Changes8' })).toBeVisible();

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

    await expect(page.getByRole('button', { name: 'Changes9' })).toBeVisible();
  });

  test.describe('Scheduling', () => {
    test('Should schedule a ruleset', async ({ page }) => {
      await page.goto('/category');
      await expect(
        page.getByRole('heading', { name: 'Categories' })
      ).toBeVisible();

      await page.waitForLoadState('networkidle');

      await page.getByRole('link', { name: 'Add ranking rule' }).click();

      await page.waitForLoadState();
      await expect(
        page.getByText('No, there are no product rankings yet')
      ).toBeVisible();

      await page.getByRole('button', { name: 'Edit', exact: true }).click();
      await page.getByPlaceholder('Search...').click();
      await page.getByPlaceholder('Search...').fill('Dresses');
      await page
        .getByText('SubCategory_429 | Dresses | l/women/dresses', {
          exact: true,
        })
        .click();

      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: 'Close' }).click();

      await expect(
        page.getByLabel('Position 1', { exact: true })
      ).toBeVisible();

      await expect(page.getByText('Duration')).toBeVisible();

      await page.getByPlaceholder('Select date range').click();

      await expect(page.getByText('Rule date and time duration')).toBeVisible();

      await page.getByTitle('Toggle').click();
      await expect(
        page.getByRole('button', { name: 'Close schedule editor' })
      ).toBeDisabled();

      await page.locator('button:has-text("16")').nth(1).click();
      await page.locator('button:has-text("16")').nth(1).click();
      await page.locator('button:has-text("22")').nth(1).click();
      await page.getByText('00:00').click();
      await page.fill('input[type="time"]', '10:30');

      await expect(page.getByText('00:00')).not.toBeVisible();

      await expect(page.getByText('10:30')).toBeVisible();

      await expect(
        page.getByRole('button', { name: 'Close schedule editor' })
      ).toBeEnabled();

      await page.getByRole('button', { name: 'Close schedule editor' }).click();

      await page.waitForLoadState('networkidle');

      await expect(
        page.getByRole('heading', { name: 'Product Grid' })
      ).toBeVisible();
    });

    test('should edit a scheduled ruleset', async ({ page }) => {
      await page.goto('/category');
      await expect(
        page.getByRole('heading', { name: 'Categories' })
      ).toBeVisible();

      await page.waitForLoadState('networkidle');

      await page.getByRole('button', { name: 'More options' }).first().click();
      await page.getByRole('link', { name: 'Edit ranking rule' }).click();

      await expect(page.getByText('Duration')).toBeVisible();

      await page.getByPlaceholder('Select date range').click();

      await expect(page.getByText('Rule date and time duration')).toBeVisible();
      await expect(
        page.getByText('Sep 12 2024 15:17 - Dec 19 2024 04:20')
      ).toBeVisible();

      await page.locator('button:has-text("16")').nth(1).click();
      await page.locator('button:has-text("22")').nth(1).click();

      const timeInputs = await page.$$('input[type="time"]');
      await timeInputs[0].fill('10:30');
      await timeInputs[1].fill('11:45');

      await expect(page.getByText('15:17')).not.toBeVisible();
      await expect(page.getByText('04:20')).not.toBeVisible();

      await expect(page.getByText('10:30')).toBeVisible();
      await expect(page.getByText('11:45')).toBeVisible();

      await expect(
        page.getByRole('button', { name: 'Close schedule editor' })
      ).toBeEnabled();

      await page.getByRole('button', { name: 'Close schedule editor' }).click();

      await page.waitForLoadState('networkidle');

      await expect(
        page.getByRole('heading', { name: 'Product Grid' })
      ).toBeVisible();
    });

    test('should delete a scheduled ruleset', async ({ page }) => {
      await page.goto('/category');
      await expect(
        page.getByRole('heading', { name: 'Categories' })
      ).toBeVisible();

      await page.waitForLoadState('networkidle');

      await page.getByRole('button', { name: 'More options' }).first().click();
      await page.getByRole('link', { name: 'Edit ranking rule' }).click();

      await expect(page.getByText('Duration')).toBeVisible();

      await page.getByPlaceholder('Select date range').click();

      await expect(page.getByText('Rule date and time duration')).toBeVisible();
      await expect(
        page.getByText('Sep 12 2024 15:17 - Dec 19 2024 04:20')
      ).toBeVisible();

      await page.getByTitle('Toggle').click();

      await page.getByRole('button', { name: 'Close schedule editor' }).click();

      await page.waitForLoadState('networkidle');

      await expect(
        page.getByRole('heading', { name: 'Product Grid' })
      ).toBeVisible();
    });
  });
});
