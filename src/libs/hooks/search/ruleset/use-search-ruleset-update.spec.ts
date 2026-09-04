import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { mockMerchandisingRules } from '@/test/data/mock-merchandising-rules';

import { useSearchRuleSetUpdate } from './use-search-ruleset-update';

const baseUrl = 'http://localhost';
const ruleSetId = 'qfwq2r-32f23-23ewfw-233r3';

const v1Handler = jest.fn();

const handlers = [
  http.put(
    `${baseUrl}/search/merchandising/v1/CLOTHING_AND_HOME/keyword/ruleset/${ruleSetId}`,
    async ({ request }) => {
      v1Handler(await request.json());
      return HttpResponse.json({}, { status: 200 });
    }
  ),
];

const server = setupServer(...handlers);

const args = {
  searchTerms: ['boots'],
  ruleSetId,
  isEnabled: true,
  facets: [],
  rules: mockMerchandisingRules,
};

describe('useSearchRuleSetUpdate', () => {
  beforeAll(() => {
    process.env.MERCHANDISING_PROXY_BASE_URL = baseUrl;
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
  });

  afterAll(() => {
    server.close();
    delete process.env.MERCHANDISING_PROXY_BASE_URL;
  });

  it('updates via the v1 endpoint with the version', async () => {
    const { result } = renderHook(() => useSearchRuleSetUpdate());

    let res;
    await act(async () => {
      res = await result.current.updateRuleSet({
        ...args,
        version: 4,
      });
    });

    expect(res).toEqual({ status: 'success' });
    expect(v1Handler).toHaveBeenCalledWith(
      expect.objectContaining({ version: 4, searchTerms: ['boots'] })
    );
  });
});
