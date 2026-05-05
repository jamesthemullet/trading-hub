import { useCallback, useState } from 'react';

import { search } from '@/libs/api';

export const useRuleSetDelete = (): {
  handleDelete: (args: { rulesetId: string }) => Promise<void>;
  error: string;
} => {
  const [error, setError] = useState('');

  const handleDelete = useCallback(
    async ({ rulesetId }: { rulesetId: string }) => {
      setError('');

      try {
        await search().betaMerchandisingCategoryRulesetDelete(rulesetId);
      } catch (error) {
        setError(`Failed to delete ruleset ${JSON.stringify(error)}`);
      }
    },
    []
  );

  return { handleDelete, error };
};
