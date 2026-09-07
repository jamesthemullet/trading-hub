import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { reportApiLatency } from '@/libs/utils/dynatrace';
import { emitSaveSuccess } from '@/libs/utils/toast-events';
import { redirectMock } from '@/pages/api/search/mocks';
import { mockMerchandisingRules } from '@/test/data/mock-merchandising-rules';

import { api, search } from './index';

jest.mock('@/libs/utils/dynatrace', () => ({
  reportApiLatency: jest.fn(),
}));

jest.mock('@/libs/utils/toast-events', () => ({
  emitSaveSuccess: jest.fn(),
}));

const server = setupServer();

beforeAll(() => server.listen());

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

describe('API', () => {
  it('should default to BFF proxy endpoint', () => {
    expect(api().baseUrl).toEqual('/api');
  });

  it('should use env var if present', () => {
    process.env.MERCHANDISING_PROXY_BASE_URL = 'http://localhost';
    expect(api().baseUrl).toEqual('http://localhost');
    delete process.env.MERCHANDISING_PROXY_BASE_URL;
  });

  describe('createTimingFetch', () => {
    it('reports API latency for every request', async () => {
      server.use(
        http.get('/api/search/beta/merchandising/category/ruleset', () =>
          HttpResponse.json(
            { ruleSets: [], pagination: {} },
            {
              status: 200,
            }
          )
        )
      );

      await search().getCategoryRuleSets({
        start: 0,
        rows: 10,
      });

      expect(reportApiLatency).toHaveBeenCalledWith(
        '/api/search/beta/merchandising/category/ruleset',
        'GET',
        200,
        expect.any(Number)
      );
    });

    it('emits a save-success toast for a successful category ruleset update', async () => {
      server.use(
        http.put(
          '/api/search/beta/merchandising/category/ruleset/rule-set-1',
          () => HttpResponse.json({}, { status: 200 })
        )
      );

      await search().updateCategoryRuleSet('rule-set-1', {
        categoryIds: ['cat-1'],
        isEnabled: true,
        rules: mockMerchandisingRules,
      });

      expect(emitSaveSuccess).toHaveBeenCalled();
    });

    it('does not emit a save-success toast for a failed category ruleset update', async () => {
      server.use(
        http.put(
          '/api/search/beta/merchandising/category/ruleset/rule-set-1',
          () => HttpResponse.json({}, { status: 409 })
        )
      );

      await search()
        .updateCategoryRuleSet('rule-set-1', {
          categoryIds: ['cat-1'],
          isEnabled: true,
          rules: mockMerchandisingRules,
        })
        .catch(() => undefined);

      expect(emitSaveSuccess).not.toHaveBeenCalled();
    });

    it('does not emit a save-success toast for a non-save request to a save-shaped endpoint', async () => {
      server.use(
        http.get('/api/search/beta/merchandising/category/ruleset', () =>
          HttpResponse.json(
            { ruleSets: [], pagination: {} },
            {
              status: 200,
            }
          )
        )
      );

      await search().getCategoryRuleSets({
        start: 0,
        rows: 10,
      });

      expect(emitSaveSuccess).not.toHaveBeenCalled();
    });

    it.each([
      {
        name: 'keyword ruleset create',
        setup: () =>
          server.use(
            http.post('/api/search/beta/merchandising/keyword/ruleset', () =>
              HttpResponse.json({}, { status: 200 })
            )
          ),
        call: () =>
          search().createKeywordRuleSet({
            searchTerms: ['socks'],
            rules: mockMerchandisingRules,
            facets: [],
            excludedFacets: { facets: [] },
            countryCode: 'UK_IE',
            isEnabled: true,
          }),
      },
      {
        name: 'keyword ruleset update',
        setup: () =>
          server.use(
            http.put(
              '/api/search/beta/merchandising/keyword/ruleset/rule-set-1',
              () => HttpResponse.json({}, { status: 200 })
            )
          ),
        call: () =>
          search().updateKeywordRuleSet('rule-set-1', {
            searchTerms: ['socks'],
            rules: mockMerchandisingRules,
            facets: [],
            excludedFacets: { facets: [] },
            countryCode: 'UK_IE',
            isEnabled: true,
          }),
      },
      {
        name: 'keyword redirect create',
        setup: () =>
          server.use(
            http.post('/api/search/beta/merchandising/keyword/redirect', () =>
              HttpResponse.json({}, { status: 200 })
            )
          ),
        call: () => search().createKeywordRedirect(redirectMock),
      },
      {
        name: 'keyword redirect update',
        setup: () =>
          server.use(
            http.put(
              '/api/search/beta/merchandising/keyword/redirect/redirect-1',
              () => HttpResponse.json({}, { status: 200 })
            )
          ),
        call: () => search().updateKeywordRedirect('redirect-1', redirectMock),
      },
      {
        name: 'global facet update',
        setup: () =>
          server.use(
            http.put('/api/search/beta/merchandising/facet/facet-1', () =>
              HttpResponse.json({}, { status: 200 })
            )
          ),
        call: () =>
          search().updateGlobalFacet('facet-1', {
            displayValue: 'colour',
            indexPropertyName: 'color',
          }),
      },
      {
        name: 'global ruleset create',
        setup: () =>
          server.use(
            http.post('/api/search/beta/merchandising/global/ruleset', () =>
              HttpResponse.json({}, { status: 200 })
            )
          ),
        call: () =>
          search().createGlobalRuleSet({
            rules: mockMerchandisingRules,
            isEnabled: true,
            startDate: '',
            endDate: '',
            countryCode: 'UK_IE',
          }),
      },
      {
        name: 'global ruleset update (beta)',
        setup: () =>
          server.use(
            http.put(
              '/api/search/beta/merchandising/global/ruleset/rule-set-1',
              () => HttpResponse.json({}, { status: 200 })
            )
          ),
        call: () =>
          search().updateGlobalRuleSet('rule-set-1', {
            rules: mockMerchandisingRules,
            isEnabled: true,
          }),
      },
      {
        name: 'global ruleset update (v1)',
        setup: () =>
          server.use(
            http.put(
              '/api/search/merchandising/v1/CLOTHING_AND_HOME/global/ruleset/rule-set-1',
              () => HttpResponse.json({}, { status: 200 })
            )
          ),
        call: () =>
          search().merchandisingV1GlobalRulesetUpdate(
            'CLOTHING_AND_HOME',
            'rule-set-1',
            { rules: mockMerchandisingRules, isEnabled: true }
          ),
      },
    ])('emits a save-success toast for $name', async ({ setup, call }) => {
      setup();

      await call();

      expect(emitSaveSuccess).toHaveBeenCalled();
    });

    it.each([
      {
        name: 'category ruleset delete',
        setup: () =>
          server.use(
            http.delete(
              '/api/search/beta/merchandising/category/ruleset/rule-set-1',
              () => HttpResponse.json({}, { status: 200 })
            )
          ),
        call: () => search().deleteCategoryRuleSet('rule-set-1'),
      },
      {
        name: 'keyword ruleset delete',
        setup: () =>
          server.use(
            http.delete(
              '/api/search/beta/merchandising/keyword/ruleset/rule-set-1',
              () => HttpResponse.json({}, { status: 200 })
            )
          ),
        call: () => search().deleteKeywordRuleSet('rule-set-1'),
      },
      {
        name: 'global ruleset delete',
        setup: () =>
          server.use(
            http.delete(
              '/api/search/beta/merchandising/global/ruleset/rule-set-1',
              () => HttpResponse.json({}, { status: 200 })
            )
          ),
        call: () => search().deleteGlobalRuleSet('rule-set-1'),
      },
    ])('emits a delete-success toast for $name', async ({ setup, call }) => {
      setup();

      await call();

      expect(emitSaveSuccess).toHaveBeenCalledWith(
        'Ruleset deleted successfully'
      );
    });

    it('emits a delete-success toast for redirect delete', async () => {
      server.use(
        http.delete(
          '/api/search/beta/merchandising/keyword/redirect/redirect-1',
          () => HttpResponse.json({}, { status: 200 })
        )
      );

      await search().deleteKeywordRedirect('redirect-1');

      expect(emitSaveSuccess).toHaveBeenCalledWith(
        'Redirect deleted successfully'
      );
    });

    it('does not emit a toast for a deleted facet, since deletes are not wired up for facets', async () => {
      server.use(
        http.delete('/api/search/beta/merchandising/facet/facet-1', () =>
          HttpResponse.json({}, { status: 200 })
        )
      );

      await search().deleteGlobalFacet('facet-1');

      expect(emitSaveSuccess).not.toHaveBeenCalled();
    });
  });
});
