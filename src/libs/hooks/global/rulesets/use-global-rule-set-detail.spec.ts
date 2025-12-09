import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import type { MerchandisingReturnedGlobalRuleSet } from '@/libs/api';

import { useGlobalRuleSetDetail } from './use-global-rule-set-detail';

const baseUrl = 'http://localhost';
const mockCategoryId = 'abc123';
const mockRuleData: MerchandisingReturnedGlobalRuleSet = {
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
    `${baseUrl}/search/beta/merchandising/global/ruleset/${mockCategoryId}`,
    () => {
      const { data, status } = getRuleSetPreviewMock();
      return HttpResponse.json(data, status);
    }
  ),
];

const server = setupServer(...handlers);

describe('useGlobalRuleSetDetail', () => {
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
    const mockResponse: MerchandisingReturnedGlobalRuleSet = mockRuleData;
    getRuleSetPreviewMock.mockReturnValueOnce({
      data: mockResponse,
      status: { status: 200 },
    });

    const { result } = renderHook(() => useGlobalRuleSetDetail(mockCategoryId));

    const expectedData = {
      globalRuleSet: mockRuleData,
      error: '',
      isLoading: false,
    };

    await waitFor(() => {
      expect(result).toEqual({ current: expectedData });
    });
  });

  it('should return an error when the api call fails', async () => {
    getRuleSetPreviewMock.mockReturnValueOnce({
      data: badResponse,
      status: { status: 500 },
    });

    const { result } = renderHook(() => useGlobalRuleSetDetail(mockCategoryId));

    const expectedData = {
      globalRuleSet: {
        id: '',
        isEnabled: false,
        lastChanged: {
          date: '',
          user: '',
        },
        facets: [],
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
    };

    await waitFor(() => {
      expect(result).toEqual({ current: expectedData });
    });
  });

  it('should not make API calls when id is empty', async () => {
    const { result } = renderHook(() => useGlobalRuleSetDetail(''));

    const expectedData = {
      globalRuleSet: {
        id: '',
        isEnabled: false,
        lastChanged: {
          date: '',
          user: '',
        },
        facets: [],
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
      error: '',
      isLoading: false,
    };

    expect(result.current).toEqual(expectedData);

    expect(getRuleSetPreviewMock).not.toHaveBeenCalled();
  });
});
