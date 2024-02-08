import { useCallback, useState } from 'react';

import { merchandising } from '../api';

export const useRuleSetCreate = () => {
  const [error, setError] = useState('');

  const handlePost = useCallback(
    async ({ categoryId }: { categoryId: string }) => {
      setError('');

      // eslint-disable-next-line functional/no-try-statement
      try {
        const body = {
          categoryId,
          isEnabled: true,
          rules: {
            pinnedProducts: [],
            blockedProducts: [],
            boosts: [],
          },
        };
        const response = await merchandising().rulesetCreate(body);
        return response.data;
      } catch (error) {
        setError(`Failed to create ruleset ${error}`);
      }
    },
    []
  );

  return { handlePost, error };
};
