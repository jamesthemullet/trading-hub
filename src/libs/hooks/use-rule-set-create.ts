import { useCallback, useState } from 'react';

import type {
  CategoryRuleSet,
  MerchandisingRules,
  RuleSetFacetConfigWithId,
} from '@/libs/api';
import { search } from '@/libs/api';

export const useRuleSetCreate = () => {
  const [error, setError] = useState('');

  const createRuleset = useCallback(
    async ({
      categoryId,
      facets,
      isEnabled,
      merchandisingRules,
      startDate,
      endDate,
    }: {
      categoryId: string;
      facets: Array<RuleSetFacetConfigWithId>;
      isEnabled: boolean;
      merchandisingRules: MerchandisingRules;
      startDate?: string;
      endDate?: string;
    }) => {
      setError('');

      try {
        const body: CategoryRuleSet = {
          facets,
          categoryId,
          isEnabled,
          rules: merchandisingRules,
          startDate,
          endDate,
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
