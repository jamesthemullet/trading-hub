/* eslint-disable testing-library/prefer-screen-queries */
import { expect, test } from '@playwright/test';

import { mockRedirect, mockRedirectsList } from './redirects.mocks';

test.describe('Keyword Redirects', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(
      '*/**/api/search/beta/merchandising/keyword/redirect*',
      async (route) => {
        const json = mockRedirectsList;
        await route.fulfill({ status: 200, json });
      }
    );
    await page.route(
      '*/**/api/search/beta/merchandising/keyword/redirect/2cf46391-1780-4016-9d20-5fd28b571579*',
      async (route) => {
        if (route.request().method() === 'PUT') {
          return route.fulfill({
            status: 200,
            json: { ...mockRedirect, isEnabled: false },
          });
        }
        await route.fulfill({ status: 200, json: mockRedirect });
      }
    );

    await page.goto('/search/redirects');
    await page.waitForLoadState('networkidle');
  });

  test('Should create new redirect', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Keyword Redirect' })
    ).toBeVisible();

    await page.getByRole('link', { name: 'Add new rule' }).click();

    await expect(
      page.getByRole('heading', { name: 'Add Keyword Redirect rule' })
    ).toBeVisible();

    await page.getByLabel('Add keyword').click();

    await expect(
      page.getByRole('radio', { name: 'Redirect Term(s)' })
    ).toBeChecked();
    await expect(
      page.getByRole('radio', { name: 'Redirect Phrase(s)' })
    ).not.toBeChecked();

    await page.getByLabel('Add keyword').fill('word 1');
    await page.getByLabel('Add keyword').press('Enter');
    await page.getByLabel('Add keyword').fill('word 2');
    await page.getByLabel('Add keyword').press('Enter');

    await page.getByPlaceholder('c/').click();
    await page.getByPlaceholder('c/').fill('/test/keyword');

    await page.getByPlaceholder('Enter redirect title').click();
    await page.getByPlaceholder('Enter redirect title').fill('Test Redirect');

    await page.getByRole('button', { name: 'Create' }).click();

    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: 'Keyword Redirect' })
    ).toBeVisible();
  });

  test('Should edit a redirect', async ({ page }) => {
    await page.getByRole('link', { name: 'Edit' }).click();
    await expect(
      page.getByRole('radio', { name: 'Redirect Term(s)' })
    ).toBeChecked();
    await expect(
      page.getByRole('radio', { name: 'Redirect Phrase(s)' })
    ).not.toBeChecked();

    await expect(page.getByLabel('number of keywords')).toContainText('2');
    await expect(page.getByText('word 1', { exact: true })).toBeVisible();
    await expect(page.getByText('word 2', { exact: true })).toBeVisible();

    await expect(page.getByPlaceholder('c/')).toHaveValue('/test/keyword');

    await page.getByRole('radio', { name: 'Redirect Phrase(s)' }).check();
    await expect(
      page.getByRole('radio', { name: 'Redirect Term(s)' })
    ).not.toBeChecked();
    await expect(
      page.getByRole('radio', { name: 'Redirect Phrase(s)' })
    ).toBeChecked();

    await page.getByRole('button', { name: 'Save' }).click();

    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: 'Keyword Redirect' })
    ).toBeVisible();
  });

  test('disables a redirect', async ({ page }) => {
    await page.getByTitle('Toggle').first().locator('span').click();

    await page.waitForLoadState('networkidle');

    await expect(
      page.getByTitle('Toggle').first().locator('input')
    ).not.toBeChecked();
  });

  test('deletes a redirect', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Keyword Redirect' })
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

  test.describe('Scheduling', () => {
    test('Should schedule a redirect', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Keyword Redirect' })
      ).toBeVisible();

      await page.getByRole('link', { name: 'Add new rule' }).click();

      await expect(
        page.getByRole('heading', { name: 'Add Keyword Redirect rule' })
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
        page.getByRole('heading', { name: 'Keyword Redirect' })
      ).toBeVisible();
    });

    test('should edit a scheduled redirect', async ({ page }) => {
      await page.getByRole('link', { name: 'Edit' }).click();

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
        page.getByRole('heading', { name: 'Keyword Redirect' })
      ).toBeVisible();
    });

    test('should delete a scheduled redirect', async ({ page }) => {
      await page.getByRole('link', { name: 'Edit' }).click();

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
        page.getByRole('heading', { name: 'Keyword Redirect' })
      ).toBeVisible();
    });
  });
});
