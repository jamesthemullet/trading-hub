import {
  getFacetRoute,
  getHistoryRoute,
  getNewFacetRoute,
  getNewRulesetRoute,
  getRulesetEditRoute,
  ROUTES,
} from './routes';
import type { NonRedirectRuleType } from './rule-types';
import { FacetType, RuleType } from './rule-types';

describe('ROUTES', () => {
  it('GLOBAL.FACETS.VALUES.EDIT returns the correct path', () => {
    expect(ROUTES.GLOBAL.FACETS.VALUES.EDIT('facet-1')).toBe(
      '/global/facets/values/edit/facet-1'
    );
  });

  it('GLOBAL.FACET_CONFIG_VALUES returns the correct path', () => {
    expect(ROUTES.GLOBAL.FACET_CONFIG_VALUES('facet-1')).toBe(
      '/global/facet-config/values/edit/facet-1'
    );
  });
});

describe('getFacetRoute', () => {
  it.each([
    [FacetType.Category, 'edit' as const, '/category/facets/edit/abc'],
    [FacetType.Search, 'edit' as const, '/search/facets/edit/abc'],
    [FacetType.Global, 'edit' as const, '/global/facets/edit/abc'],
    [
      FacetType.Category,
      'valuesEdit' as const,
      '/category/facets/values/edit/abc',
    ],
    [FacetType.Search, 'valuesEdit' as const, '/search/facets/values/edit/abc'],
    [FacetType.Global, 'valuesEdit' as const, '/global/facets/values/edit/abc'],
  ])('returns correct route for %s/%s', (facetType, routeType, expected) => {
    expect(getFacetRoute(facetType, routeType, 'abc')).toBe(expected);
  });
});

describe('getNewFacetRoute', () => {
  it.each([
    [FacetType.Category, '/category/facets/new'],
    [FacetType.Search, '/search/facets/new'],
    [FacetType.Global, '/global/facets/new'],
  ])('returns correct new facet route for %s', (facetType, expected) => {
    expect(getNewFacetRoute(facetType)).toBe(expected);
  });
});

describe('getNewRulesetRoute', () => {
  it.each([
    [RuleType.CategoryRanking, '/category/rulesets/new'],
    [RuleType.SearchRanking, '/search/rulesets/new'],
    [RuleType.Global, '/global/rulesets/new'],
  ] as Array<[NonRedirectRuleType, string]>)(
    'returns correct new ruleset route for %s',
    (ruleType, expected) => {
      expect(getNewRulesetRoute(ruleType)).toBe(expected);
    }
  );
});

describe('getRulesetEditRoute', () => {
  it.each([
    [RuleType.CategoryRanking, '/category/rulesets/edit/abc'],
    [RuleType.SearchRanking, '/search/rulesets/edit/abc'],
    [RuleType.Global, '/global/rulesets/edit/abc'],
    [RuleType.Redirect, '/search/redirects/edit/abc'],
  ])('returns correct edit route for %s', (ruleType, expected) => {
    expect(getRulesetEditRoute(ruleType, 'abc')).toBe(expected);
  });
});

describe('getHistoryRoute', () => {
  it.each([
    [RuleType.CategoryRanking, '/category/history/abc/?identifier=label'],
    [RuleType.SearchRanking, '/search/history/abc/?identifier=label'],
    [RuleType.Global, '/global/history/abc/?identifier=label'],
    [RuleType.Redirect, '/search/redirects/history/abc/?identifier=label'],
  ])('returns correct history route for %s', (ruleType, expected) => {
    expect(getHistoryRoute(ruleType, 'abc', 'label')).toBe(expected);
  });
});
