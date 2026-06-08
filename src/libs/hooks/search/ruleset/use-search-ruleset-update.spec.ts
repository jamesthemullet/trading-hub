import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { mockMerchandisingRules } from '@/test/data/mock-merchandising-rules';

import { useSearchRuleSetUpdate } from './use-search-ruleset-update';

const baseUrl = 'http://localhost';

const mockRulesetId = 'qfwq2r-32f23-23ewfw-233r3';
const handlers = [
  http.put(
    `${baseUrl}/search/beta/merchandising/keyword/ruleset/${mockRulesetId}`,
    () => {
      return HttpResponse.json({}, { status: 200 });
    }
  ),
];

const server = setupServer(...handlers);

describe('useSearchRulesetList', () => {
  beforeAll(() => {
    process.env.MERCHANDISING_PROXY_BASE_URL = baseUrl;
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
    delete process.env.MERCHANDISING_PROXY_BASE_URL;
  });

  it('should render the hook', async () => {
    const { result } = renderHook(() => useSearchRuleSetUpdate());

    act(() => {
      result.current.updateRuleSet({
        searchTerms: [],
        ruleSetId: mockRulesetId,
        isEnabled: true,
        facets: [],
        rules: mockMerchandisingRules,
      });
    });

    await waitFor(() => {
      expect(result.current.isSaving).toBe(true);
    });
  });

  it('should render the hook with error', async () => {
    server.use(
      http.put(
        `${baseUrl}/search/beta/merchandising/keyword/ruleset/${mockRulesetId}`,
        () => {
          return HttpResponse.json(
            {
              message: 'Validation Issues: You can only pin up to 100 products',
              status: 'Bad Request',
            },
            { status: 500 }
          );
        }
      )
    );

    const { result } = renderHook(() => useSearchRuleSetUpdate());

    act(() => {
      result.current.updateRuleSet({
        searchTerms: [],
        ruleSetId: mockRulesetId,
        isEnabled: true,
        facets: [],
        rules: mockMerchandisingRules,
      });
    });

    await waitFor(() => {
      expect(result.current.error).toEqual(
        'Error Validation Issues: You can only pin up to 100 products Bad Request'
      );
    });
  });
});
