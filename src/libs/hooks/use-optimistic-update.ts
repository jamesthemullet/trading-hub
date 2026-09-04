import { useCallback, useState } from 'react';

import { isConflictError } from '@/libs/hooks/utils/conflict';
import { handleError } from '@/libs/hooks/utils/error';

export type SaveResult<T> =
  | { status: 'success' }
  | { status: 'conflict'; currentEntity: T }
  | { status: 'error' };

type RunUpdateArgs = {
  version?: number;
  entity: string;
  update: (version: number) => Promise<unknown>;
};

/**
 * Runs an entity update with optimistic locking: sends the loaded version to
 * the v1 endpoint and turns a 409 into a `conflict` result. Shared by every
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
      version,
      entity,
      update,
    }: RunUpdateArgs): Promise<SaveResult<T>> => {
      setError('');
      setIsSaving(true);

      try {
        if (version == null) {
          // Keep the technical detail for telemetry, but surface an
          // actionable message to the user.
          handleError(
            new Error(`Missing ${entity} version for optimistic-locking update`)
          );
          setError(
            `This ${entity} could not be saved because it may be out of date. Refresh the page and try again.`
          );
          return { status: 'error' };
        }
        await update(version);
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
