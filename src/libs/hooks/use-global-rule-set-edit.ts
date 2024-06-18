import { useCallback, useState } from 'react';

import { RuleSet, search } from '@/libs/api';

export const useGlobalRuleSetEdit = () => {
  const [error, setError] = useState('');

  const handleEdit = useCallback(
    async ({ ruleSetId, ruleSet }: { ruleSetId: string; ruleSet: RuleSet }) => {
      setError('');

      try {
        const response = await search().betaMerchandisingGlobalRulesetUpdate(
          ruleSetId,
          ruleSet
        );

        return response.data;
      } catch (error) {
        setError(`Failed to edit ruleset ${JSON.stringify(error)}`);
      }
    },
    []
  );

  return { handleEdit, error };
};
