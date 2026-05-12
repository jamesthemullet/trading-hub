import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('Global Material Type facet value merging', () => {
  let materialTypeFacetId: string | undefined;
  let ruleSetId = 'draft';
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

    const rulesetResponse = await request.get(
      '/api/search/beta/merchandising/global/ruleset?q=&start=0&rows=1'
    );
    if (rulesetResponse.ok()) {
      ruleSetId = (await rulesetResponse.json()).ruleSets?.[0]?.id ?? 'draft';
    }
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
    test.skip(
      !materialTypeFacetId,
      'Material Type facet not found in this environment'
    );

    const valuesEditorUrl = `/global/facets/values/edit/${materialTypeFacetId}?ruleSetId=${ruleSetId}&displayName=Material+Type&countryCode=UK_IE`;

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
    await expect(page.getByText('Merged Value Group')).toBeVisible();

    // Persist to the API via the confirmation modal
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await page
      .getByRole('button', { name: 'Apply action', exact: true })
      .click();
    await page.waitForURL(/\/global\/facets\/edit\//);

    // ── Verify merge persisted ───────────────────────────────────────────────

    await page.goto(valuesEditorUrl);
    await expect(
      page.getByRole('heading', { name: 'Value settings of: Material Type' })
    ).toBeVisible();
    await expect(page.getByText('Merged Value Group')).toBeVisible();

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
    await page
      .getByRole('button', { name: 'Apply action', exact: true })
      .click();
    await page.waitForURL(/\/global\/facets\/edit\//);

    // ── Verify expanded group persisted ──────────────────────────────────────

    await page.goto(valuesEditorUrl);
    await expect(
      page.getByRole('heading', { name: 'Value settings of: Material Type' })
    ).toBeVisible();
    await expect(
      page.getByLabel('Remove merged facet for Geometric')
    ).toBeVisible();

    // ── Reverse ──────────────────────────────────────────────────────────────

    await page.getByLabel('Remove merged facet for Animal print').click();
    await page.getByLabel('Remove merged facet for Geometric').click();

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await page
      .getByRole('button', { name: 'Apply action', exact: true })
      .click();
    await page.waitForURL(/\/global\/facets\/edit\//);

    // ── Verify reversal persisted ────────────────────────────────────────────

    await page.goto(valuesEditorUrl);
    await expect(
      page.getByRole('heading', { name: 'Value settings of: Material Type' })
    ).toBeVisible();
    await expect(
      page.getByLabel('Edit display name for Animal print')
    ).toBeVisible();
    await expect(
      page.getByLabel('Edit display name for Geometric')
    ).toBeVisible();
  });
});
