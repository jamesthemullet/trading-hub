import { expect, type Page } from '@playwright/test';

const getProductSearchResults = (page: Page) =>
  page.getByTestId('product-search-result');

export const getProductSearchResultPosition = (page: Page, position: number) =>
  getProductSearchResults(page).getByTestId(`Position ${position}`);

export const searchForProductAndWaitForResults = async (
  page: Page,
  searchTerm: string,
  highestExpectedPosition = 1
) => {
  await page.getByPlaceholder('Search for product').fill(searchTerm);
  await expect(
    getProductSearchResultPosition(page, highestExpectedPosition)
  ).toBeVisible();
};

export const searchAndWaitForResults = async (
  page: Page,
  searchTerm: string
) => {
  const resultsCount = page.getByTestId('results count');
  const initialCount = await resultsCount.textContent();

  const searchInput = page.getByPlaceholder('Search...');
  await searchInput.click();
  await searchInput.fill(searchTerm);

  await expect(resultsCount).not.toHaveText(initialCount ?? '');
};

export const clickCreateAndConfirmReview = async (
  page: Page
): Promise<void> => {
  await page.getByRole('button', { name: 'Create', exact: true }).click();

  const reviewDialog = page
    .getByRole('dialog')
    .filter({ has: page.getByRole('heading', { name: 'Review changes' }) });

  await reviewDialog.waitFor({ state: 'visible' });
  await reviewDialog
    .getByRole('button', { name: 'Save changes', exact: true })
    .click();
  await reviewDialog.waitFor({ state: 'hidden' });
};

export const clickSaveAndConfirmReviewIfPresent = async (
  page: Page
): Promise<void> => {
  await page.getByRole('button', { name: 'Save', exact: true }).click();

  const reviewDialog = page
    .getByRole('dialog')
    .filter({ has: page.getByRole('heading', { name: 'Review changes' }) });

  const hasReviewDialog = await reviewDialog
    .waitFor({ state: 'visible', timeout: 3000 })
    .then(() => true)
    .catch((err: unknown) => {
      if (
        err instanceof Error &&
        (err.name === 'TimeoutError' || err.message.includes('Timeout'))
      ) {
        return false;
      }
      throw err;
    });

  if (hasReviewDialog) {
    await reviewDialog
      .getByRole('button', { name: 'Save changes', exact: true })
      .click();
    await reviewDialog.waitFor({ state: 'hidden' });
  }
};
