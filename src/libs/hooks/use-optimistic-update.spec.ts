import { act, renderHook } from '@testing-library/react';

import { useOptimisticUpdate } from './use-optimistic-update';

type Entity = { id: string; version: number };

const setup = () => renderHook(() => useOptimisticUpdate<Entity>());

describe('useOptimisticUpdate', () => {
  it('calls the beta endpoint when the flag is off', async () => {
    const betaUpdate = jest.fn().mockResolvedValue(undefined);
    const v1Update = jest.fn().mockResolvedValue(undefined);
    const { result } = setup();

    let res;
    await act(async () => {
      res = await result.current.runUpdate({
        shouldUseV1: false,
        version: 3,
        entity: 'ruleset',
        betaUpdate,
        v1Update,
      });
    });

    expect(betaUpdate).toHaveBeenCalled();
    expect(v1Update).not.toHaveBeenCalled();
    expect(res).toEqual({ status: 'success' });
    expect(result.current.error).toBe('');
  });

  it('calls the v1 endpoint with the version when the flag is on', async () => {
    const betaUpdate = jest.fn();
    const v1Update = jest.fn().mockResolvedValue(undefined);
    const { result } = setup();

    let res;
    await act(async () => {
      res = await result.current.runUpdate({
        shouldUseV1: true,
        version: 7,
        entity: 'ruleset',
        betaUpdate,
        v1Update,
      });
    });

    expect(v1Update).toHaveBeenCalledWith(7);
    expect(betaUpdate).not.toHaveBeenCalled();
    expect(res).toEqual({ status: 'success' });
  });

  it('returns an error and does not call the endpoint when the version is missing', async () => {
    const v1Update = jest.fn();
    const { result } = setup();

    let res;
    await act(async () => {
      res = await result.current.runUpdate({
        shouldUseV1: true,
        entity: 'redirect',
        betaUpdate: jest.fn(),
        v1Update,
      });
    });

    expect(v1Update).not.toHaveBeenCalled();
    expect(res).toEqual({ status: 'error' });
    expect(result.current.error).toBe(
      'Missing redirect version for optimistic-locking update'
    );
  });

  it('returns a conflict result on a 409', async () => {
    const currentEntity: Entity = { id: 'x', version: 5 };
    const v1Update = jest
      .fn()
      .mockRejectedValue({ status: 409, error: { currentEntity } });
    const { result } = setup();

    let res;
    await act(async () => {
      res = await result.current.runUpdate({
        shouldUseV1: true,
        version: 3,
        entity: 'ruleset',
        betaUpdate: jest.fn(),
        v1Update,
      });
    });

    expect(res).toEqual({ status: 'conflict', currentEntity });
    expect(result.current.error).toBe('');
  });

  it('sets a message and returns an error on a non-conflict failure', async () => {
    const betaUpdate = jest
      .fn()
      .mockRejectedValue({ error: { message: 'boom', status: 'Bad Request' } });
    const { result } = setup();

    let res;
    await act(async () => {
      res = await result.current.runUpdate({
        shouldUseV1: false,
        entity: 'ruleset',
        betaUpdate,
        v1Update: jest.fn(),
      });
    });

    expect(res).toEqual({ status: 'error' });
    expect(result.current.error).toBe('Error boom Bad Request');
  });
});
