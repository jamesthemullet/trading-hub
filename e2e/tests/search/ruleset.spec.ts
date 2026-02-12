import { expect, test } from '@playwright/test';

import { checkAccessibility } from '../accessibility-utils';
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

    await page.goto('/search');
  });

  test('creates a new ruleset', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Search' })).toBeVisible();

    await checkAccessibility(page);

    await page.getByRole('link', { name: 'Add ranking rule' }).click();

    await checkAccessibility(page);

    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Edit', exact: true }).click();

    await checkAccessibility(page);

    await page.getByLabel('Add keyword to list').fill('joggers');
    await page.getByLabel('Add keyword to list').press('Enter');

    await page.getByRole('button', { name: 'Close' }).click();

    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByRole('heading', { name: 'Search' })).toBeVisible();
  });

  test('enables a ruleset', async ({ page }) => {
    await expect(page.getByText('black hiking boots').first()).toBeVisible();

    await page.getByTitle('Toggle').first().locator('span').click();

    await expect(
      page.getByTitle('Toggle').first().locator('input')
    ).toBeChecked();
  });

  test('previews a ruleset', async ({ page }) => {
    await expect(page.getByText('black hiking boots').first()).toBeVisible();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit ranking rule' }).click();

    await page.getByRole('button', { name: 'Preview' }).click();

    await checkAccessibility(page);

    await expect(
      page.getByText('View rule changes made on the website below')
    ).toBeVisible();

    await expect(page.getByRole('button', { name: 'Price' })).toBeVisible();

    await expect(
      page.getByText('Performance Cuffed Joggers').first()
    ).toBeVisible();
  });

  test('changes the preview when the country changes', async ({ page }) => {
    await expect(page.getByText('black hiking boots').first()).toBeVisible();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit ranking rule' }).click();

    await page
      .getByRole('button', { name: 'Select country view for visual editor' })
      .click();

    await page.getByText('IE view').click();

    await page.getByRole('button', { name: 'Preview' }).click();

    await expect(
      page.getByText('View rule changes made on the website below')
    ).toBeVisible();

    await expect(page.getByRole('button', { name: 'Price' })).toBeVisible();

    await expect(
      page.getByText('Cotton Rich Straight Leg Joggers').first()
    ).toBeVisible();
  });

  test('deletes a ruleset', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Search' })).toBeVisible();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByTestId('Delete rule').click();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: 'Do you want to delete this rule?',
      })
    ).toBeHidden();
  });

  test('pin/block/bury/boost from visual editor', async ({ page }) => {
    await page.goto(
      '/search/rulesets/edit/2b948868-cbe2-4d21-8b8a-0fd713516add'
    );

    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();

    await expect(page.getByRole('button', { name: 'Changes2' })).toBeVisible();

    await page
      .getByTestId('Position 1')
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Boost to Top' }).click();

    await page
      .getByTestId('Position 2')
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Bury to Bottom' }).click();

    await page
      .getByTestId('Position 3')
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Pin in position' }).click();

    await page.getByPlaceholder('i.e. 3').fill('1');
    await page
      .getByTestId('Position 3')
      .getByRole('button', { name: 'Confirm' })
      .click();

    await page
      .getByTestId('Position 4')
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Block Product' }).click();

    await expect(page.getByRole('button', { name: 'Changes6' })).toBeVisible();
  });

  test('pin/block/bury/boost from search', async ({ page }) => {
    await page.goto(
      '/search/rulesets/edit/2b948868-cbe2-4d21-8b8a-0fd713516add'
    );

    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();

    await expect(page.getByRole('button', { name: 'Changes2' })).toBeVisible();

    await page.getByPlaceholder('Search for product').fill('dress');
    await expect(
      page
        .getByTestId('Position 2')
        .first()
        .getByRole('button', { name: 'Open menu' })
    ).toBeVisible();

    await page
      .getByTestId('Position 2')
      .first()
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Boost to Top' }).click();
    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();

    await page
      .getByTestId('Position 3')
      .first()
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Bury to Bottom' }).click();

    await page
      .getByTestId('Position 4')
      .first()
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Pin in position' }).click();

    await page.getByPlaceholder('i.e. 3').fill('1');
    await page
      .getByTestId('Position 4')
      .first()
      .getByRole('button', { name: 'Confirm' })
      .click();

    await page
      .getByTestId('Position 5')
      .first()
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Block Product' }).click();

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

    await page.getByRole('button', { name: 'Numeric Attributes' }).click();

    await page.getByRole('button', { name: 'Select to boost or bury' }).click();

    await page
      .getByRole('menuitemradio', { name: 'Bury', exact: true })
      .click();

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

    await page
      .getByRole('button', { name: 'Product description attributes' })
      .click();

    await page
      .getByRole('button', {
        name: 'Select to include, exclude, boost or bury',
      })
      .click();

    await page
      .getByRole('menuitemradio', { name: 'Bury', exact: true })
      .click();

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

    await page
      .getByRole('button', { name: 'Product description attributes' })
      .click();

    await page
      .getByRole('button', {
        name: 'Select to include, exclude, boost or bury',
      })
      .click();

    await page.getByRole('menuitemradio', { name: 'Include only' }).click();

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

    await page
      .getByRole('button', { name: 'Product description attributes' })
      .click();

    await page
      .getByRole('button', {
        name: 'Select to include, exclude, boost or bury',
      })
      .click();

    await page.getByRole('menuitemradio', { name: 'Exclude only' }).click();

    await page.getByRole('button', { name: 'fit' }).first().click();

    await page.getByLabel('Regular fit').first().click();

    await page.getByRole('button', { name: 'Done' }).click();

    await expect(page.getByRole('button', { name: 'Changes3' })).toBeVisible();
  });

  test.describe('Scheduling', () => {
    test('Should schedule a ruleset', async ({ page }) => {
      await page.goto('/search');
      await expect(page.getByRole('heading', { name: 'Search' })).toBeVisible();

      await page.getByRole('link', { name: 'Add ranking rule' }).click();

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
      await page.locator('button:has-text("16")').nth(1).click();
      await page.locator('button:has-text("22")').nth(1).click();
      await page.getByText('00:00').click();
      await page.fill('input[type="time"]', '10:30');

      await expect(page.getByText('00:00')).toBeHidden();

      await expect(page.getByText('10:30')).toBeVisible();

      await expect(
        page.getByRole('button', { name: 'Close schedule editor' })
      ).toBeEnabled();

      await page.getByRole('button', { name: 'Close schedule editor' }).click();

      await expect(
        page.getByRole('heading', { name: 'Product Grid' })
      ).toBeVisible();
    });

    test('should edit a scheduled ruleset', async ({ page }) => {
      await page.goto('/search');
      await expect(page.getByRole('heading', { name: 'Search' })).toBeVisible();

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

      const timeInputs = page.locator('input[type="time"]');
      await timeInputs.nth(0).fill('10:30');
      await timeInputs.nth(1).fill('11:45');

      await expect(page.getByText('15:17')).toBeHidden();
      await expect(page.getByText('04:20')).toBeHidden();

      await expect(page.getByText('10:30')).toBeVisible();
      await expect(page.getByText('11:45')).toBeVisible();

      await expect(
        page.getByRole('button', { name: 'Close schedule editor' })
      ).toBeEnabled();

      await page.getByRole('button', { name: 'Close schedule editor' }).click();

      await expect(
        page.getByRole('heading', { name: 'Product Grid' })
      ).toBeVisible();
    });

    test('should delete a scheduled ruleset', async ({ page }) => {
      await page.goto('/search');
      await expect(page.getByRole('heading', { name: 'Search' })).toBeVisible();

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

      await expect(
        page.getByRole('heading', { name: 'Product Grid' })
      ).toBeVisible();
    });
  });
});
