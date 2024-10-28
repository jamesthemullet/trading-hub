import { useCallback, useState } from 'react';

import type { CategoryRuleSet } from '@/libs/api';
import { search } from '@/libs/api';

import { handleError } from './utils/error';

export const useUpdateRuleSet = () => {
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const updateCategoryRuleSet = useCallback(
    async ({
      categoryIds,
      countryCode,
      endDate,
      excludedFacets,
      facets,
      isEnabled,
      ruleSetId,
      rules,
      startDate,
    }: CategoryRuleSet & { ruleSetId: string }) => {
      setError('');
      setIsSaving(true);

      try {
        const body: CategoryRuleSet = {
          categoryIds,
          countryCode,
          facets,
          isEnabled,
          rules,
          excludedFacets,
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
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

  return { isSaving, updateCategoryRuleSet, error };
};
