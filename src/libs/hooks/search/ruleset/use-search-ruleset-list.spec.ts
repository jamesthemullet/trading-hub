import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { mockMerchandisingRules } from '@/test/data/mock-merchandising-rules';

import { useSearchRulesetList } from './use-search-ruleset-list';

const baseUrl = 'http://localhost';

const mockId = 'ewfw-e3f23-f23f2-3cwef3';
const mockSearchTerms = ['search', 'terms'];
const mockRulesets = {
  ruleSets: [
    {
      searchTerms: mockSearchTerms,
      id: mockId,
      isEnabled: true,
      lastChanged: {
        user: 'user',
        date: '2021-01-01',
      },
      rules: mockMerchandisingRules,
      facets: [],
    },
  ],
  error: '',
  pagination: {
    totalItems: 0,
  },
};

const handlers = [
  http.get(`${baseUrl}/search/beta/merchandising/keyword/ruleset`, () => {
    return HttpResponse.json(mockRulesets, { status: 200 });
  }),
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
    const { result } = renderHook(() => useSearchRulesetList('', 0, 50));
    act(() => {
      result.current.refetchRuleSetList();
    });

    await waitFor(() => {
      expect(result.current.ruleSets.length).toEqual(1);
    });
  });

  it('should render the hook with error', async () => {
    server.use(
      http.get(`${baseUrl}/search/beta/merchandising/keyword/ruleset`, () => {
        return HttpResponse.json(
          { message: 'Internal Server Error' },
          { status: 500 }
        );
      })
    );

    const { result } = renderHook(() => useSearchRulesetList('', 0, 50));

    await waitFor(() => {
      expect(result.current.error).toEqual('Internal Server Error');
    });
  });
});
