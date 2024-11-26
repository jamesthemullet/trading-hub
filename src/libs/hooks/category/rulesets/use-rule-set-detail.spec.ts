import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import type { ReturnedCategoryRuleSet } from '@/libs/api';

import { useRuleSetDetail } from './use-rule-set-detail';

const baseUrl = 'http://localhost';
const mockCategoryId = 'abc123';
const mockRuleData: ReturnedCategoryRuleSet = {
  rules: {
    pinnedProducts: [{ id: 'xyz0' }],
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
  categoriesInfo: [{ id: mockCategoryId }],
  isEnabled: true,
  id: 'df70401f-f89d-45ad-92e7-6e152930ff86',
  lastChanged: { date: '2023-12-06T14:24:17Z', user: 'Mark Spencer' },
};

const badResponse = {
  status: 'Bad error',
};

const getRuleSetPreviewMock = jest.fn();

const handlers = [
  http.get(
    `${baseUrl}/search/beta/merchandising/category/ruleset/${mockCategoryId}`,
    () => {
      const { data, status } = getRuleSetPreviewMock();
      return HttpResponse.json(data, status);
    }
  ),
];

const server = setupServer(...handlers);

describe('useRuleSetDetail', () => {
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
    const mockResponse: ReturnedCategoryRuleSet = mockRuleData;
    getRuleSetPreviewMock.mockReturnValueOnce({
      data: mockResponse,
      status: { status: 200 },
    });

    const { result } = renderHook(() => useRuleSetDetail(mockCategoryId));

    const expectedData = {
      ruleSetDetail: mockRuleData,
      error: '',
      isLoading: false,
      refreshRuleset: jest.fn(),
    };

    await waitFor(() => {
      expect(result.current.isLoading).toEqual(expectedData.isLoading);
    });

    expect(result.current.error).toEqual(expectedData.error);
    expect(result.current.ruleSetDetail).toEqual(expectedData.ruleSetDetail);
    expect(typeof result.current.refreshRuleset).toBe('function');
  });

  it('should return an error when the category api call fails', async () => {
    getRuleSetPreviewMock.mockReturnValueOnce({
      data: badResponse,
      status: { status: 500 },
    });

    const { result } = renderHook(() => useRuleSetDetail(mockCategoryId));

    const expectedData = {
      ruleSetDetail: {
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
          includes: {
            alphanumeric: [],
          },
          excludes: {
            alphanumeric: [],
          },
        },
      },
      error: 'Error undefined Bad error',
      isLoading: false,
      refreshRuleset: jest.fn(),
    };

    await waitFor(() => {
      expect(result.current.error).toEqual(expectedData.error);
    });

    expect(result.current.isLoading).toEqual(expectedData.isLoading);
    expect(result.current.ruleSetDetail).toEqual(expectedData.ruleSetDetail);
    expect(typeof result.current.refreshRuleset).toBe('function');
  });

  it('should error when category api fails to fetch', async () => {
    getRuleSetPreviewMock.mockImplementation(() => {
      throw new Error('No data');
    });

    const { result } = renderHook(() => useRuleSetDetail(mockCategoryId));

    await waitFor(() => {
      expect(result.current.error).toEqual('Error No data undefined');
    });
  });

  it('should refresh the ruleset', async () => {
    const mockResponse: ReturnedCategoryRuleSet = mockRuleData;
    getRuleSetPreviewMock.mockReturnValueOnce({
      data: mockResponse,
      status: { status: 200 },
    });

    const { result } = renderHook(() => useRuleSetDetail(mockCategoryId));

    await waitFor(() => {
      expect(result.current.ruleSetDetail).toEqual(mockRuleData);
    });

    getRuleSetPreviewMock.mockReturnValueOnce({
      data: { ...mockRuleData, isEnabled: false },
      status: { status: 200 },
    });

    act(() => {
      result.current.refreshRuleset();
    });

    await waitFor(() => {
      expect(result.current.ruleSetDetail).toEqual(mockRuleData);
    });
  });
});
