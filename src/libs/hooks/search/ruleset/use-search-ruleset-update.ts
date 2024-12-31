import { useCallback, useState } from 'react';

import { KeywordRuleSet, search } from '@/libs/api';

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
    }: KeywordRuleSet & { ruleSetId: string }) => {
      setError('');
      setIsSaving(true);

      try {
        const body: KeywordRuleSet = {
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
        if (error && typeof error === 'object' && 'status' in error) {
          setError(`PUT status ${error.status}`);
          return;
        }
      }
    },
    [setIsSaving]
  );

  return { isSaving, updateRuleSet, error };
};
