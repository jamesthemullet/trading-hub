import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import type { ReturnedKeywordRuleSet } from '@/libs/api';

import { useSearchRuleSetPreview } from './use-search-ruleset-preview';

const baseUrl = 'http://localhost';
const mockRulesetId = 'abc123';
const mockRuleData: ReturnedKeywordRuleSet = {
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
    const mockResponse: ReturnedKeywordRuleSet = mockRuleData;
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
    const mockResponse: ReturnedKeywordRuleSet = mockRuleData;
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
});
