import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import type { MerchandisingCountryCode } from '@/libs/api';

import { useGlobalRuleSetCreate } from './use-global-rule-set-create';

const getRuleSetCreateMock = jest.fn();

const baseUrl = 'http://localhost';
const handlers = [
  http.post(`${baseUrl}/search/beta/merchandising/global/ruleset`, () => {
    const { data, status } = getRuleSetCreateMock();
    return HttpResponse.json(data, status);
  }),
];

const mockProps = {
  rules: {
    pinnedProducts: [],
    boosts: { alphanumeric: [], numeric: [], product: [] },
    buries: { alphanumeric: [], numeric: [], product: [] },
    blockedProducts: [],
    includes: {},
    excludes: {},
  },
  isEnabled: false,
  startDate: '',
  endDate: '',
  countryCode: 'UK_IE' as MerchandisingCountryCode,
};

const server = setupServer(...handlers);

describe('useGlobalRuleSetCreate', () => {
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

  it('should create a new ruleset', async () => {
    const mockResponse = { id: 'foo' };
    getRuleSetCreateMock.mockReturnValueOnce({
      data: mockResponse,
      status: { status: 200 },
    });
    const {
      result: { current },
    } = renderHook(() => useGlobalRuleSetCreate());
    const resp = await current.createGlobalRuleSet(mockProps);

    expect(resp).toEqual(mockResponse);
  });

  it('should return errors', async () => {
    getRuleSetCreateMock.mockReturnValueOnce({
      data: { message: 'Validation Issues', status: 'Bad Request' },
      status: { status: 500 },
    });
    const { result } = renderHook(() => useGlobalRuleSetCreate());

    await act(async () => {
      await result.current.createGlobalRuleSet(mockProps);
    });

    expect(result.current.error).toBe('Error Validation Issues Bad Request');
  });
});
