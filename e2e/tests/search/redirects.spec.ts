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
        const json = mockRedirect;
        await route.fulfill({ status: 200, json });
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
      page.getByText('Do you want to delete this rule')
    ).not.toBeVisible();
  });
});
