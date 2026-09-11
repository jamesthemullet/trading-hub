import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

// Clicks "Save changes" and waits for either a successful navigation back to
// the facet list, or a conflict (someone else saved this facet in the
// meantime - e.g. an overlapping scheduled smoke test run). If a conflict
// modal appears, resolve it by overwriting with our own changes so the test
// doesn't silently lose the edit it just made.
const saveChanges = async (page: Page): Promise<void> => {
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();

  const overwriteButton = page.getByRole('button', {
    name: 'Overwrite with my changes',
  });

  await Promise.race([
    page.waitForURL(/\/global\/facet-config/),
    overwriteButton.waitFor({ state: 'visible' }),
  ]);

  if (await overwriteButton.isVisible()) {
    await overwriteButton.click();
    await page.waitForURL(/\/global\/facet-config/);
  }
};

const reloadUntilVisible = async (
  page: Page,
  url: string,
  getLocator: (page: Page) => Locator,
  { retries = 5, delayMs = 2000 }: { retries?: number; delayMs?: number } = {}
): Promise<void> => {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    await page.goto(url);
    await expect(
      page.getByRole('heading', { name: 'Value settings of: Material Type' })
    ).toBeVisible();

    const isLastAttempt = attempt === retries - 1;
    try {
      await expect(getLocator(page)).toBeVisible({
        timeout: isLastAttempt ? 5000 : 1000,
      });
      return;
    } catch (error) {
      if (isLastAttempt) throw error;
      await page.waitForTimeout(delayMs);
    }
  }
};

test.describe('Global Material Type facet value merging', () => {
  let materialTypeFacetId: string | undefined;
  let originalMerged: Array<{
    displayValue: string;
    mergedValues: string[];
  }> = [];

  test.beforeAll(async ({ request }) => {
    const facetsResponse = await request.get(
      '/api/search/beta/merchandising/facet'
    );
    if (!facetsResponse.ok()) {
      throw new Error(
        `Failed to fetch facets: ${facetsResponse.status()} ${facetsResponse.statusText()}`
      );
    }

    const { facets } = await facetsResponse.json();
    const materialTypeFacet = facets.find(
      (f: { displayValue: string }) => f.displayValue === 'Material Type'
    );
    if (!materialTypeFacet) return;

    materialTypeFacetId = materialTypeFacet.id;
    originalMerged = materialTypeFacet.merged ?? [];
  });

  test.afterAll(async ({ request }) => {
    if (!materialTypeFacetId) return;

    const facetResponse = await request.get(
      `/api/search/beta/merchandising/facet/${materialTypeFacetId}`
    );
    if (!facetResponse.ok()) {
      throw new Error(
        `Failed to fetch facet ${materialTypeFacetId} during teardown: ${facetResponse.status()} ${facetResponse.statusText()}`
      );
    }

    const facet = await facetResponse.json();
    const restoreResponse = await request.put(
      `/api/search/beta/merchandising/facet/${materialTypeFacetId}`,
      { data: { ...facet, merged: originalMerged } }
    );

    if (!restoreResponse.ok()) {
      throw new Error(
        `Failed to restore facet ${materialTypeFacetId} during teardown: ${restoreResponse.status()} ${restoreResponse.statusText()}`
      );
    }
  });

  test('merges and reverses Material Type facet values', async ({ page }) => {
    // Guards against navigating to a URL with an undefined id when the facet is missing in this environment
    test.skip(!materialTypeFacetId, 'Material Type facet not found');

    const valuesEditorUrl = `/global/facet-config/values/edit/${materialTypeFacetId}?displayName=Material+Type`;

    // ── Merge ────────────────────────────────────────────────────────────────

    await page.goto(valuesEditorUrl);
    await expect(
      page.getByRole('heading', { name: 'Value settings of: Material Type' })
    ).toBeVisible();

    await page.getByLabel('Select Animal to merge').click();
    await page.getByLabel('Select Animal print to merge').click();
    await expect(page.getByText('2 selected')).toBeVisible();

    await page.getByRole('button', { name: 'Merge', exact: true }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Save' })
      .click();

    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(
      page
        .getByTestId(/algoControl attribute \d+ Animal/)
        .getByText('Merged Value Group')
    ).toBeVisible();

    // Persist to the API via the review changes modal
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await saveChanges(page);

    // ── Verify merge persisted ───────────────────────────────────────────────

    await reloadUntilVisible(page, valuesEditorUrl, (p) =>
      p
        .getByTestId(/algoControl attribute \d+ Animal/)
        .getByText('Merged Value Group')
    );

    // ── Add Geometric to the existing Animal merged group ────────────────────

    await page.getByLabel('Select Animal to merge').click();
    await page.getByLabel('Select Geometric to merge').click();
    await expect(page.getByText('2 selected')).toBeVisible();

    await page.getByRole('button', { name: 'Merge', exact: true }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Save' })
      .click();

    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(
      page.getByLabel('Remove merged facet for Geometric')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await saveChanges(page);

    // ── Verify expanded group persisted ──────────────────────────────────────

    await reloadUntilVisible(page, valuesEditorUrl, (p) =>
      p.getByLabel('Remove merged facet for Geometric')
    );

    // ── Reverse ──────────────────────────────────────────────────────────────

    await page.getByLabel('Remove merged facet for Animal').click();
    await page.getByLabel('Remove merged facet for Geometric').click();

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await saveChanges(page);

    // ── Verify reversal persisted ────────────────────────────────────────────

    await reloadUntilVisible(page, valuesEditorUrl, (p) =>
      p.getByLabel('Edit display name for Animal', { exact: true })
    );
    await reloadUntilVisible(page, valuesEditorUrl, (p) =>
      p.getByLabel('Edit display name for Geometric')
    );
  });
});
