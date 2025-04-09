import { useCallback, useState } from 'react';

import type { MerchandisingCategoryRuleSet } from '@/libs/api';
import { search } from '@/libs/api';

import { handleError } from './utils/error';

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
    }: MerchandisingCategoryRuleSet) => {
      setError('');

      try {
        const body: MerchandisingCategoryRuleSet = {
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
        setError(handleError(error));
      }
    },
    []
  );

  return { createRuleset, error };
};
