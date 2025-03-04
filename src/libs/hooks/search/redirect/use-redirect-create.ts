import { useCallback, useState } from 'react';

import type { KeywordRedirect } from '@/libs/api';
import { search } from '@/libs/api';
import { handleError } from '@/libs/hooks/utils/error';

export const useRedirectCreate = () => {
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const createRedirect = useCallback(
    async ({ redirect }: { redirect: KeywordRedirect }) => {
      setError('');
      setIsSaving(true);

      try {
        const response =
          await search().betaMerchandisingKeywordRedirectCreate(redirect);
        setIsSaving(false);
        return response.data;
      } catch (error: unknown) {
        if (error) {
          setError(handleError(error));
          setIsSaving(false);
        }
      }
    },
    []
  );

  return { createRedirect, isSaving, error };
};
