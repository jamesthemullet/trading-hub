import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { useGlobalRuleSetDelete } from './use-global-rule-set-delete';

const ruleSetId = '38760268-4e84-4bf8-a12e-e151bc18c44e';
const baseUrl = 'http://localhost';
const deleteRuleSetMock = jest.fn();

const ruleSetUrl = `${baseUrl}/search/beta/merchandising/global/ruleset/${ruleSetId}`;
const handlers = [
  http.delete(ruleSetUrl, () => {
    const { data, status } = deleteRuleSetMock();
    return HttpResponse.json(data, status);
  }),
];

const server = setupServer(...handlers);

describe('useGlobalRuleSetDelete', () => {
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

  it('should delete a ruleset', async () => {
    deleteRuleSetMock.mockReturnValueOnce({
      data: 'ok',
      status: { status: 200 },
    });
    const { result } = renderHook(() => useGlobalRuleSetDelete());

    await act(async () => {
      await result.current.handleDelete({ rulesetId: ruleSetId });
    });

    expect(deleteRuleSetMock).toHaveBeenCalled();
    expect(result.current.error).toEqual('');
  });

  it('should return errors', async () => {
    deleteRuleSetMock.mockReturnValueOnce({
      data: 'not ok',
      status: { status: 500 },
    });
    const { result } = renderHook(() => useGlobalRuleSetDelete());

    await act(async () => {
      await result.current.handleDelete({ rulesetId: ruleSetId });
    });

    expect(deleteRuleSetMock).toHaveBeenCalled();
    expect(result.current.error).toEqual(`Error undefined undefined`);
  });
});
