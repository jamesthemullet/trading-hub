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
  shouldUseV1?: boolean;
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
      shouldUseV1 = false,
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
        shouldUseV1,
        version,
        entity: 'ruleset',
        betaUpdate: () =>
          search().betaMerchandisingCategoryRulesetUpdate(ruleSetId, body),
        v1Update: (lockVersion) =>
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
