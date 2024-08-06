import { useCallback, useState } from 'react';

import { KeywordRedirect, search } from '@/libs/api';

export const useRedirectUpdate = () => {
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const updateRedirect = useCallback(
    async ({
      redirect,
      redirectId,
    }: {
      redirectId: string;
      redirect: KeywordRedirect;
    }) => {
      setError('');
      setIsSaving(true);

      try {
        const response = await search().betaMerchandisingKeywordRedirectUpdate(
          redirectId,
          redirect
        );

        setIsSaving(false);
        return response.data;
      } catch (error) {
        if (error && typeof error === 'object' && 'status' in error) {
          setError(`PUT status ${error.status}`);
          return;
        }
      }
    },
    [setIsSaving]
  );

  return { isSaving, updateRedirect, error };
};
