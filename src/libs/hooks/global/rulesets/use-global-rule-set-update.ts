import { useCallback, useState } from 'react';

import { RuleSet, search } from '@/libs/api';

import { handleError } from '../../utils/error';

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
        setError(handleError(error));
      }
    },
    []
  );

  return { saveGlobalRuleset, error };
};
