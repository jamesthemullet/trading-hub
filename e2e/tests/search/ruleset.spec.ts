/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable testing-library/prefer-screen-queries */
import { expect, test } from '@playwright/test';

import {
  mockCategoryAlphanumericAttributes,
  mockCategoryNumericAttributes,
  mockPreview,
  mockPreviewIE,
  mockProducts,
  mockRuleSet,
  mockRulesetsList,
} from './search.mocks';

test.describe('Keyword search', () => {
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
      async (route, request) => {
        const json = request.url().includes('MANDSIE')
          ? mockPreviewIE
          : mockPreview;
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
      '*/**/api/search/beta/merchandising/product*',
      async (route) => {
        const json = mockProducts;
        await route.fulfill({ status: 200, json });
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/attributes?searchTerm=joggers&type=numeric&catalogue=MANDSUK',
      async (route) => {
        const json = mockCategoryNumericAttributes;
        await route.fulfill({ status: 200, json });
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/attributes?searchTerm=joggers&type=alphanumeric&catalogue=MANDSUK',
      async (route) => {
        const json = mockCategoryAlphanumericAttributes;
        await route.fulfill({ status: 200, json });
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/attributes?searchTerm=joggers&type=numeric&catalogue=MANDSIE',
      async (route) => {
        const json = mockCategoryNumericAttributes;
        await route.fulfill({ status: 200, json });
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/attributes?searchTerm=joggers&type=alphanumeric&catalogue=MANDSIE',
      async (route) => {
        const json = mockCategoryAlphanumericAttributes;
        await route.fulfill({ status: 200, json });
      }
    );

    await page.goto('/search/rulesets');
    await page.waitForLoadState('networkidle');
  });

  test('creates a new ruleset', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Search ranking rules' })
    ).toBeVisible();

    await page.getByRole('link', { name: 'Add new rule' }).click();

    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();

    await page.getByLabel('Add keyword').fill('joggers');
    await page.getByLabel('Add keyword').press('Enter');

    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Create' }).click();

    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: 'Search ranking rules' })
    ).toBeVisible();
  });

  test('enables a ruleset', async ({ page }) => {
    await expect(page.getByTitle('black hiking boots').first()).toBeVisible();

    await page.getByTitle('Toggle').first().locator('span').click();

    await page.waitForLoadState('networkidle');

    await expect(
      page.getByTitle('Toggle').first().locator('input')
    ).toBeChecked();
  });

  test('previews a ruleset', async ({ page }) => {
    await expect(page.getByTitle('black hiking boots').first()).toBeVisible();

    await page.getByRole('link', { name: 'Edit' }).first().click();

    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Preview' }).click();

    await page.waitForLoadState('networkidle');

    await expect(
      page.getByText('Search across the site to preview the rule influence')
    ).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Price' })).toBeVisible();

    await expect(
      page.getByText('GOODMOVE Performance Cuffed Joggers').nth(1)
    ).toBeVisible();
  });

  test('changes the preview when the country changes', async ({ page }) => {
    await expect(page.getByTitle('black hiking boots').first()).toBeVisible();

    await page.getByRole('link', { name: 'Edit' }).first().click();

    await page.waitForLoadState('networkidle');

    await page
      .getByRole('button', { name: 'Select country view for visual editor' })
      .click();

    await page.getByText('IE view').click();

    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Preview' }).click();

    await page.waitForLoadState('networkidle');

    await expect(
      page.getByText('Search across the site to preview the rule influence')
    ).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Price' })).toBeVisible();

    await expect(
      page.getByText('M&S Collection Cotton Rich Straight Leg Joggers').nth(1)
    ).toBeVisible();
  });

  test('deletes a ruleset', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Search ranking rules' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByLabel('Delete rule').click();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: 'Do you want to delete this rule?',
      })
    ).not.toBeVisible();
  });

  test('pin/block/bury/boost from visual editor', async ({ page }) => {
    await page.goto(
      '/search/rulesets/edit/2b948868-cbe2-4d21-8b8a-0fd713516add'
    );

    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();

    await expect(page.getByRole('button', { name: 'Changes2' })).toBeVisible();

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

    await page
      .getByLabel('Position 3')
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Pin in position' }).click();

    await page.getByPlaceholder('i.e. 3').fill('1');
    await page
      .getByLabel('Position 3')
      .getByRole('button', { name: 'Confirm' })
      .click();

    await page
      .getByLabel('Position 4')
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Block Product' }).click();

    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: 'Changes6' })).toBeVisible();
  });

  test('pin/block/bury/boost from search', async ({ page }) => {
    await page.goto(
      '/search/rulesets/edit/2b948868-cbe2-4d21-8b8a-0fd713516add'
    );

    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();

    await expect(page.getByRole('button', { name: 'Changes2' })).toBeVisible();

    await page.getByPlaceholder('Search for product').fill('dress');
    await page.waitForTimeout(400);
    await page.waitForLoadState('networkidle');

    await page
      .getByLabel('Position 2', { exact: true })
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

    await expect(page.getByRole('button', { name: 'Changes6' })).toBeVisible();
  });

  test('boost numeric attribute', async ({ page }) => {
    await page.goto(
      '/search/rulesets/edit/2b948868-cbe2-4d21-8b8a-0fd713516add'
    );

    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();

    await expect(page.getByRole('button', { name: 'Changes2' })).toBeVisible();

    await page.getByRole('button', { name: 'Attribute' }).click();

    await page
      .getByRole('button', { name: 'Create new attribute rule' })
      .click();

    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Numeric Attributes' }).click();

    await page.getByLabel('newInFreshNess').first().click();

    await page.getByRole('button', { name: 'Done' }).click();

    await expect(page.getByRole('button', { name: 'Changes3' })).toBeVisible();
  });

  test('bury numeric attribute', async ({ page }) => {
    await page.goto(
      '/search/rulesets/edit/2b948868-cbe2-4d21-8b8a-0fd713516add'
    );

    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();

    await expect(page.getByRole('button', { name: 'Changes2' })).toBeVisible();

    await page.getByRole('button', { name: 'Attribute' }).click();

    await page
      .getByRole('button', { name: 'Create new attribute rule' })
      .click();

    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Numeric Attributes' }).click();

    await page.getByRole('button', { name: 'Boost' }).first().click();

    await page.getByRole('button', { name: 'Bury' }).click();

    await page
      .getByLabel('predictions.salesIn1Day.normalisedValue')
      .first()
      .click();

    await page.getByRole('button', { name: 'Done' }).click();

    await expect(page.getByRole('button', { name: 'Changes3' })).toBeVisible();
  });

  test('boost alphanumeric attribute', async ({ page }) => {
    await page.goto(
      '/search/rulesets/edit/2b948868-cbe2-4d21-8b8a-0fd713516add'
    );

    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();

    await expect(page.getByRole('button', { name: 'Changes2' })).toBeVisible();

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

    await expect(page.getByRole('button', { name: 'Changes3' })).toBeVisible();
  });

  test('bury alphanumeric attribute', async ({ page }) => {
    await page.goto(
      '/search/rulesets/edit/2b948868-cbe2-4d21-8b8a-0fd713516add'
    );

    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();

    await expect(page.getByRole('button', { name: 'Changes2' })).toBeVisible();

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

    await expect(page.getByRole('button', { name: 'Changes3' })).toBeVisible();
  });

  test('include alphanumeric attribute', async ({ page }) => {
    await page.goto(
      '/search/rulesets/edit/2b948868-cbe2-4d21-8b8a-0fd713516add'
    );

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

    await expect(page.getByRole('button', { name: 'Changes3' })).toBeVisible();
  });

  test('exclude alphanumeric attribute', async ({ page }) => {
    await page.goto(
      '/search/rulesets/edit/2b948868-cbe2-4d21-8b8a-0fd713516add'
    );

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

    await expect(page.getByRole('button', { name: 'Changes3' })).toBeVisible();
  });

  test.describe('Scheduling', () => {
    test('Should schedule a ruleset', async ({ page }) => {
      await page.goto('/search/rulesets');
      await expect(
        page.getByRole('heading', { name: 'Search ranking rules' })
      ).toBeVisible();

      await page.waitForLoadState('networkidle');

      await page.getByRole('link', { name: 'Add new rule' }).click();

      await page.waitForLoadState();
      await expect(
        page.getByText('No, there are no product rankings yet.')
      ).toBeVisible();

      await expect(page.getByText('Duration')).toBeVisible();

      await page.getByPlaceholder('Select date range').click();

      await expect(page.getByText('Rule date and time duration')).toBeVisible();

      await page.getByTitle('Toggle').click();
      await expect(
        page.getByRole('button', { name: 'Close schedule editor' })
      ).toBeDisabled();

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
      await page.goto('/search/rulesets');
      await expect(
        page.getByRole('heading', { name: 'Search ranking rules' })
      ).toBeVisible();

      await page.waitForLoadState('networkidle');

      await page.getByRole('link', { name: 'Edit' }).nth(0).click();

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
      await page.goto('/search/rulesets');
      await expect(
        page.getByRole('heading', { name: 'Search ranking rules' })
      ).toBeVisible();

      await page.waitForLoadState('networkidle');

      await page.getByRole('link', { name: 'Edit' }).nth(0).click();

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
