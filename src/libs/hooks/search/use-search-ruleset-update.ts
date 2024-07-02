import { useCallback, useState } from 'react';

import { RuleSet, search } from '@/libs/api';

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
    }) => {
      setError('');
      setIsSaving(true);

      try {
        const body = {
          searchTerms,
          facets: rules.facets,
          isEnabled: rules.isEnabled,
          rules: rules.rules,
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
