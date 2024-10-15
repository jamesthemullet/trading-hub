import { useCallback, useState } from 'react';

import type { KeywordRuleSet, MerchandisingRules } from '@/libs/api';
import { search } from '@/libs/api';

export const useSearchRuleSetCreate = () => {
  const [error, setError] = useState('');

  const createRuleset = useCallback(
    async ({
      searchTerms,
      merchandisingRules,
      startDate,
      endDate,
    }: {
      searchTerms: string[];
      merchandisingRules: MerchandisingRules;
      startDate?: string;
      endDate?: string;
    }) => {
      setError('');

      try {
        const body: KeywordRuleSet = {
          searchTerms,
          isEnabled: false,
          rules: merchandisingRules,
          startDate,
          endDate,
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
