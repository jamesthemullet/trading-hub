import { useCallback, useState } from 'react';

import type { MerchandisingKeywordRuleSet } from '@/libs/api';
import { search } from '@/libs/api';
import { handleError } from '@/libs/hooks/utils/error';

export const useSearchRuleSetUpdate = () => {
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const updateRuleSet = useCallback(
    async ({
      searchTerms,
      ruleSetId,
      rules,
      startDate,
      endDate,
      facets,
      countryCode,
      excludedFacets,
      isEnabled,
    }: MerchandisingKeywordRuleSet & { ruleSetId: string }) => {
      setError('');
      setIsSaving(true);

      try {
        const body: MerchandisingKeywordRuleSet = {
          searchTerms,
          facets,
          isEnabled,
          rules,
          startDate,
          endDate,
          excludedFacets,
          countryCode,
        };
        const response = await search().betaMerchandisingKeywordRulesetUpdate(
          ruleSetId,
          body
        );

        setIsSaving(false);
        return response.data;
      } catch (error) {
        setError(handleError(error));
      }
    },
    [setIsSaving]
  );

  return { isSaving, updateRuleSet, error };
};
