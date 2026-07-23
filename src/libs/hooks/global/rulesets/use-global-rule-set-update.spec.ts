import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { useGlobalRuleSetUpdate } from './use-global-rule-set-update';

const ruleSetId = '38760268-4e84-4bf8-a12e-e151bc18c44e';
const baseUrl = 'http://localhost';

const mockMerchandisingRules = {
  pinnedProducts: [{ id: 'xyz0' }],
  blockedProducts: [],
  boosts: { numeric: [], alphanumeric: [], product: [] },
  buries: { numeric: [], alphanumeric: [], product: [] },
  includes: { alphanumeric: [] },
  excludes: { alphanumeric: [] },
};

const ruleSet = {
  rules: mockMerchandisingRules,
  isEnabled: true,
};

const betaUrl = `${baseUrl}/search/beta/merchandising/global/ruleset/${ruleSetId}`;
const v1Url = `${baseUrl}/search/merchandising/v1/CLOTHING_AND_HOME/global/ruleset/${ruleSetId}`;

const betaHandler = jest.fn();
const v1Handler = jest.fn();

const handlers = [
  http.put(betaUrl, () => {
    const { data, status } = betaHandler();
    return HttpResponse.json(data, status);
  }),
  http.put(v1Url, () => {
    const { data, status } = v1Handler();
    return HttpResponse.json(data, status);
  }),
];

const server = setupServer(...handlers);

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

  it('updates via the beta endpoint by default', async () => {
    betaHandler.mockReturnValueOnce({ data: 'ok', status: { status: 200 } });
    const { result } = renderHook(() => useGlobalRuleSetUpdate());

    let response;
    await act(async () => {
      response = await result.current.saveGlobalRuleset({ ruleSetId, ruleSet });
    });

    expect(response).toEqual({ status: 'success' });
    expect(betaHandler).toHaveBeenCalled();
    expect(v1Handler).not.toHaveBeenCalled();
    expect(result.current.error).toEqual('');
  });

  it('returns an error when the beta update fails', async () => {
    betaHandler.mockReturnValueOnce({
      data: 'not ok',
      status: { status: 500 },
    });
    const { result } = renderHook(() => useGlobalRuleSetUpdate());

    await act(async () => {
      await result.current.saveGlobalRuleset({ ruleSetId, ruleSet });
    });

    expect(result.current.error).toEqual('Error undefined undefined');
  });

  it('updates via the v1 endpoint with the version when shouldUseV1 is set', async () => {
    v1Handler.mockReturnValueOnce({ data: 'ok', status: { status: 200 } });
    const { result } = renderHook(() => useGlobalRuleSetUpdate());

    let response;
    await act(async () => {
      response = await result.current.saveGlobalRuleset({
        ruleSetId,
        ruleSet,
        version: 3,
        shouldUseV1: true,
      });
    });

    expect(response).toEqual({ status: 'success' });
    expect(v1Handler).toHaveBeenCalled();
    expect(betaHandler).not.toHaveBeenCalled();
    expect(result.current.error).toEqual('');
  });

  it('returns an error without making a request when a v1 update has no version', async () => {
    const { result } = renderHook(() => useGlobalRuleSetUpdate());

    let response: unknown;
    await act(async () => {
      response = await result.current.saveGlobalRuleset({
        ruleSetId,
        ruleSet,
        shouldUseV1: true,
      });
    });

    expect(response).toEqual({
      status: 'error',
      error: expect.objectContaining({
        message: 'Missing ruleset version for optimistic-locking update',
      }),
    });
    expect(v1Handler).not.toHaveBeenCalled();
    expect(betaHandler).not.toHaveBeenCalled();
    expect(result.current.error).toEqual('Unknown error');
  });

  it('returns a conflict result on a 409 from the v1 endpoint', async () => {
    const currentEntity = {
      id: ruleSetId,
      version: 5,
      isEnabled: true,
      rules: mockMerchandisingRules,
      lastChanged: { date: '2024-01-01T00:00:00Z', user: 'someone else' },
    };
    v1Handler.mockReturnValueOnce({
      data: {
        status: 'Conflict',
        message: 'Version conflict',
        currentEntity,
      },
      status: { status: 409 },
    });
    const { result } = renderHook(() => useGlobalRuleSetUpdate());

    let response;
    await act(async () => {
      response = await result.current.saveGlobalRuleset({
        ruleSetId,
        ruleSet,
        version: 3,
        shouldUseV1: true,
      });
    });

    expect(response).toEqual({ status: 'conflict', currentEntity });
    expect(result.current.error).toEqual('');
  });

  it('returns an error on a non-conflict failure from the v1 endpoint', async () => {
    v1Handler.mockReturnValueOnce({
      data: 'not ok',
      status: { status: 500 },
    });
    const { result } = renderHook(() => useGlobalRuleSetUpdate());

    let response;
    await act(async () => {
      response = await result.current.saveGlobalRuleset({
        ruleSetId,
        ruleSet,
        version: 3,
        shouldUseV1: true,
      });
    });

    expect(response).toEqual({ status: 'error', error: expect.anything() });
    expect(result.current.error).toEqual('Error undefined undefined');
  });
});
