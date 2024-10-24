import { useCallback, useState } from 'react';

import { KeywordRuleSet, RuleSet, search } from '@/libs/api';

export const useSearchRuleSetUpdate = () => {
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const updateRuleSet = useCallback(
    async ({
      searchTerms,
      ruleSetId,
      rules,
    }: {
      searchTerms: string[];
      ruleSetId: string;
      rules: RuleSet;
      startDate?: string;
      endDate?: string;
    }) => {
      setError('');
      setIsSaving(true);

      try {
        const body: KeywordRuleSet = {
          searchTerms,
          facets: rules.facets,
          isEnabled: rules.isEnabled,
          rules: rules.rules,
          startDate: rules.startDate,
          endDate: rules.endDate,
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
