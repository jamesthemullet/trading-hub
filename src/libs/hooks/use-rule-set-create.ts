import { useCallback, useState } from 'react';

import type { MerchandisingRules, RuleSetFacetConfigWithId } from '@/libs/api';
import { search } from '@/libs/api';

export const useRuleSetCreate = () => {
  const [error, setError] = useState('');

  const createRuleset = useCallback(
    async ({
      categoryId,
      facets,
      isEnabled,
      merchandisingRules,
    }: {
      categoryId: string;
      facets: Array<RuleSetFacetConfigWithId>;
      isEnabled: boolean;
      merchandisingRules: MerchandisingRules;
    }) => {
      setError('');

      try {
        const body = {
          facets,
          categoryId,
          isEnabled,
          rules: merchandisingRules,
        };
        const response =
          await search().betaMerchandisingCategoryRulesetCreate(body);
        return response.data;
      } catch (error) {
        setError(`Failed to create ruleset ${error}`);
      }
    },
    []
  );

  return { createRuleset, error };
};
