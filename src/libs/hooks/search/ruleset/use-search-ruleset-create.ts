import { useCallback, useState } from 'react';

import type { MerchandisingRules } from '@/libs/api';
import { search } from '@/libs/api';

export const useSearchRuleSetCreate = () => {
  const [error, setError] = useState('');

  const createRuleset = useCallback(
    async ({
      searchTerms,
      merchandisingRules,
    }: {
      searchTerms: string[];
      merchandisingRules: MerchandisingRules;
    }) => {
      setError('');

      try {
        const body = {
          searchTerms,
          isEnabled: false,
          rules: merchandisingRules,
        };
        const response =
          await search().betaMerchandisingKeywordRulesetCreate(body);
        return response.data;
      } catch (error) {
        setError(`Failed to create ruleset ${error}`);
      }
    },
    []
  );

  return { createRuleset, error };
};
