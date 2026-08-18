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
      } catch (err) {
        const message =
          err !== null &&
          typeof err === 'object' &&
          'data' in err &&
          'error' in err
            ? JSON.stringify({ data: err.data, error: err.error })
            : String(err);
        setError(`Failed to delete ruleset ${message}`);
      }
    },
    []
  );

  return { handleDelete, error };
};
