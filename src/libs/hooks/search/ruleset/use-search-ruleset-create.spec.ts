import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { mockMerchandisingRules } from '@/test/data/mock-merchandising-rules';

import { useSearchRuleSetCreate } from './use-search-ruleset-create';

const getRuleSetCreateMock = jest.fn();

const baseUrl = 'http://localhost';

const handlers = [
  http.post(`${baseUrl}/search/beta/merchandising/keyword/ruleset`, () => {
    const { data, status } = getRuleSetCreateMock();
    return HttpResponse.json(data, status);
  }),
];

const server = setupServer(...handlers);
const mockSearchTerms = ['socks'];

describe('useSearchRuleSetCreate', () => {
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
    } = renderHook(() => useSearchRuleSetCreate());
    const resp = await current.createRuleset({
      searchTerms: mockSearchTerms,
      rules: mockMerchandisingRules,
      facets: [],
      excludedFacets: { facets: [] },
      countryCode: 'UK_IE',
      isEnabled: true,
    });

    expect(resp).toEqual(mockResponse);
  });

  it('should return errors', async () => {
    getRuleSetCreateMock.mockReturnValueOnce({
      data: { message: 'Failed to create', status: 'Bad Request' },
      status: { status: 500 },
    });
    const { result } = renderHook(() => useSearchRuleSetCreate());

    await act(async () => {
      await result.current.createRuleset({
        searchTerms: mockSearchTerms,
        rules: mockMerchandisingRules,
        facets: [],
        excludedFacets: { facets: [] },
        countryCode: 'UK_IE',
        isEnabled: true,
      });
    });

    expect(result.current.error).toBe('Error Failed to create Bad Request');
  });
});
