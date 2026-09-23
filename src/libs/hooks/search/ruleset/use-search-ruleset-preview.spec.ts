import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import type { MerchandisingReturnedKeywordRuleSet } from '@/libs/api';

import { useSearchRuleSetPreview } from './use-search-ruleset-preview';

const baseUrl = 'http://localhost';
const mockRulesetId = 'abc123';
const mockRuleData: MerchandisingReturnedKeywordRuleSet = {
  id: 'abcdcae5-c3c4-455b-aeff-b7d2af65b702',
  rules: {
    pinnedProducts: [],
    blockedProducts: [],
    boosts: { numeric: [], alphanumeric: [], product: [] },
    buries: { numeric: [], alphanumeric: [], product: [] },
    includes: {
      alphanumeric: [],
    },
    excludes: {
      alphanumeric: [],
    },
  },
  isEnabled: true,
  searchTerms: ['sock', 'socks', 'sockz'],
  lastChanged: { date: '2021-01-05T08:34:15Z', user: 'Test User' },
};

const mockPreviewData = {
  products: [
    {
      id: '60275024',
      productId: 'productId',
      title: 'Product title',
      imageUrl: ['example.jpg'],
      brand: 'M&S Collection',
      isInStock: true,
      metadata: { isPinned: false },
      price: '10',
      url: '',
    },
  ],
  facets: [],
  category: 'should be optional in api',
  ruleSet: {
    facets: [],
    rules: {
      boosts: { product: [], alphanumeric: [], numeric: [] },
      buries: { product: [], alphanumeric: [], numeric: [] },
      pinnedProducts: [],
    },
  },
  pagination: { totalItems: 1 },
  externalChanges: {
    boosts: { product: [], alphanumeric: [], numeric: [] },
    buries: { product: [], alphanumeric: [], numeric: [] },
    pinnedProducts: [],
  },
};

const badResponse = {
  status: 'Bad error',
  message: 'Something went wrong',
};

const getRuleSetPreviewMock = jest.fn();
const getRuleSetMock = jest.fn();

const handlers = [
  http.get(
    `/search/beta/merchandising/keyword/ruleset/${mockRulesetId}`,
    () => {
      const { data, status } = getRuleSetMock();
      return HttpResponse.json(data, status);
    }
  ),

  http.post('/search/beta/merchandising/preview', () => {
    const { data, status } = getRuleSetPreviewMock();
    return HttpResponse.json(data, status);
  }),
];

const server = setupServer(...handlers);

describe('useSearchRuleSetPreview', () => {
  beforeAll(() => {
    process.env.MERCHANDISING_PROXY_BASE_URL = baseUrl;
    server.listen();

    const logSpy = jest.spyOn(console, 'log');
    logSpy.mockImplementation(jest.fn());
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
    delete process.env.MERCHANDISING_PROXY_BASE_URL;
  });

  it('should render the hook', async () => {
    const mockResponse: MerchandisingReturnedKeywordRuleSet = mockRuleData;
    getRuleSetMock.mockReturnValueOnce({
      data: mockResponse,
      status: { status: 200 },
    });
    getRuleSetPreviewMock.mockReturnValueOnce({
      data: mockPreviewData,
      status: { status: 200 },
    });

    const { result } = renderHook(() => useSearchRuleSetPreview(mockRulesetId));

    const expectedData = {
      products: [
        {
          brand: 'M&S Collection',
          id: '60275024',
          productId: 'productId',
          imageUrl: ['example.jpg'],
          isInStock: true,
          metadata: {
            isPinned: false,
          },
          price: '10',
          title: 'Product title',
          url: '',
        },
      ],
      ruleSet: mockRuleData,
      error: '',
      isLoading: false,
    };

    await waitFor(() => {
      expect(result).toEqual({ current: expectedData });
    });
  });

  it('should return an error when the search api call fails', async () => {
    const mockResponse: MerchandisingReturnedKeywordRuleSet = mockRuleData;
    getRuleSetMock.mockReturnValueOnce({
      data: mockResponse,
      status: { status: 200 },
    });
    getRuleSetPreviewMock.mockReturnValueOnce({
      data: badResponse,
      status: { status: 500 },
    });

    const { result } = renderHook(() => useSearchRuleSetPreview(mockRulesetId));

    const expectedData = {
      products: [],
      ruleSet: mockRuleData,
      error: 'Error Something went wrong Bad error',
      isLoading: false,
    };

    await waitFor(() => {
      expect(result).toEqual({ current: expectedData });
    });
  });

  it('should stop loading when the api fails to fetch', async () => {
    const errorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    try {
      server.use(
        http.get(
          `/search/beta/merchandising/keyword/ruleset/${mockRulesetId}`,
          () => HttpResponse.error()
        )
      );

      const { result } = renderHook(() =>
        useSearchRuleSetPreview(mockRulesetId)
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('');
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('should not make API calls when id is empty', async () => {
    const { result } = renderHook(() => useSearchRuleSetPreview(''));

    const expectedData = {
      products: [],
      ruleSet: {
        searchTerms: [],
        id: '',
        isEnabled: false,
        lastChanged: {
          date: '',
          user: '',
        },
        rules: {
          pinnedProducts: [],
          blockedProducts: [],
          boosts: { alphanumeric: [], numeric: [], product: [] },
          buries: {
            alphanumeric: [],
            numeric: [],
            product: [],
          },
          includes: {
            alphanumeric: [],
          },
          excludes: {
            alphanumeric: [],
          },
        },
        facets: [],
      },
      error: '',
      isLoading: false,
    };

    expect(result.current).toEqual(expectedData);

    expect(getRuleSetMock).not.toHaveBeenCalled();
    expect(getRuleSetPreviewMock).not.toHaveBeenCalled();
  });
});
