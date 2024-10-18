/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable testing-library/prefer-screen-queries */

import { expect, test } from '@playwright/test';
import { cookies } from '../helpers';

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ context }) => {
  await context.addCookies(cookies);
});

test.describe('Category Ranking', () => {
  test('creates new ruleset', async ({ page }) => {
    await page.goto('/category/facets');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Category Facet Management' })
    ).toBeVisible();

    await expect(
      page.getByRole('link', { name: 'Add new facet' })
    ).toBeVisible();
    await expect(
      page.getByText('0 results', { exact: true })
    ).not.toBeVisible();

    await page.getByRole('link', { name: 'Add new facet' }).click();

    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Facet Rule Editor' })
    ).toBeVisible();

    await page.getByPlaceholder('Search...').click();
    await page.getByPlaceholder('Search...').fill('SubCategory_19573263');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page
      .getByText(
        'SubCategory_19573263 | Hat, Gloves & Scarves | l/women/hat-gloves-and-scarves'
      )
      .click({ timeout: 500 });

    await page.getByRole('button', { name: 'Create' }).click();
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Category Facet Management' })
    ).toBeVisible();

    await page.getByPlaceholder('Search...').click();
    await page.getByPlaceholder('Search...').fill('SubCategory_19573263');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(
      page.getByText('SubCategory_19573263 | Hat, Gloves & Scarves').first()
    ).toBeVisible();

    await page.getByRole('link', { name: 'Edit' }).first().click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('babySize')).toBeVisible();

    await page.getByRole('button', { name: 'Algo control' }).first().click();
    await page.getByRole('button', { name: 'include', exact: true }).click();

    await page.getByRole('button', { name: 'Algo control' }).first().click();
    await page.getByRole('button', { name: 'exclude', exact: true }).click();

    await page.getByRole('button', { name: 'Preview' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await expect(
      page.getByRole('heading', { name: 'Baby Sizes' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'close modal' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
  });

  test('edits a ruleset', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2024-11-05T10:00:00'));
    await page.goto('/category/rulesets');
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('Search...').click();
    await page.getByPlaceholder('Search...').fill('SubCategory_19573263');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(
      page.getByText('SubCategory_19573263 | Hat, Gloves & Scarves').first()
    ).toBeVisible();

    await page.getByRole('link', { name: 'Edit' }).first().click();
    await page.waitForLoadState('networkidle');

    const product2Id =
      (await page
        .getByLabel('Position 2', { exact: true })
        .getByLabel('product id')
        .textContent()) || '';

    await page
      .getByLabel('Position 1', { exact: true })
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Boost to Top' }).click();

    await expect(page.getByLabel('Position 2', { exact: true })).toBeVisible();
    await page
      .getByLabel('Position 2', { exact: true })
      .getByRole('button', { name: 'Open menu' })
      .click();
    await page.getByRole('button', { name: 'Bury to Bottom' }).click();

    await page.waitForTimeout(3000);
    await expect(page.getByText(product2Id)).not.toBeInViewport();

    await expect(page.getByRole('button', { name: 'Changes2' })).toBeVisible();
    await page.getByRole('button', { name: 'Changes2' }).click();
    await expect(
      page.getByRole('heading', { name: 'Boosted Products (1)' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Buried Products (1)' })
    ).toBeVisible();

    await page.getByPlaceholder('Select date range').click();

    await expect(
      page.getByRole('heading', { name: 'Rule date and time duration' })
    ).toBeVisible();

    await page.getByTitle('Toggle').click();
    await page.getByLabel('14 November 2024').click();
    await page.getByLabel('19 November 2024').click();
    await expect(
      page.getByText('Nov 14 2024 00:00 - Nov 19 2024 23:59')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Save' }).nth(1).click();
    await page.getByRole('button', { name: 'Save' }).first().click();

    await expect(
      page.getByText('SubCategory_19573263 | Hat, Gloves & Scarves').first()
    ).toBeVisible();
    await expect(page.getByRole('time').first()).toHaveText(
      '14 Nov 2024 - 19 Nov 2024'
    );
  });

  test('keeps changes for facets and products', async ({ page }) => {
    await page.goto('/category/facets');
    await page.waitForLoadState('networkidle');

    await page.getByPlaceholder('Search...').click();
    await page.getByPlaceholder('Search...').fill('SubCategory_19573263');
    await page.waitForTimeout(2000);
    await expect(
      page.getByText('SubCategory_19573263 | Hat, Gloves & Scarves').first()
    ).toBeVisible();

    await expect(page.getByRole('time').first()).toHaveText(
      '14 Nov 2024 - 19 Nov 2024'
    );

    await page.getByRole('link', { name: 'Edit' }).first().click();
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByLabel('Row showing Baby Sizes as included')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Category Ranking Rules' }).click();
    await page.getByRole('link', { name: 'Ranking rules' }).click();

    await page.getByPlaceholder('Search...').click();
    await page.getByPlaceholder('Search...').fill('SubCategory_19573263');
    await page.waitForTimeout(2000);

    await page.getByRole('link', { name: 'Edit' }).first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: 'Changes2' })).toBeVisible();
  });

  test('deletes a ruleset', async ({ page }) => {
    await page.goto('/category/rulesets');
    await page.waitForLoadState('networkidle');
    await page.getByPlaceholder('Search...').click();
    await page.getByPlaceholder('Search...').fill('SubCategory_19573263');
    await page.waitForTimeout(2000);
    await expect(
      page.getByText('SubCategory_19573263 | Hat, Gloves & Scarves').first()
    ).toBeVisible();

    const currentCount =
      (await page.getByLabel('results count').textContent()) || '';
    await page.getByRole('button', { name: 'More options' }).first().click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByLabel('Delete rule').click();

    await expect(
      page.getByText(`${parseInt(currentCount) - 1} results`, { exact: true })
    ).toBeVisible();
  });
});
