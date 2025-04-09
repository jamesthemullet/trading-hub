import { useCallback, useState } from 'react';

import type {
  MerchandisingCountryCode,
  MerchandisingExcludedFacets,
  MerchandisingKeywordRuleSet,
  MerchandisingReturnedFacet,
  MerchandisingRules,
} from '@/libs/api';
import { search } from '@/libs/api';
import { handleError } from '@/libs/hooks/utils/error';

export const useSearchRuleSetCreate = () => {
  const [error, setError] = useState('');

  const createRuleset = useCallback(
    async ({
      searchTerms,
      merchandisingRules,
      includedFacets,
      excludedFacets,
      startDate,
      endDate,
      countryCode,
    }: {
      searchTerms: string[];
      merchandisingRules: MerchandisingRules;
      includedFacets: MerchandisingReturnedFacet[];
      excludedFacets: MerchandisingExcludedFacets;
      startDate?: string;
      endDate?: string;
      countryCode?: MerchandisingCountryCode;
    }) => {
      setError('');

      try {
        const body: MerchandisingKeywordRuleSet = {
          searchTerms,
          isEnabled: false,
          rules: merchandisingRules,
          startDate,
          endDate,
          countryCode,
          excludedFacets,
          facets: includedFacets,
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
