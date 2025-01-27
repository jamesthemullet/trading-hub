import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

const TEST_CATEGORY_ID = 'SubCategory_1842397';
const TEST_CATEGORY_IDENTIFIER = 'SubCategory_1842397 - Socks';

const TEST_USER_ID = process.env.PROD_TEST_USER!;
const TEST_USER_PASSWORD = process.env.PROD_TEST_USER_PASSWORD!;

test.describe('Category Ranking', () => {
  test('Loads data', async ({ page }) => {
    await page.goto('/category/rulesets');
    await page.waitForURL('**/login.microsoftonline.com/**');
    await page.waitForLoadState('domcontentloaded');

    await page.getByPlaceholder('you@mnscorp.net').fill(TEST_USER_ID);

    await page.getByRole('button', { name: 'Next' }).click();

    await page.getByPlaceholder('Password').fill(TEST_USER_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForLoadState('domcontentloaded');

    // Do not stay signed in
    await page.getByRole('button', { name: 'No' }).click();

    await page.waitForURL('**/merchandising-hub.search.marksandspencer.app/**');
    await page.waitForLoadState('domcontentloaded');

    await page.goto(
      `/category/rulesets?currentPage=1&currentPageSize=10&searchQuery=${TEST_CATEGORY_ID}`
    );

    await page.getByText(TEST_CATEGORY_IDENTIFIER);
    await expect(
      page.getByText(TEST_CATEGORY_IDENTIFIER).first()
    ).toBeVisible();
  });
});
