import { act, renderHook } from '@testing-library/react';

import { useOptimisticUpdate } from './use-optimistic-update';

type Entity = { id: string; version: number };

const setup = () => renderHook(() => useOptimisticUpdate<Entity>());

describe('useOptimisticUpdate', () => {
  it('calls the update with the version and returns success', async () => {
    const update = jest.fn().mockResolvedValue(undefined);
    const { result } = setup();

    let res;
    await act(async () => {
      res = await result.current.runUpdate({
        version: 7,
        entity: 'ruleset',
        update,
      });
    });

    expect(update).toHaveBeenCalledWith(7);
    expect(res).toEqual({ status: 'success' });
    expect(result.current.error).toBe('');
  });

  it('returns an error and does not call the update when the version is missing', async () => {
    const update = jest.fn();
    const { result } = setup();

    let res;
    await act(async () => {
      res = await result.current.runUpdate({
        entity: 'redirect',
        update,
      });
    });

    expect(update).not.toHaveBeenCalled();
    expect(res).toEqual({ status: 'error' });
    expect(result.current.error).toBe(
      'This redirect could not be saved because it may be out of date. Refresh the page and try again.'
    );
  });

  it('returns a conflict result on a 409', async () => {
    const currentEntity: Entity = { id: 'x', version: 5 };
    const update = jest
      .fn()
      .mockRejectedValue({ status: 409, error: { currentEntity } });
    const { result } = setup();

    let res;
    await act(async () => {
      res = await result.current.runUpdate({
        version: 3,
        entity: 'ruleset',
        update,
      });
    });

    expect(res).toEqual({ status: 'conflict', currentEntity });
    expect(result.current.error).toBe('');
  });

  it('sets a message and returns an error on a non-conflict failure', async () => {
    const update = jest
      .fn()
      .mockRejectedValue({ error: { message: 'boom', status: 'Bad Request' } });
    const { result } = setup();

    let res;
    await act(async () => {
      res = await result.current.runUpdate({
        version: 3,
        entity: 'ruleset',
        update,
      });
    });

    expect(res).toEqual({ status: 'error' });
    expect(result.current.error).toBe('Error boom Bad Request');
  });
});
