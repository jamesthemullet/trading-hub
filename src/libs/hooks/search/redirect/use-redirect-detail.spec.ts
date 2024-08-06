import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { ReturnedKeywordRedirect } from '@/libs/api';
import { returnedRedirectMock } from '@/pages/api/merchandising/mocks';

import { useRedirectDetail } from './use-redirect-detail';

const baseUrl = 'http://localhost';
const mockRedirectId = 'abc123';

const badResponse = {
  status: 'Bad error',
};

const getRedirectMock = jest.fn();

const handlers = [
  http.get(
    `${baseUrl}/search/beta/merchandising/keyword/redirect/${mockRedirectId}`,
    () => {
      const { data, status } = getRedirectMock();
      return HttpResponse.json(data, status);
    }
  ),
];

const server = setupServer(...handlers);

describe('useRedirectDetail', () => {
  beforeAll(() => {
    process.env.MERCHANDISING_PROXY_BASE_URL = baseUrl;
    server.listen();

    // suppress deliberate hook errors from tests
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
    getRedirectMock.mockReturnValueOnce({
      data: returnedRedirectMock,
      status: { status: 200 },
    });

    const { result } = renderHook(() => useRedirectDetail(mockRedirectId));

    const expectedData = {
      redirect: returnedRedirectMock,
      error: '',
      isLoading: false,
    };

    await waitFor(() => {
      expect(result).toEqual({ current: expectedData });
    });
  });

  it('should return an error when the api call fails', async () => {
    getRedirectMock.mockReturnValueOnce({
      data: badResponse,
      status: { status: 500 },
    });

    const { result } = renderHook(() => useRedirectDetail(mockRedirectId));

    const redirect: ReturnedKeywordRedirect = {
      destinationUrl: '',
      type: 'redirectTerm',
      keywords: [],
      id: 'abc123',
      lastChanged: {
        date: '',
        user: '',
      },
      isEnabled: false,
    };

    const expectedData = {
      redirect,
      error: 'POST status 500',
      isLoading: false,
    };

    await waitFor(() => {
      expect(result).toEqual({ current: expectedData });
    });
  });

  it('should error when api fails to fetch', async () => {
    getRedirectMock.mockImplementation(() => {
      throw new Error('No data');
    });

    const { result } = renderHook(() => useRedirectDetail(mockRedirectId));

    await waitFor(() => {
      expect(result.current.error).toEqual('POST status 500');
    });
  });
});
