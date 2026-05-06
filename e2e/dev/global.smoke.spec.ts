import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('Global Ranking', () => {
  let createdRulesetId: string | undefined;

  test.afterAll(async ({ request }) => {
    if (!createdRulesetId) return;
    const del = await request.delete(
      `/api/search/beta/merchandising/global/ruleset/${createdRulesetId}`
    );

    if (!del.ok() && del.status() !== 404) {
      throw new Error(`Teardown DELETE failed: ${del.status()}`);
    }
  });

  test('creates new ruleset', async ({ page }) => {
    await page.goto('/global');
    await expect(page.getByRole('heading', { name: 'Global' })).toBeVisible();

    await expect(
      page.getByRole('link', { name: 'Add facet rule' })
    ).toBeVisible();
    await expect(page.getByText('0 results', { exact: true })).toBeHidden();

    await page.getByRole('link', { name: 'Add facet rule' }).click();
    await expect(
      page.getByRole('heading', { name: 'Global Facet Rule Editor' })
    ).toBeVisible();

    const [createResponse] = await Promise.all([
      page.waitForResponse(
        (r) =>
          r.url().includes('/api/search/beta/merchandising/global/ruleset') &&
          r.request().method() === 'POST'
      ),
      page.getByRole('button', { name: 'Create' }).click(),
    ]);
    if (!createResponse.ok()) {
      throw new Error(`Create POST failed: ${createResponse.status()}`);
    }
    const { id }: { id: string } = await createResponse.json();
    createdRulesetId = id;

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit facet rule' }).click();

    await expect(page.getByRole('heading', { name: 'Global' })).toBeVisible();

    await expect(
      page.getByTestId('Row showing Age as algoControl')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(
      page.getByRole('heading', {
        name: 'Apply global changes',
      })
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'Apply action', exact: true })
      .click();

    await expect(
      page.getByRole('heading', {
        name: 'Apply global changes',
      })
    ).toBeHidden();

    await expect(page.getByRole('heading', { name: 'Global' })).toBeVisible();

    const checkbox = page
      .locator('label[title="Toggle"] input[type="checkbox"]')
      .first();

    await expect(checkbox).not.toBeChecked();

    await page.locator('label[title="Toggle"]').first().click();

    await expect(
      page.getByRole('heading', {
        name: 'Apply global changes',
      })
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'Apply action', exact: true })
      .click();

    await expect(checkbox).toBeChecked();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit facet rule' }).click();

    await expect(
      page.getByTestId('Row showing Absorbency Level 1 as algoControl')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Algo control' }).first().click();
    await page
      .getByRole('menuitemradio', { name: 'Include only', exact: true })
      .click();

    await expect(
      page.getByTestId('Row showing Absorbency Level 1 as included')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(
      page.getByRole('heading', {
        name: 'Apply global changes',
      })
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'Apply action', exact: true })
      .click();
  });

  test('edits a ruleset', async ({ page }) => {
    await page.goto('/global');

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit ranking rule' }).click();

    await page.getByPlaceholder('Search for product').fill('black dress');
    await expect(
      page.getByTestId('product-search-result').getByTestId('Position 1')
    ).toBeVisible();

    await page
      .getByTestId('product-search-result')
      .getByTestId('Position 1')
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Boost to Top' }).click();

    await expect(page.getByTestId('Position 2')).toBeVisible();
    await page
      .getByTestId('product-search-result')
      .getByTestId('Position 2')
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Bury to Bottom' }).click();

    await expect(page.getByRole('button', { name: 'Changes2' })).toBeVisible();
    await page.getByRole('button', { name: 'Changes2' }).click();
    await expect(
      page.getByRole('heading', { name: 'Boosted Products (1)' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Buried Products (1)' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(
      page.getByRole('heading', {
        name: 'Apply global changes',
      })
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'Apply action', exact: true })
      .click();
  });

  test('keeps changes for facets and products', async ({ page }) => {
    await page.goto('/global');

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit facet rule' }).click();

    await expect(
      page.getByRole('heading', { name: 'Global Facet Rule Editor' })
    ).toBeVisible();

    await expect(
      page.getByTestId('Row showing Absorbency Level 1 as included')
    ).toBeVisible();

    await page.getByLabel('Global Ranking Rules').click();

    await expect(page.getByRole('heading', { name: 'Global' })).toBeVisible();

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'Edit ranking rule' }).click();
    await expect(page.getByRole('button', { name: 'Changes2' })).toBeVisible();
  });

  test('views history', async ({ page }) => {
    await page.goto('/global');

    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('link', { name: 'View history' }).click();

    await expect(
      page.getByRole('heading', { name: 'Changes history' })
    ).toBeVisible();

    await expect(page.getByText('View current')).toBeVisible();
    const viewVersionLinks = page.getByRole('link', { name: 'View' });
    await expect(viewVersionLinks.first()).toBeVisible();

    // View a historical ruleset version — should be read-only
    await viewVersionLinks.first().click();

    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeHidden();

    // Go back to history page and check the Facets tab
    await page.goBack();
    await expect(
      page.getByRole('heading', { name: 'Changes history' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Facets' }).click();

    const viewFacetVersionLinks = page.getByRole('link', { name: /View/ });
    await expect(viewFacetVersionLinks.first()).toBeVisible();

    // View a historical facet version — should be read-only
    await viewFacetVersionLinks.first().click();

    await expect(
      page.getByRole('heading', { name: 'Global Facet Rule Editor' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeHidden();
    await expect(
      page.getByRole('link', { name: 'View values' }).first()
    ).toBeVisible();

    // Click through to the values page and verify it is also read-only
    await page.getByRole('link', { name: 'View values' }).first().click();
    await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();

    // Go back to history page and verify Close button returns to the listing
    await page.goBack();
    await page.goBack();
    await expect(
      page.getByRole('heading', { name: 'Changes history' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('heading', { name: 'Global' })).toBeVisible();
  });

  test('deletes a ruleset', async ({ page }) => {
    await page.goto('/global');

    const currentCount =
      (await page.getByTestId('results count').textContent()) ?? '';
    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByTestId('Delete rule').click();

    await expect(
      page.getByText(`${parseInt(currentCount) - 1} results`, { exact: true })
    ).toBeVisible();
  });
});
