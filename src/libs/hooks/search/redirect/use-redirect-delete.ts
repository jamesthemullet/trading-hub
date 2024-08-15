import { useCallback, useState } from 'react';

import { search } from '@/libs/api';

export const useRedirectDelete = () => {
  const [error, setError] = useState('');

  const deleteRedirect = useCallback(
    async ({ redirectId }: { redirectId: string }) => {
      setError('');

      try {
        const response =
          await search().betaMerchandisingKeywordRedirectDelete(redirectId);

        return response.data;
      } catch (error) {
        setError(`Failed to delete redirect ${JSON.stringify(error)}`);
      }
    },
    []
  );

  return { deleteRedirect, error };
};
