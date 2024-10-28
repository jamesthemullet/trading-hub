import { useCallback, useState } from 'react';

import type { CategoryRuleSet } from '@/libs/api';
import { search } from '@/libs/api';

export const useRuleSetCreate = () => {
  const [error, setError] = useState('');

  const createRuleset = useCallback(
    async ({
      categoryIds,
      countryCode,
      endDate,
      excludedFacets,
      facets,
      isEnabled,
      rules,
      startDate,
    }: CategoryRuleSet) => {
      setError('');

      try {
        const body: CategoryRuleSet = {
          categoryIds,
          countryCode,
          endDate,
          excludedFacets,
          facets,
          isEnabled,
          rules,
          startDate,
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
