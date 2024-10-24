import { useCallback, useState } from 'react';

import type {
  CategoryRuleSet,
  ExcludedFacets,
  MerchandisingRules,
  RuleSetFacetConfigWithId,
} from '@/libs/api';
import { search } from '@/libs/api';

export const useRuleSetCreate = () => {
  const [error, setError] = useState('');

  const createRuleset = useCallback(
    async ({
      categoryId,
      categoryIds,
      facets,
      isEnabled,
      merchandisingRules,
      startDate,
      endDate,
      excludedFacets,
    }: {
      categoryId: string;
      categoryIds?: string[];
      facets: Array<RuleSetFacetConfigWithId>;
      isEnabled: boolean;
      merchandisingRules: MerchandisingRules;
      startDate?: string;
      endDate?: string;
      excludedFacets?: ExcludedFacets;
    }) => {
      setError('');

      try {
        const body: CategoryRuleSet = {
          rules: merchandisingRules,
          facets,
          // note categoryId is a required field but is deprecated
          categoryId,
          ...(categoryIds && { categoryIds }),
          isEnabled,
          startDate,
          endDate,
          excludedFacets,
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
