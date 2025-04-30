import { useCallback, useState } from 'react';

import type { MerchandisingKeywordRuleSet } from '@/libs/api';
import { search } from '@/libs/api';
import { handleError } from '@/libs/hooks/utils/error';

export const useSearchRuleSetCreate = () => {
  const [error, setError] = useState('');

  const createRuleset = useCallback(
    async ({
      searchTerms,
      rules,
      facets,
      excludedFacets,
      startDate,
      endDate,
      countryCode,
    }: MerchandisingKeywordRuleSet) => {
      setError('');

      try {
        const body: MerchandisingKeywordRuleSet = {
          searchTerms,
          isEnabled: false,
          rules,
          startDate,
          endDate,
          countryCode,
          excludedFacets,
          facets,
        };
        const response =
          await search().betaMerchandisingKeywordRulesetCreate(body);
        return response.data;
      } catch (error) {
        setError(handleError(error));
      }
    },
    []
  );

  return { createRuleset, error };
};
