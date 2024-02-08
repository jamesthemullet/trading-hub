import { useCallback, useState } from 'react';

import { merchandising } from '@/libs/api';

export const useRuleSetDelete = () => {
  const [error, setError] = useState('');

  const handleDelete = useCallback(
    async ({ rulesetId }: { rulesetId: string }) => {
      setError('');

      // eslint-disable-next-line functional/no-try-statement
      try {
        const response = await merchandising().rulesetDelete(rulesetId);

        return response.data;
      } catch (error) {
        setError(`Failed to delete ruleset ${JSON.stringify(error)}`);
      }
    },
    []
  );

  return { handleDelete, error };
};
