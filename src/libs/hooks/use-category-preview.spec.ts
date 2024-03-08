import { act, renderHook, waitFor } from '@testing-library/react';

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { useCategoryPreview } from './use-category-preview';

const baseUrl = 'http://localhost';
const mockCategoryId = 'abc123';

const mockMerchandisingRules = {
  pinnedProducts: [],
  boosts: { numeric: [], alphaNumeric: [], product: [] },
  buries: { numeric: [], alphaNumeric: [], product: [] },
  blockedProducts: [],
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
    getRuleSetPreviewMock.mockReturnValueOnce({
      data: mockSearchData,
      status: { status: 200 },
    });

    const { result } = renderHook(() =>
      useCategoryPreview(mockCategoryId, mockMerchandisingRules)
    );

    const expectedData = {
      categoryPreview: [
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
      error: '',
    };

    await waitFor(() => {
      expect(result.current.categoryPreview).toMatchObject(
        expectedData.categoryPreview
      );
    });
  });

  it('should return an error when the api call fails', async () => {
    getRuleSetPreviewMock.mockReturnValueOnce({
      data: badResponse,
      status: { status: 500 },
    });

    const { result } = renderHook(() =>
      useCategoryPreview(mockCategoryId, mockMerchandisingRules)
    );

    const expectedData = {
      categoryPreview: [],
      error: 'POST status 500',
    };

    await waitFor(() => {
      expect(result.current.error).toEqual(expectedData.error);
    });
  });

  it('should refetch data', async () => {
    getRuleSetPreviewMock.mockReturnValueOnce({
      data: mockSearchData,
      status: { status: 200 },
    });

    const newMocks = { ...mockSearchData };
    newMocks.products.push(mockSearchData.products[0]);

    const { result } = renderHook(() =>
      useCategoryPreview(mockCategoryId, mockMerchandisingRules)
    );

    getRuleSetPreviewMock.mockReturnValueOnce({
      data: newMocks,
      status: { status: 200 },
    });

    act(() => {
      result.current.refetchRuleSetPreview();
    });

    await waitFor(() => {
      expect(result.current.categoryPreview.length).toEqual(2);
    });
  });
});
