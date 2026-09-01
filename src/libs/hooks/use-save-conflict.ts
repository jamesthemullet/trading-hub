import { useCallback, useState } from 'react';
import { useRouter } from 'next/router';

import type { SaveResult } from '@/libs/hooks/use-optimistic-update';

export const useSaveConflict = <T extends { version?: number }, P>({
  save,
  onSuccess,
}: {
  save: (payload: P, versionOverride?: number) => Promise<SaveResult<T>>;
  onSuccess: () => void | Promise<unknown>;
}): {
  conflict: { currentEntity: T; payload: P } | null;
  isOverwriting: boolean;
  runSave: (payload: P) => Promise<void>;
  handleOverwrite: () => Promise<void>;
  handleDiscard: () => void;
  closeConflict: () => void;
} => {
  const router = useRouter();
  const [conflict, setConflict] = useState<{
    currentEntity: T;
    payload: P;
  } | null>(null);
  const [isOverwriting, setIsOverwriting] = useState(false);

  const runSave = useCallback(
    async (payload: P) => {
      const result = await save(payload);

      if (result.status === 'success') {
        await onSuccess();
      } else if (result.status === 'conflict') {
        setConflict({ currentEntity: result.currentEntity, payload });
      }
    },
    [save, onSuccess]
  );

  const handleOverwrite = useCallback(async () => {
    // istanbul ignore if
    if (!conflict) return;

    setIsOverwriting(true);
    const result = await save(conflict.payload, conflict.currentEntity.version);
    setIsOverwriting(false);

    if (result.status === 'success') {
      setConflict(null);
      await onSuccess();
    } else if (result.status === 'conflict') {
      setConflict({
        currentEntity: result.currentEntity,
        payload: conflict.payload,
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
