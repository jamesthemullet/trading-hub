import { useCallback } from 'react';

import type {
  MerchandisingReturnedGlobalRuleSet,
  MerchandisingRuleSet,
} from '@/libs/api';
import { search } from '@/libs/api';
import {
  type SaveResult,
  useOptimisticUpdate,
} from '@/libs/hooks/use-optimistic-update';

type SaveGlobalRulesetParams = {
  ruleSetId: string;
  ruleSet: MerchandisingRuleSet;
  version?: number;
};

export const useGlobalRuleSetUpdate = (): {
  saveGlobalRuleset: (
    params: SaveGlobalRulesetParams
  ) => Promise<SaveResult<MerchandisingReturnedGlobalRuleSet>>;
  error: string;
} => {
  const { error, runUpdate } =
    useOptimisticUpdate<MerchandisingReturnedGlobalRuleSet>();

  const saveGlobalRuleset = useCallback(
    ({ ruleSetId, ruleSet, version }: SaveGlobalRulesetParams) =>
      runUpdate({
        version,
        entity: 'ruleset',
        update: (lockVersion) =>
          search().merchandisingV1GlobalRulesetUpdate(
            'CLOTHING_AND_HOME',
            ruleSetId,
            { ...ruleSet, version: lockVersion }
          ),
      }),
    [runUpdate]
  );

  return { saveGlobalRuleset, error };
};
