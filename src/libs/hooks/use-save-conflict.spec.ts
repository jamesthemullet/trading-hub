import { act, renderHook } from '@testing-library/react';
import { useRouter } from 'next/router';

import { type SaveResult } from './use-optimistic-update';
import { useSaveConflict } from './use-save-conflict';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

type Entity = { version?: number; lastChanged: { date: string; user: string } };
type Payload = { name: string };

const currentEntity: Entity = {
  version: 5,
  lastChanged: { date: '2024-01-01T00:00:00Z', user: 'someone' },
};

const reload = jest.fn();

const setup = (
  save: (
    payload: Payload,
    versionOverride?: number
  ) => Promise<SaveResult<Entity>>,
  onSuccess: () => void = jest.fn()
) => renderHook(() => useSaveConflict<Entity, Payload>({ save, onSuccess }));

describe('useSaveConflict', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ reload });
  });

  it('navigates on a successful save', async () => {
    const onSuccess = jest.fn();
    const save = jest.fn().mockResolvedValue({ status: 'success' });
    const { result } = setup(save, onSuccess);

    await act(async () => {
      await result.current.runSave({ name: 'a' });
    });

    expect(save).toHaveBeenCalledWith({ name: 'a' });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.conflict).toBeNull();
  });

  it('captures the server entity on conflict', async () => {
    const onSuccess = jest.fn();
    const save = jest
      .fn()
      .mockResolvedValue({ status: 'conflict', currentEntity });
    const { result } = setup(save, onSuccess);

    await act(async () => {
      await result.current.runSave({ name: 'a' });
    });

    expect(result.current.conflict?.currentEntity).toEqual(currentEntity);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('does nothing on error', async () => {
    const onSuccess = jest.fn();
    const save = jest.fn().mockResolvedValue({ status: 'error' });
    const { result } = setup(save, onSuccess);

    await act(async () => {
      await result.current.runSave({ name: 'a' });
    });

    expect(result.current.conflict).toBeNull();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('overwrites using the server version and navigates on success', async () => {
    const onSuccess = jest.fn();
    const save = jest
      .fn()
      .mockResolvedValueOnce({ status: 'conflict', currentEntity })
      .mockResolvedValueOnce({ status: 'success' });
    const { result } = setup(save, onSuccess);

    await act(async () => {
      await result.current.runSave({ name: 'a' });
    });
    await act(async () => {
      await result.current.handleOverwrite();
    });

    expect(save).toHaveBeenLastCalledWith({ name: 'a' }, 5);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.conflict).toBeNull();
  });

  it('keeps the modal open and refreshes the entity on a repeat conflict', async () => {
    const onSuccess = jest.fn();
    const newerEntity: Entity = {
      version: 6,
      lastChanged: { date: '2024-01-02T00:00:00Z', user: 'another' },
    };
    const save = jest
      .fn()
      .mockResolvedValueOnce({ status: 'conflict', currentEntity })
      .mockResolvedValueOnce({
        status: 'conflict',
        currentEntity: newerEntity,
      });
    const { result } = setup(save, onSuccess);

    await act(async () => {
      await result.current.runSave({ name: 'a' });
    });
    await act(async () => {
      await result.current.handleOverwrite();
    });

    expect(result.current.conflict?.currentEntity).toEqual(newerEntity);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('keeps the conflict open when the overwrite itself fails', async () => {
    const onSuccess = jest.fn();
    const save = jest
      .fn()
      .mockResolvedValueOnce({ status: 'conflict', currentEntity })
      .mockResolvedValueOnce({ status: 'error' });
    const { result } = setup(save, onSuccess);

    await act(async () => {
      await result.current.runSave({ name: 'a' });
    });
    await act(async () => {
      await result.current.handleOverwrite();
    });

    expect(result.current.conflict?.currentEntity).toEqual(currentEntity);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('reloads the page and clears the conflict on discard', async () => {
    const save = jest
      .fn()
      .mockResolvedValue({ status: 'conflict', currentEntity });
    const { result } = setup(save);

    await act(async () => {
      await result.current.runSave({ name: 'a' });
    });
    act(() => {
      result.current.handleDiscard();
    });

    expect(reload).toHaveBeenCalledTimes(1);
    expect(result.current.conflict).toBeNull();
  });

  it('clears the conflict on close', async () => {
    const save = jest
      .fn()
      .mockResolvedValue({ status: 'conflict', currentEntity });
    const { result } = setup(save);

    await act(async () => {
      await result.current.runSave({ name: 'a' });
    });
    act(() => {
      result.current.closeConflict();
    });

    expect(result.current.conflict).toBeNull();
  });
});
