import { expect, type Page } from '@playwright/test';

export const cookies = [];

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
