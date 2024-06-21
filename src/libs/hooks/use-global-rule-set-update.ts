import { useCallback, useState } from 'react';

import { RuleSet, search } from '@/libs/api';

export const useGlobalRuleSetUpdate = () => {
  const [error, setError] = useState('');

  const saveGlobalRuleset = useCallback(
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

  return { saveGlobalRuleset, error };
};
