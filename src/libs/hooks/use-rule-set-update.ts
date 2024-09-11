import { useCallback, useState } from 'react';

import type { ExcludedFacets, RuleSet } from '@/libs/api';
import { search } from '@/libs/api';

import { validateErrorResponse } from './utils/error';

export const useUpdateRuleSet = () => {
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const updateRuleSet = useCallback(
    async ({
      categoryId,
      ruleSetId,
      rules,
      excludedFacets,
    }: {
      categoryId: string;
      ruleSetId: string;
      rules: RuleSet;
      excludedFacets?: ExcludedFacets;
    }) => {
      setError('');
      setIsSaving(true);

      try {
        const body = {
          categoryId,
          facets: rules.facets,
          isEnabled: rules.isEnabled,
          rules: rules.rules,
          excludedFacets: excludedFacets,
        };

        await search().betaMerchandisingCategoryRulesetUpdate(ruleSetId, body);

        setIsSaving(false);
        return { status: 'success' };
      } catch (error) {
        setIsSaving(false);
        setError(validateErrorResponse(error));
        return { status: 'error' };
      }
    },
    [setIsSaving]
  );

  return { isSaving, updateRuleSet, error };
};
