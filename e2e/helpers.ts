import { expect, type Page } from '@playwright/test';

export const cookies = [];

export const getProductSearchResults = (page: Page) =>
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
