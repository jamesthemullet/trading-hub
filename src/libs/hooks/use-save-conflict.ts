import { useCallback, useState } from 'react';
import { useRouter } from 'next/router';

import type { SaveResult } from '@/libs/hooks/use-optimistic-update';

export type SaveSuccessHandler = () => void | Promise<unknown>;

export type RunSaveOptions = {
  onSuccess: SaveSuccessHandler;
};

type Conflict<TEntity, TPayload> = {
  currentEntity: TEntity;
  payload: TPayload;
  onSuccess?: SaveSuccessHandler;
};

export const useSaveConflict = <
  TEntity extends { version?: number },
  TPayload,
>({
  save,
  onSuccess,
}: {
  save: (
    payload: TPayload,
    versionOverride?: number
  ) => Promise<SaveResult<TEntity>>;
  onSuccess: SaveSuccessHandler;
}): {
  conflict: Conflict<TEntity, TPayload> | null;
  isOverwriting: boolean;
  runSave: (payload: TPayload, options?: RunSaveOptions) => Promise<void>;
  handleOverwrite: () => Promise<void>;
  handleDiscard: () => void;
  closeConflict: () => void;
} => {
  const router = useRouter();
  const [conflict, setConflict] = useState<Conflict<TEntity, TPayload> | null>(
    null
  );
  const [isOverwriting, setIsOverwriting] = useState(false);

  const runSave = useCallback(
    async (payload: TPayload, options?: RunSaveOptions) => {
      const result = await save(payload);

      if (result.status === 'success') {
        await (options?.onSuccess ?? onSuccess)();
      } else if (result.status === 'conflict') {
        setConflict({
          currentEntity: result.currentEntity,
          payload,
          onSuccess: options?.onSuccess,
        });
      }
    },
    [save, onSuccess]
  );

  const handleOverwrite = useCallback(async () => {
    if (!conflict) return;

    setIsOverwriting(true);
    const result = await save(conflict.payload, conflict.currentEntity.version);
    setIsOverwriting(false);

    if (result.status === 'success') {
      setConflict(null);
      await (conflict.onSuccess ?? onSuccess)();
    } else if (result.status === 'conflict') {
      setConflict({
        currentEntity: result.currentEntity,
        payload: conflict.payload,
        onSuccess: conflict.onSuccess,
      });
    }
  }, [conflict, save, onSuccess]);

  const handleDiscard = useCallback(() => {
    setConflict(null);
    router.reload();
  }, [router]);

  const closeConflict = useCallback(() => setConflict(null), []);

  return {
    conflict,
    isOverwriting,
    runSave,
    handleOverwrite,
    handleDiscard,
    closeConflict,
  };
};
