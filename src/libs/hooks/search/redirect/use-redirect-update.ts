import { useCallback } from 'react';

import type {
  MerchandisingKeywordRedirect,
  MerchandisingReturnedKeywordRedirect,
} from '@/libs/api';
import { search } from '@/libs/api';
import {
  type SaveResult,
  useOptimisticUpdate,
} from '@/libs/hooks/use-optimistic-update';

type UpdateRedirectArgs = {
  redirectId: string;
  redirect: MerchandisingKeywordRedirect;
  version?: number;
};

export const useRedirectUpdate = (): {
  isSaving: boolean;
  updateRedirect: (
    params: UpdateRedirectArgs
  ) => Promise<SaveResult<MerchandisingReturnedKeywordRedirect>>;
  error: string;
} => {
  const { error, isSaving, runUpdate } =
    useOptimisticUpdate<MerchandisingReturnedKeywordRedirect>();

  const updateRedirect = useCallback(
    ({ redirect, redirectId, version }: UpdateRedirectArgs) =>
      runUpdate({
        version,
        entity: 'redirect',
        update: (lockVersion) =>
          search().merchandisingV1KeywordRedirectUpdate(
            'CLOTHING_AND_HOME',
            redirectId,
            {
              ...redirect,
              version: lockVersion,
            }
          ),
      }),
    [runUpdate]
  );

  return { isSaving, updateRedirect, error };
};
