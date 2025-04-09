import { useCallback, useState } from 'react';

import type { MerchandisingCategoryRuleSet } from '@/libs/api';
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
    }: MerchandisingCategoryRuleSet & { ruleSetId: string }) => {
      setError('');
      setIsSaving(true);

      try {
        const body: MerchandisingCategoryRuleSet = {
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
