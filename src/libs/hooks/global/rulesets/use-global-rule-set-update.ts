import { useCallback, useState } from 'react';

import type { RuleSet } from '@/libs/api';
import { search } from '@/libs/api';
import { handleError } from '@/libs/hooks/utils/error';

export const useGlobalRuleSetUpdate = () => {
  const [error, setError] = useState('');

  const saveGlobalRuleset = useCallback(
    async ({ ruleSetId, ruleSet }: { ruleSetId: string; ruleSet: RuleSet }) => {
      setError('');

      try {
        await search().betaMerchandisingGlobalRulesetUpdate(ruleSetId, ruleSet);

        return { status: 'success' };
      } catch (error) {
        setError(handleError(error));
        return { status: 'error', error };
      }
    },
    []
  );

  return { saveGlobalRuleset, error };
};
