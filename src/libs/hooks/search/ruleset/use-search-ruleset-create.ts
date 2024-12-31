import { useCallback, useState } from 'react';

import type {
  CountryCode,
  ExcludedFacets,
  KeywordRuleSet,
  MerchandisingRules,
  ReturnedFacet,
} from '@/libs/api';
import { search } from '@/libs/api';

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
      includedFacets: ReturnedFacet[];
      excludedFacets: ExcludedFacets;
      startDate?: string;
      endDate?: string;
      countryCode?: CountryCode;
    }) => {
      setError('');

      try {
        const body: KeywordRuleSet = {
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
        setError(`Failed to create ruleset ${error}`);
      }
    },
    []
  );

  return { createRuleset, error };
};
