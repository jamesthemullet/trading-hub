import { expect, type Page } from '@playwright/test';

const getProductSearchResults = (page: Page) =>
  page.getByTestId('product-search-result');

export const getProductSearchResultPosition = (
  page: Page,
  position: number
): ReturnType<typeof getProductSearchResults> =>
  getProductSearchResults(page).getByTestId(`Position ${position}`);

export const searchForProductAndWaitForResults = async (
  page: Page,
  searchTerm: string,
  highestExpectedPosition = 1
): Promise<void> => {
  await page.getByPlaceholder('Search for product').fill(searchTerm);
  await expect(
    getProductSearchResultPosition(page, highestExpectedPosition)
  ).toBeVisible();
};

export const searchAndWaitForResults = async (
  page: Page,
  searchTerm: string
): Promise<void> => {
  const resultsCount = page.getByTestId('results count');
  const initialCount = await resultsCount.textContent();

  const searchInput = page.getByLabel('Search rules');
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

type OptimisticLockConflictConfig<T> = {
  /** Glob matching the v1 update (PUT) endpoint for the entity under test. */
  url: string;
  /** Entity "someone else" saved — returned in the 409 body + on overwrite. */
  currentEntity: T;
  /** Body returned once the save succeeds (the overwrite PUT). */
  successJson: T;
};

/**
 * Simulates optimistic-locking on a v1 update endpoint: the first PUT (the
 * user's save) returns a 409 — a `MerchandisingErrorResponse` carrying the
 * entity someone else saved — and every later PUT (the conflict modal's
 * "Overwrite") succeeds. Register it inside a test so it takes precedence over
 * any endpoint stubbed in `beforeEach`.
 *
 * Returns `hasConflicted()` so a discard test can flip its reload GET to the
 * other user's entity once the conflict has happened (see
 * `mockReloadAfterConflict`).
 */
export const mockOptimisticLockConflict = async <T>(
  page: Page,
  { url, currentEntity, successJson }: OptimisticLockConflictConfig<T>
): Promise<{ hasConflicted: () => boolean }> => {
  let saveAttempts = 0;
  let hasConflicted = false;
  await page.route(url, async (route) => {
    if (route.request().method() !== 'PUT') {
      return route.fallback();
    }
    saveAttempts += 1;
    if (saveAttempts === 1) {
      hasConflicted = true;
      return route.fulfill({
        status: 409,
        json: {
          status: 'CONFLICT',
          message: 'Version conflict',
          currentEntity,
        },
      });
    }
    return route.fulfill({ status: 200, json: successJson });
  });
  return { hasConflicted: () => hasConflicted };
};

/**
 * Discard reloads the editor, which re-fetches the entity; after a conflict the
 * server holds the other user's version. This stubs that reload GET to serve
 * `before` until the conflict happens and `after` once it has, so a discard
 * test can prove the reloaded editor shows the other user's change instead of
 * silently passing on the modal closing alone.
 */
export const mockReloadAfterConflict = async (
  page: Page,
  {
    url,
    before,
    after,
    hasConflicted,
  }: {
    url: string;
    before: unknown;
    after: unknown;
    hasConflicted: () => boolean;
  }
): Promise<void> => {
  await page.route(url, async (route) => {
    if (route.request().method() !== 'GET') {
      return route.fallback();
    }
    await route.fulfill({
      status: 200,
      json: hasConflicted() ? after : before,
    });
  });
};

const conflictHeading = (page: Page, entityLabel: string) =>
  page.getByRole('heading', {
    name: `This ${entityLabel} was changed by someone else`,
  });

export const expectConflictModalVisible = async (
  page: Page,
  entityLabel: string
): Promise<void> => {
  await expect(conflictHeading(page, entityLabel)).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Overwrite with my changes' })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Discard my changes' })
  ).toBeVisible();
};

export const expectConflictModalHidden = (
  page: Page,
  entityLabel: string
): Promise<void> => expect(conflictHeading(page, entityLabel)).toBeHidden();

export const overwriteConflictChanges = (page: Page): Promise<void> =>
  page.getByRole('button', { name: 'Overwrite with my changes' }).click();

export const discardConflictChanges = (page: Page): Promise<void> =>
  page.getByRole('button', { name: 'Discard my changes' }).click();

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
