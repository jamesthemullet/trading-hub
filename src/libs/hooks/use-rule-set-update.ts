import { useCallback, useState } from 'react';

import { merchandising, RuleSet } from '@/libs/api';

export const useUpdateRuleSet = () => {
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const updateRuleSet = useCallback(
    async ({
      categoryId,
      ruleSetId,
      rules,
    }: {
      categoryId: string;
      ruleSetId: string;
      rules: RuleSet;
    }) => {
      setError('');
      setIsSaving(true);

      try {
        // TODO: move to search/beta api when ready for use
        const body = {
          categoryId,
          facets: rules.facets,
          isEnabled: rules.isEnabled,
          rules: rules.rules,
        };
        const response = await merchandising().rulesetUpdate(ruleSetId, body);

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
