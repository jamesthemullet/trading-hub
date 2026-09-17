import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { useFacetHistory } from './use-facet-history';

const baseUrl = 'http://localhost';
const mockFacetId = 'facet-abc123';

const mockHistoryData = {
  pagination: { totalItems: 1 },
  changes: [
    {
      id: 'change1',
      change: {
        id: mockFacetId,
        indexPropertyName: 'colour',
        displayValue: 'Colour',
        merged: [],
        excludedValues: [],
        boosted: [],
        type: 'root',
        lastChanged: { date: '2023-12-06T14:24:17Z', user: 'Mark Spencer' },
      },
    },
  ],
};

const badResponse = { status: 'Bad error' };

const getHistoryMock = jest.fn();

const handlers = [
  http.get(
    `${baseUrl}/search/beta/merchandising/facet/${mockFacetId}/history`,
    ({ request }) => {
      const { data, status } = getHistoryMock(request);
      return HttpResponse.json(data, status);
    }
  ),
];

const server = setupServer(...handlers);

describe('useFacetHistory', () => {
  beforeAll(() => {
    process.env.MERCHANDISING_PROXY_BASE_URL = baseUrl;
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
    getHistoryMock.mockReset();
  });

  afterAll(() => {
    server.close();
    delete process.env.MERCHANDISING_PROXY_BASE_URL;
  });

  it('should fetch facet history', async () => {
    getHistoryMock.mockReturnValueOnce({
      data: mockHistoryData,
      status: { status: 200 },
    });

    const { result } = renderHook(() => useFacetHistory(mockFacetId, 2, 20));

    await waitFor(() => {
      expect(result.current.isLoading).toEqual(false);
    });

    expect(result.current.error).toEqual('');
    expect(result.current.history).toEqual(mockHistoryData);

    const request = getHistoryMock.mock.calls[0][0] as Request;
    const url = new URL(request.url);
    expect(url.searchParams.get('start')).toEqual('20');
    expect(url.searchParams.get('rows')).toEqual('20');
  });

  it('should return an error when the history api call fails', async () => {
    getHistoryMock.mockReturnValueOnce({
      data: badResponse,
      status: { status: 500 },
    });

    const { result } = renderHook(() => useFacetHistory(mockFacetId, 1, 10));

    await waitFor(() => {
      expect(result.current.error).toEqual('Error undefined Bad error');
    });

    expect(result.current.isLoading).toEqual(false);
    expect(result.current.history).toEqual({
      changes: [],
      pagination: { totalItems: 0 },
    });
  });

  it('should error when history api fails to fetch', async () => {
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
    server.use(
      http.get(
        `${baseUrl}/search/beta/merchandising/facet/${mockFacetId}/history`,
        () => HttpResponse.error()
      )
    );

    const { result } = renderHook(() => useFacetHistory(mockFacetId, 1, 10));

    await waitFor(() => {
      expect(result.current.error).not.toBe('');
    });
  });

  it('should not make API calls when id is empty', async () => {
    const { result } = renderHook(() => useFacetHistory('', 1, 10));

    expect(result.current).toEqual({
      history: { changes: [], pagination: { totalItems: 0 } },
      error: '',
      isLoading: false,
    });

    expect(getHistoryMock).not.toHaveBeenCalled();
  });
});
