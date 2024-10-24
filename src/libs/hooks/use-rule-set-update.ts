import { useCallback, useState } from 'react';

import type { CategoryRuleSet, ExcludedFacets, RuleSet } from '@/libs/api';
import { search } from '@/libs/api';

import { handleError } from './utils/error';

export const useUpdateRuleSet = () => {
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const updateRuleSet = useCallback(
    async ({
      categoryId,
      categoryIds,
      ruleSetId,
      rules,
      excludedFacets,
    }: {
      categoryId: string;
      categoryIds?: string[];
      ruleSetId: string;
      rules: RuleSet;
      excludedFacets?: ExcludedFacets;
    }) => {
      setError('');
      setIsSaving(true);

      try {
        const body: CategoryRuleSet = {
          categoryId,
          ...(categoryIds && { categoryIds }),
          facets: rules.facets,
          isEnabled: rules.isEnabled,
          rules: rules.rules,
          excludedFacets: excludedFacets,
          startDate: rules.startDate,
          endDate: rules.endDate,
        };

        await search().betaMerchandisingCategoryRulesetUpdate(ruleSetId, body);

        setIsSaving(false);
        return { status: 'success' };
      } catch (error) {
        setIsSaving(false);
        setError(handleError(error));
        return { status: 'error' };
      }
    },
    [setIsSaving]
  );

  return { isSaving, updateRuleSet, error };
};
