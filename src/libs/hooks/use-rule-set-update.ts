import { useCallback } from 'react';

import type {
  MerchandisingCategoryRuleSet,
  MerchandisingReturnedCategoryRuleSet,
} from '@/libs/api';
import { search } from '@/libs/api';
import {
  type SaveResult,
  useOptimisticUpdate,
} from '@/libs/hooks/use-optimistic-update';

type UpdateCategoryRuleSetArgs = MerchandisingCategoryRuleSet & {
  ruleSetId: string;
  version?: number;
};

export const useUpdateRuleSet = (): {
  isSaving: boolean;
  updateCategoryRuleSet: (
    args: UpdateCategoryRuleSetArgs
  ) => Promise<SaveResult<MerchandisingReturnedCategoryRuleSet>>;
  error: string;
} => {
  const { error, isSaving, runUpdate } =
    useOptimisticUpdate<MerchandisingReturnedCategoryRuleSet>();

  const updateCategoryRuleSet = useCallback(
    ({
      categoryIds,
      countryCode,
      endDate,
      excludedFacets,
      facets,
      isEnabled,
      ruleSetId,
      rules,
      startDate,
      version,
    }: UpdateCategoryRuleSetArgs) => {
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

      return runUpdate({
        version,
        entity: 'ruleset',
        update: (lockVersion) =>
          search().merchandisingV1CategoryRulesetUpdate(
            'CLOTHING_AND_HOME',
            ruleSetId,
            { ...body, version: lockVersion }
          ),
      });
    },
    [runUpdate]
  );

  return { isSaving, updateCategoryRuleSet, error };
};
