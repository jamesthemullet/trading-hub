import { expect, test } from '../fixtures';

test.describe.configure({ mode: 'serial' });

test.describe('Global Ranking', () => {
  let createdRulesetId: string | undefined;
  let createdCftoRulesetId: string | undefined;

  test.afterEach(async ({ request }) => {
    if (!createdCftoRulesetId) return;
    const rulesetId = createdCftoRulesetId;
    createdCftoRulesetId = undefined;
    const del = await request.delete(
      `/api/search/beta/merchandising/global/ruleset/${rulesetId}`
    );

    if (!del.ok() && del.status() !== 404) {
      throw new Error(
        `CFTO teardown DELETE failed for ${rulesetId}: ${del.status()}`
      );
    }
  });

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
      page.getByRole('link', { name: 'Add ranking rule' })
    ).toBeVisible();
    await expect(page.getByText('0 results', { exact: true })).toBeHidden();

    await page.getByRole('link', { name: 'Add ranking rule' }).click();
    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();

    const responsePromise = page.waitForResponse(
      (r) =>
        /\/api\/search\/beta\/merchandising\/[^/]+\/global\/ruleset$/.test(
          r.url()
        ) && r.request().method() === 'POST'
    );

    await page.getByRole('button', { name: 'Create', exact: true }).click();
    const createResponse = await responsePromise;
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
        name: 'Review changes',
      })
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'Save changes', exact: true })
      .click();

    await expect(
      page.getByRole('heading', {
        name: 'Review changes',
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
        name: 'Review changes',
      })
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'Save changes', exact: true })
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
        name: 'Review changes',
      })
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'Save changes', exact: true })
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
    await page.getByLabel('Boost amount %').fill('95');
    await page.getByRole('button', { name: 'Boost 95%' }).click();

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
        name: 'Review changes',
      })
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'Save changes', exact: true })
      .click();

    await expect(
      page.getByRole('heading', { name: 'Review changes' })
    ).toBeHidden();
    await page.waitForURL(/\/global\/?(?:$|[?#])/);
    await expect(page.getByRole('heading', { name: 'Global' })).toBeVisible();
  });

  test('edits a CFTO ruleset with block, bury and boost product actions', async ({
    page,
    request,
  }) => {
    const cftoRulesetsResponse = await request.get(
      '/api/search/merchandising/v1/CFTO/global/ruleset?start=0&rows=1'
    );

    test.skip(
      !cftoRulesetsResponse.ok(),
      `CFTO API unavailable: ${cftoRulesetsResponse.status()}`
    );

    await page.goto('/global');
    await page.getByText('cfto.com').click();
    await expect(page).toHaveURL(/catalogue=CFTO/);

    await page.getByRole('link', { name: 'Add ranking rule' }).click();
    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();

    const createCftoRulesetResponse = page.waitForResponse(
      (response) =>
        response
          .url()
          .endsWith('/api/search/beta/merchandising/CFTO/global/ruleset') &&
        response.request().method() === 'POST'
    );
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    const createdCftoResponse = await createCftoRulesetResponse;
    if (!createdCftoResponse.ok()) {
      throw new Error(
        `CFTO create POST failed: ${createdCftoResponse.status()}`
      );
    }
    ({ id: createdCftoRulesetId } = await createdCftoResponse.json());

    await page.goto(
      `/global/rulesets/edit/${createdCftoRulesetId}?catalogue=CFTO`
    );
    await expect(
      page.getByRole('heading', { name: 'Product Grid' })
    ).toBeVisible();

    await page.getByPlaceholder('Search for product').fill('christmas');
    await expect(
      page.getByTestId('product-search-result').getByTestId('Position 3')
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Changes', exact: true })
    ).toBeVisible();

    await page
      .getByTestId('Position 1')
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Boost to Top' }).click();
    await page.getByLabel('Boost amount %').fill('95');
    await page.getByRole('button', { name: 'Boost 95%' }).click();

    await page
      .getByTestId('Position 2')
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Bury to Bottom' }).click();

    await page
      .getByTestId('Position 3')
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Block Product' }).click();

    await expect(page.getByRole('button', { name: 'Changes3' })).toBeVisible();

    const updateResponse = page.waitForResponse(
      (response) =>
        response
          .url()
          .endsWith(
            `/api/search/merchandising/v1/CFTO/global/ruleset/${createdCftoRulesetId}`
          ) && response.request().method() === 'PUT'
    );
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await page
      .getByRole('button', { name: 'Save changes', exact: true })
      .click();
    const response = await updateResponse;
    expect(response.ok(), `CFTO update PUT failed: ${response.status()}`).toBe(
      true
    );
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

    await page.getByTitle('Global Ranking Rules').click();

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
    const viewVersionLinks = page.getByRole('link', {
      name: 'View',
      exact: true,
    });
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

    const viewFacetVersionLinks = page.getByRole('link', { name: /^View$/ });
    await expect(viewFacetVersionLinks.first()).toBeVisible();

    // View a historical facet version — should be read-only
    await viewFacetVersionLinks.first().click();

    await expect(
      page.getByRole('heading', { name: 'Global Facet Rule Editor' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeHidden();

    // Go back to history page and verify Close button returns to the listing
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
    const totalItems = parseInt(currentCount.split('out of')[1]?.trim() ?? '0');
    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByTestId('Delete rule').click();

    await expect(page.getByTestId('results count')).toContainText(
      `out of ${totalItems - 1}`
    );
  });
});
