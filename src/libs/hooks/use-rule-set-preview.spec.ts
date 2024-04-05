import { renderHook, waitFor } from '@testing-library/react';

import type { ReturnedRuleSet } from '@/libs/api';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { useRuleSetPreview } from './use-rule-set-preview';

const baseUrl = 'http://localhost';
const mockCategoryId = 'abc123';
const mockRuleData = {
  rules: {
    pinnedProducts: [{ id: 'xyz0' }],
    blockedProducts: [],
    boosts: { numeric: [], alphaNumeric: [], product: [] },
    buries: { numeric: [], alphaNumeric: [], product: [] },
  },
  categoryId: mockCategoryId,
  isEnabled: true,
  categoryName: 'Dresses',
  id: 'df70401f-f89d-45ad-92e7-6e152930ff86',
  lastChanged: { date: '2023-12-06T14:24:17Z', user: 'Mark Spencer' },
};

const mockSearchData = {
  products: [
    {
      id: '60275024',
      title: 'Mock Product',
      rating: null,
      url: 'petite-round-neck-cardigan/p/clp60275023',
      price: '£17.50',
      brand: 'M&S Collection',
      isInStock: true,
      imageUrl: [
        'SD_01_T38_5762P_F0_X_EC_0',
        'SD_01_T38_5762P_F0_X_EC_0',
        'SD_01_T38_5762P_F0_X_EC_90',
        'SD_01_T38_5762P_F0_X_EC_90',
      ],
      metadata: {
        isPinned: false,
      },
    },
  ],
};

const badResponse = {
  status: 'Bad error',
};

const getRuleSetPreviewMock = jest.fn();

const handlers = [
  http.get(`${baseUrl}/merchandising/ruleset/${mockCategoryId}`, () => {
    const { data, status } = getRuleSetPreviewMock();
    return HttpResponse.json(data, status);
  }),
  http.post(
    `${baseUrl}/merchandising/category/${mockCategoryId}/preview`,
    () => {
      const { data, status } = getRuleSetPreviewMock();
      return HttpResponse.json(data, status);
    }
  ),
];

const server = setupServer(...handlers);

describe('useRuleSet', () => {
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
    const mockResponse: ReturnedRuleSet = mockRuleData;
    getRuleSetPreviewMock.mockReturnValueOnce({
      data: mockResponse,
      status: { status: 200 },
    });
    getRuleSetPreviewMock.mockReturnValueOnce({
      data: mockSearchData,
      status: { status: 200 },
    });

    const { result } = renderHook(() => useRuleSetPreview(mockCategoryId));

    const expectedData = {
      products: [
        {
          brand: 'M&S Collection',
          id: '60275024',
          imageUrl: [
            'SD_01_T38_5762P_F0_X_EC_0',
            'SD_01_T38_5762P_F0_X_EC_0',
            'SD_01_T38_5762P_F0_X_EC_90',
            'SD_01_T38_5762P_F0_X_EC_90',
          ],
          isInStock: true,
          metadata: {
            isPinned: false,
          },
          price: '£17.50',
          rating: null,
          title: 'Mock Product',
          url: 'petite-round-neck-cardigan/p/clp60275023',
        },
      ],
      ruleSets: mockRuleData,
      error: '',
    };

    await waitFor(() => {
      expect(result).toEqual({ current: expectedData });
    });
  });

  it('should return an error when the category api call fails', async () => {
    getRuleSetPreviewMock.mockReturnValueOnce({
      data: badResponse,
      status: { status: 500 },
    });

    const { result } = renderHook(() => useRuleSetPreview(mockCategoryId));

    const expectedData = {
      products: [],
      ruleSets: {
        categoryId: '',
        categoryName: '',
        id: '',
        isEnabled: false,
        lastChanged: {
          date: '',
          user: '',
        },
        rules: {
          pinnedProducts: [],
          boosts: { numeric: [], alphaNumeric: [], product: [] },
          buries: { numeric: [], alphaNumeric: [], product: [] }
        },
      },
      error: 'POST status 500',
    };

    await waitFor(() => {
      expect(result).toEqual({ current: expectedData });
    });
  });

  it('should return an error when the search api call fails', async () => {
    const mockResponse: ReturnedRuleSet = mockRuleData;

    getRuleSetPreviewMock.mockReturnValueOnce({
      data: mockResponse,
      status: { status: 200 },
    });
    getRuleSetPreviewMock.mockReturnValueOnce({
      data: badResponse,
      status: { status: 500 },
    });

    const { result } = renderHook(() => useRuleSetPreview(mockCategoryId));

    const expectedData = {
      products: [],
      ruleSets: mockRuleData,
      error: 'POST status 500',
    };

    await waitFor(() => {
      expect(result).toEqual({ current: expectedData });
    });
  });

  it('should error when category api fails to fetch', async () => {
    getRuleSetPreviewMock.mockImplementation(() => {
      throw new Error('No data');
    });

    const { result } = renderHook(() => useRuleSetPreview(mockCategoryId));

    await waitFor(() => {
      expect(result.current.error).toEqual(
        'Failed to get categories TypeError: Failed to fetch'
      );
    });
  });
});
