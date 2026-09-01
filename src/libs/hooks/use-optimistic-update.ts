import { useCallback, useState } from 'react';

import { isConflictError } from '@/libs/hooks/utils/conflict';
import { handleError } from '@/libs/hooks/utils/error';

export type SaveResult<T> =
  | { status: 'success' }
  | { status: 'conflict'; currentEntity: T }
  | { status: 'error' };

type RunUpdateArgs = {
  shouldUseV1: boolean;
  version?: number;
  entity: string;
  betaUpdate: () => Promise<unknown>;
  v1Update: (version: number) => Promise<unknown>;
};

/**
 * Runs an entity update with optional optimistic locking. When the flag is off
 * it calls the beta endpoint; when on it sends the loaded version to the v1
 * endpoint and turns a 409 into a `conflict` result. Shared by every
 * merchandising update hook so the branching lives in one place.
 */
export const useOptimisticUpdate = <T>(): {
  error: string;
  isSaving: boolean;
  runUpdate: (args: RunUpdateArgs) => Promise<SaveResult<T>>;
} => {
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const runUpdate = useCallback(
    async ({
      shouldUseV1,
      version,
      entity,
      betaUpdate,
      v1Update,
    }: RunUpdateArgs): Promise<SaveResult<T>> => {
      setError('');
      setIsSaving(true);

      try {
        if (shouldUseV1) {
          if (version == null) {
            const missingVersionError = new Error(
              `Missing ${entity} version for optimistic-locking update`
            );
            handleError(missingVersionError);
            setError(missingVersionError.message);
            return { status: 'error' };
          }
          await v1Update(version);
        } else {
          await betaUpdate();
        }
        return { status: 'success' };
      } catch (err) {
        if (isConflictError<T>(err)) {
          return { status: 'conflict', currentEntity: err.error.currentEntity };
        }
        setError(handleError(err));
        return { status: 'error' };
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  return { error, isSaving, runUpdate };
};
