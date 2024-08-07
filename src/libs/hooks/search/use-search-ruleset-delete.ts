import { useCallback, useState } from 'react';

import { search } from '@/libs/api';

export const useSearchRuleSetDelete = () => {
  const [error, setError] = useState('');

  const deleteRuleset = useCallback(
    async ({ rulesetId }: { rulesetId: string }) => {
      setError('');

      try {
        const response =
          await search().betaMerchandisingKeywordRulesetDelete(rulesetId);

        return response.data;
      } catch (error) {
        setError(`Failed to delete ruleset ${JSON.stringify(error)}`);
      }
    },
    []
  );

  return { deleteRuleset, error };
};
