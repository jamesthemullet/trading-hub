import { useCallback } from 'react';

import type {
  MerchandisingKeywordRuleSet,
  MerchandisingReturnedKeywordRuleSet,
} from '@/libs/api';
import { search } from '@/libs/api';
import {
  type SaveResult,
  useOptimisticUpdate,
} from '@/libs/hooks/use-optimistic-update';

type UpdateRuleSetArgs = MerchandisingKeywordRuleSet & {
  ruleSetId: string;
  version?: number;
  shouldUseV1?: boolean;
};

export const useSearchRuleSetUpdate = (): {
  isSaving: boolean;
  updateRuleSet: (
    args: UpdateRuleSetArgs
  ) => Promise<SaveResult<MerchandisingReturnedKeywordRuleSet>>;
  error: string;
} => {
  const { error, isSaving, runUpdate } =
    useOptimisticUpdate<MerchandisingReturnedKeywordRuleSet>();

  const updateRuleSet = useCallback(
    ({
      searchTerms,
      ruleSetId,
      rules,
      startDate,
      endDate,
      facets,
      countryCode,
      excludedFacets,
      isEnabled,
      version,
      shouldUseV1 = false,
    }: UpdateRuleSetArgs) => {
      const body: MerchandisingKeywordRuleSet = {
        searchTerms,
        facets,
        isEnabled,
        rules,
        startDate,
        endDate,
        excludedFacets,
        countryCode,
      };

      return runUpdate({
        shouldUseV1,
        version,
        entity: 'ruleset',
        betaUpdate: () =>
          search().betaMerchandisingKeywordRulesetUpdate(ruleSetId, body),
        v1Update: (lockVersion) =>
          search().merchandisingV1KeywordRulesetUpdate(
            'CLOTHING_AND_HOME',
            ruleSetId,
            { ...body, version: lockVersion }
          ),
      });
    },
    [runUpdate]
  );

  return { isSaving, updateRuleSet, error };
};
