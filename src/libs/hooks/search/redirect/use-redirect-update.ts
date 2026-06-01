import { useCallback, useState } from 'react';

import type {
  MerchandisingKeywordRedirect,
  MerchandisingReturnedKeywordRedirect,
} from '@/libs/api';
import { search } from '@/libs/api';
import { handleError } from '@/libs/hooks/utils/error';

export const useRedirectUpdate = (): {
  isSaving: boolean;
  updateRedirect: (params: {
    redirectId: string;
    redirect: MerchandisingKeywordRedirect;
  }) => Promise<MerchandisingReturnedKeywordRedirect | undefined>;
  error: string;
} => {
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const updateRedirect = useCallback(
    async ({
      redirect,
      redirectId,
    }: {
      redirectId: string;
      redirect: MerchandisingKeywordRedirect;
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
        setError(handleError(error));
        setIsSaving(false);
      }
    },
    [setIsSaving]
  );

  return { isSaving, updateRedirect, error };
};
