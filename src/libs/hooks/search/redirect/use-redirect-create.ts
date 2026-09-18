import { useCallback, useState } from 'react';

import type {
  MerchandisingKeywordRedirect,
  MerchandisingReturnedKeywordRedirect,
} from '@/libs/api';
import { search } from '@/libs/api';
import { handleError } from '@/libs/hooks/utils/error';

export const useRedirectCreate = (): {
  createRedirect: (params: {
    redirect: MerchandisingKeywordRedirect;
  }) => Promise<MerchandisingReturnedKeywordRedirect | undefined>;
  isSaving: boolean;
  error: string;
} => {
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const createRedirect = useCallback(
    async ({ redirect }: { redirect: MerchandisingKeywordRedirect }) => {
      setError('');
      setIsSaving(true);

      try {
        const response = await search().createKeywordRedirect(redirect);
        setIsSaving(false);
        return response.data;
      } catch (error: unknown) {
        setError(handleError(error));
        setIsSaving(false);
      }
    },
    []
  );

  return { createRedirect, isSaving, error };
};
