import { useCallback, useState } from 'react';
<<<<<<< Updated upstream
import { merchandising } from '../api';
=======

import { merchandising } from '@/libs/api';
>>>>>>> Stashed changes

export const useRuleSetDelete = () => {
  const [error, setError] = useState('');

  const handleDelete = useCallback(
    async ({ rulesetId }: { rulesetId: string }) => {
      setError('');

<<<<<<< Updated upstream
=======
      // eslint-disable-next-line functional/no-try-statement
>>>>>>> Stashed changes
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
