/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable testing-library/prefer-screen-queries */
import { expect, test } from '@playwright/test';

import { mockPreview, mockRuleSet, mockRulesetsList } from './search.mocks';

test.describe.configure({ mode: 'serial' });

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
      async (route) => {
        const json = mockPreview;
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

  test('deletes a ruleset', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Search ranking rules' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByLabel('Delete rule').click();

    await expect(
      page.getByText('Do you want to delete this rule')
    ).not.toBeVisible();
  });
});
