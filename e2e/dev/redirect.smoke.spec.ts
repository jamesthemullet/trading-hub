import { expect, test } from '@playwright/test';

import { searchAndWaitForResults } from '../helpers';

test.describe.configure({ mode: 'serial' });

test.describe('Search Redirect', () => {
  test.beforeAll(async ({ request }) => {
    const res = await request.get(
      `/api/search/beta/merchandising/keyword/redirect?q=Gravy&start=0&rows=100`
    );
    if (!res.ok()) throw new Error(`Cleanup GET failed: ${res.status()}`);
    const { redirects = [] } = await res.json();
    const deletes = await Promise.all(
      redirects.map(({ id }: { id: string }) =>
        request.delete(`/api/search/beta/merchandising/keyword/redirect/${id}`)
      )
    );
    for (const del of deletes) {
      if (!del.ok()) throw new Error(`Cleanup DELETE failed: ${del.status()}`);
    }
  });

  test('creates new redirect', async ({ page }) => {
    await page.goto('/search/redirects');
    await expect(
      page.getByRole('heading', { name: 'Keyword Redirect' })
    ).toBeVisible();

    await expect(
      page.getByRole('link', { name: 'Add redirect rule' })
    ).toBeVisible();
    await expect(page.getByText('0 results', { exact: true })).toBeHidden();

    await page.getByRole('link', { name: 'Add redirect rule' }).click();

    await expect(
      page.getByRole('heading', { name: 'Add KeyWord Redirect rule' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Edit', exact: true }).click();

    await page.getByLabel('Add keyword to list').click();
    await page.getByLabel('Add keyword to list').fill('Gravy');
    await page.getByLabel('Add keyword to list').press('Enter');
    await page.getByLabel('Add keyword to list').fill('Beef Gravy');
    await page.getByLabel('Add keyword to list').press('Enter');
    await page.getByLabel('Add keyword to list').fill('Turkey Gravy');
    await page.getByLabel('Add keyword to list').press('Enter');

    await page.getByRole('button', { name: 'Close' }).click();

    await page.getByPlaceholder('c/').fill('/christmas/gravy');

    await page.getByRole('button', { name: 'Create' }).click();
    await expect(
      page.getByRole('heading', { name: 'Keyword Redirect' })
    ).toBeVisible();

    await page.getByPlaceholder('Search...').click();
    await page.getByPlaceholder('Search...').fill('Gravy');
    await expect(page.getByText('Gravy').first()).toBeVisible();
  });

  test('edits a redirect', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2024-11-05T10:00:00'));
    await page.goto('/search/redirects');
    await searchAndWaitForResults(page, 'Gravy');
    await expect(page.getByText('Gravy').first()).toBeVisible();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit redirect rule' }).click();

    await page.getByPlaceholder('Select date range').click();

    await expect(
      page.getByRole('heading', { name: 'Rule date and time duration' })
    ).toBeVisible();

    await page.getByTitle('Toggle').click();
    await page.getByLabel('14 November 2024').click();
    await page.getByLabel('14 November 2024').click();
    await page.getByLabel('19 November 2024').click();
    await expect(
      page.getByText('Nov 14 2024 00:00 - Nov 19 2024 23:59')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Close schedule editor' }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByText('Gravy').first()).toBeVisible();
    await expect(page.getByRole('time').first()).toHaveText(
      '14 Nov 2024 - 19 Nov 2024'
    );
  });

  test('duplicates and edits a rule', async ({ page }) => {
    await page.goto('/search/redirects');
    await page.getByPlaceholder('Search...').click();
    await page.getByPlaceholder('Search...').fill('Gravy');
    await expect(page.getByText('Gravy').first()).toBeVisible();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('button', { name: 'Duplicate' }).click();
    await expect(
      page.getByRole('heading', { name: 'Create a duplicate redirect rule' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Confirm' }).click();
    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit redirect rule' }).click();
    await expect(
      page.getByRole('heading', { name: 'Edit Keyword Redirect' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Select country' }).click();
    await page.getByRole('menuitemradio', { name: 'IE market only' }).click();

    await page.getByRole('button', { name: 'Edit', exact: true }).click();

    await page
      .getByRole('button', { name: 'Remove keyword: Beef Gravy' })
      .click();
    await page
      .getByRole('button', { name: 'Remove keyword: Turkey Gravy' })
      .click();

    await page.getByLabel('Add keyword to list').click();
    await page.getByLabel('Add keyword to list').fill('Vegetarian Gravy');
    await page.getByLabel('Add keyword to list').press('Enter');

    await page.getByRole('button', { name: 'Close' }).click();

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(
      page.getByText('Gravy | Vegetarian Gravy').first()
    ).toBeVisible();
  });

  test('deletes a redirect', async ({ page }) => {
    await page.goto('/search/redirects');
    await searchAndWaitForResults(page, 'Gravy');
    await expect(page.getByText('Gravy').first()).toBeVisible();

    const currentCount =
      (await page.getByTestId('results count').textContent()) ?? '';
    const totalItems = parseInt(currentCount.split('out of')[1]?.trim() ?? '0');

    await page.getByRole('button', { name: 'More options' }).first().click();

    const deleteButton = page.getByRole('button', { name: 'Delete' });
    await expect(deleteButton).toBeVisible();
    await expect(deleteButton).toBeEnabled();
    await deleteButton.click();

    const confirmButton = page.getByTestId('Delete rule');
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    await expect(page.getByTestId('results count')).toContainText(
      `out of ${totalItems - 1}`
    );
  });
});
