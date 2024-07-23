import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import type { ReturnedRuleSet } from '@/libs/api';

import { useRuleSetPreview } from './use-rule-set-preview';

const baseUrl = 'http://localhost';
const mockCategoryId = 'abc123';
const mockFacetId = '123';
const mockRuleData: ReturnedRuleSet = {
  rules: {
    pinnedProducts: [{ id: 'xyz0' }],
    blockedProducts: [],
    boosts: { numeric: [], alphanumeric: [], product: [] },
    buries: { numeric: [], alphanumeric: [], product: [] },
  },
  categoryId: mockCategoryId,
  categoriesInfo: [{ id: mockCategoryId }],
  isEnabled: true,
  categoryName: 'Dresses',
  id: 'df70401f-f89d-45ad-92e7-6e152930ff86',
  lastChanged: { date: '2023-12-06T14:24:17Z', user: 'Mark Spencer' },
};

const badResponse = {
  status: 'Bad error',
};

const getRuleSetPreviewMock = jest.fn();
const getFacetMock = jest.fn();

const handlers = [
  http.get(`${baseUrl}/search/beta/merchandising/facet/${mockFacetId}`, () => {
    const { data, status } = getFacetMock();
    return HttpResponse.json(data, status);
  }),
  http.get(`${baseUrl}/merchandising/ruleset/${mockCategoryId}`, () => {
    const { data, status } = getRuleSetPreviewMock();
    return HttpResponse.json(data, status);
  }),
];

const server = setupServer(...handlers);

describe('useRuleSet', () => {
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
    const mockResponse: ReturnedRuleSet = mockRuleData;
    getRuleSetPreviewMock.mockReturnValueOnce({
      data: mockResponse,
      status: { status: 200 },
    });

    const { result } = renderHook(() => useRuleSetPreview(mockCategoryId));

    const expectedData = {
      ruleSetDetail: mockRuleData,
      error: '',
      isLoading: false,
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
      ruleSetDetail: {
        categoryId: '',
        categoryName: '',
        categoriesInfo: [
          {
            id: '',
          },
        ],
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
        },
      },
      error: 'POST status 500',
      isLoading: false,
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
      expect(result.current.error).toEqual('POST status 500');
    });
  });
});
