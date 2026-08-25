import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { reportApiLatency } from '@/libs/utils/dynatrace';
import { emitSaveSuccess } from '@/libs/utils/toast-events';
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

      await search().betaMerchandisingCategoryRulesetList({
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

      await search().betaMerchandisingCategoryRulesetUpdate('rule-set-1', {
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
        .betaMerchandisingCategoryRulesetUpdate('rule-set-1', {
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

      await search().betaMerchandisingCategoryRulesetList({
        start: 0,
        rows: 10,
      });

      expect(emitSaveSuccess).not.toHaveBeenCalled();
    });
  });
});
