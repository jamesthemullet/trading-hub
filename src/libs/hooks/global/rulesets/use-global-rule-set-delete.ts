import { useCallback, useState } from 'react';

import { search } from '@/libs/api';
import { handleError } from '@/libs/hooks/utils/error';

export const useGlobalRuleSetDelete = () => {
  const [error, setError] = useState('');

  const handleDelete = useCallback(
    async ({ rulesetId }: { rulesetId: string }) => {
      setError('');

      try {
        const response =
          await search().betaMerchandisingGlobalRulesetDelete(rulesetId);

        return response.data;
      } catch (error) {
        setError(handleError(error));
      }
    },
    []
  );

  return { handleDelete, error };
};
