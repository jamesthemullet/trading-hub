import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { facetsListMock } from '@/pages/api/search/mocks';

import { useFacetsList } from './use-facets-list';

const baseUrl = 'http://localhost';

const badResponse = {
  status: 'Internal Server Error',
};

const getRuleSetPreviewMock = jest.fn();

const handlers = [
  http.get(`${baseUrl}/search/beta/merchandising/facet`, () => {
    const { data, status } = getRuleSetPreviewMock();
    return HttpResponse.json(data, status);
  }),
];

const requestSpy = jest.fn();

const server = setupServer(...handlers);

describe('useFacetsList', () => {
  beforeAll(() => {
    process.env.MERCHANDISING_PROXY_BASE_URL = baseUrl;
    server.listen();

    const logSpy = jest.spyOn(console, 'log');
    logSpy.mockImplementation(jest.fn());
  });

  beforeEach(() => {
    server.events.on('request:start', requestSpy);
    getRuleSetPreviewMock.mockReturnValue({
      data: facetsListMock,
      status: { status: 200 },
    });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
    delete process.env.MERCHANDISING_PROXY_BASE_URL;
  });

  it('should render the hook', async () => {
    const { result } = renderHook(() =>
      useFacetsList({
        categoryIds: [],
        enabled: true,
        countryCode: 'UK',
      })
    );

    await waitFor(() => {
      expect(result.current.facets.length).toEqual(0);
    });

    expect(result.current.isLoading).toBeFalsy();
  });

  it('should render the hook with error', async () => {
    getRuleSetPreviewMock.mockReturnValueOnce({
      data: badResponse,
      status: { status: 500 },
    });

    const { result } = renderHook(() =>
      useFacetsList({
        categoryIds: ['123'],
        enabled: true,
        countryCode: 'UK',
      })
    );

    await waitFor(() => {
      expect(result.current.error).toEqual(
        'Error undefined Internal Server Error'
      );
    });
  });

  it('should render the hook with category id', async () => {
    const { result } = renderHook(() =>
      useFacetsList({
        categoryIds: ['12345'],
        enabled: true,
        countryCode: 'UK',
      })
    );

    await waitFor(() => {
      expect(result.current.facets.length).toEqual(5);
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({
          method: 'GET',
          url: 'http://localhost/search/beta/merchandising/facet?catalogue=MANDSUK&categoryId=12345',
        }),
      })
    );
  });

  it('should do a request with IE param', async () => {
    const { result } = renderHook(
      () =>
        useFacetsList({
          categoryIds: ['IE_12345'],
          enabled: true,
          countryCode: 'IE',
        }),
      {}
    );

    await waitFor(() => {
      expect(result.current.facets.length).toEqual(5);
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({
          method: 'GET',
          url: 'http://localhost/search/beta/merchandising/facet?catalogue=MANDSIE&categoryId=IE_12345',
        }),
      })
    );
  });

  it('should do 2 requests with UK_IE param', async () => {
    const { result } = renderHook(() =>
      useFacetsList({
        categoryIds: ['12345', 'IE_12345'],
        enabled: true,
        countryCode: 'UK_IE',
      })
    );

    await waitFor(() => {
      expect(result.current.error).toEqual('');
    });
    await waitFor(() => {
      expect(result.current.facets.length).toEqual(5);
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({
          method: 'GET',
          url: 'http://localhost/search/beta/merchandising/facet?catalogue=MANDSUK&categoryId=12345',
        }),
      })
    );
    expect(requestSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({
          method: 'GET',
          url: 'http://localhost/search/beta/merchandising/facet?catalogue=MANDSIE&categoryId=12345',
        }),
      })
    );
    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({
          method: 'GET',
          url: 'http://localhost/search/beta/merchandising/facet?catalogue=MANDSIE&categoryId=IE_12345',
        }),
      })
    );
    expect(requestSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({
          method: 'GET',
          url: 'http://localhost/search/beta/merchandising/facet?catalogue=MANDSUK&categoryId=IE_12345',
        }),
      })
    );
  });

  it('should not call the hook when disabled', async () => {
    const { result } = renderHook(() =>
      useFacetsList({
        categoryIds: [],
        enabled: false,
        countryCode: 'UK',
      })
    );

    await waitFor(() => {
      expect(result.current.facets.length).toEqual(0);
    });

    expect(result.current.isLoading).toBeFalsy();
  });
});
