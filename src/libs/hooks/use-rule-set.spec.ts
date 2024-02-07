import { act } from 'react-dom/test-utils';
import { renderHook, waitFor } from '@testing-library/react';

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { useRuleSet } from './use-rule-set';
import type { RuleSets } from '../api';

const baseUrl = 'http://localhost';
const getRuleSetMock = jest.fn();

const handlers = [
  http.get(`${baseUrl}/merchandising/ruleset`, () => {
    const { data, status, error } = getRuleSetMock();
    if (error) {
      return HttpResponse.error();
    }
    return HttpResponse.json(data, status);
  }),
];

const server = setupServer(...handlers);

describe.skip('useRuleSet', () => {
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
    const mockResponse: RuleSets = {
      ruleSets: [],
      pagination: {
        totalItems: 10,
      },
    };
    getRuleSetMock.mockReturnValueOnce({
      data: mockResponse,
      status: { status: 200 },
    });

    const { result } = renderHook(() => useRuleSet('', 0, 50));

    await waitFor(() => {
      expect(result.current.pagination.totalItems).toEqual(10);
    });
  });

  it('should refetch data', async () => {
    const mockResponse: RuleSets = {
      ruleSets: [],
      pagination: {
        totalItems: 10,
      },
    };
    getRuleSetMock.mockReturnValueOnce({
      data: mockResponse,
      status: { status: 200 },
    });

    mockResponse.pagination.totalItems = 11;
    getRuleSetMock.mockReturnValueOnce({
      data: mockResponse,
      status: { status: 200 },
    });

    const { result } = renderHook(() => useRuleSet('', 0, 50));

    act(() => {
      result.current.refetchRuleSetList();
    });

    await waitFor(() => {
      expect(result.current.pagination.totalItems).toEqual(11);
    });
  });
});
