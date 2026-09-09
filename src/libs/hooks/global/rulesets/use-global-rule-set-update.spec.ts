import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { mockMerchandisingRules } from '@/test/data/mock-merchandising-rules';

import { useGlobalRuleSetUpdate } from './use-global-rule-set-update';

const baseUrl = 'http://localhost';
const ruleSetId = '38760268-4e84-4bf8-a12e-e151bc18c44e';

const v1Handler = jest.fn();
const cftoHandler = jest.fn();

const handlers = [
  http.put(
    `${baseUrl}/search/merchandising/v1/CLOTHING_AND_HOME/global/ruleset/${ruleSetId}`,
    async ({ request }) => {
      v1Handler(await request.json());
      return HttpResponse.json({}, { status: 200 });
    }
  ),
  http.put(
    `${baseUrl}/search/merchandising/v1/CFTO/global/ruleset/${ruleSetId}`,
    async ({ request }) => {
      cftoHandler(await request.json());
      return HttpResponse.json({}, { status: 200 });
    }
  ),
];

const server = setupServer(...handlers);

const ruleSet = { rules: mockMerchandisingRules, isEnabled: true };

describe('useGlobalRuleSetUpdate', () => {
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
    const { result } = renderHook(() => useGlobalRuleSetUpdate());

    let res;
    await act(async () => {
      res = await result.current.saveGlobalRuleset({
        ruleSetId,
        ruleSet,
        version: 5,
        catalogue: 'CLOTHING_AND_HOME',
      });
    });

    expect(res).toEqual({ status: 'success' });
    expect(v1Handler).toHaveBeenCalledWith(
      expect.objectContaining({ version: 5 })
    );
  });

  it('updates via the CFTO catalogue endpoint when catalogue is CFTO', async () => {
    const { result } = renderHook(() => useGlobalRuleSetUpdate());

    let res;
    await act(async () => {
      res = await result.current.saveGlobalRuleset({
        ruleSetId,
        ruleSet,
        version: 5,
        catalogue: 'CFTO',
      });
    });

    expect(res).toEqual({ status: 'success' });
    expect(cftoHandler).toHaveBeenCalledWith(
      expect.objectContaining({ version: 5 })
    );
  });
});
