import { useCallback } from 'react';

import type {
  MerchandisingReturnedGlobalRuleSet,
  MerchandisingRuleSet,
  MerchandisingV1GlobalRulesetUpdateParamsEnum,
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
  catalogue: MerchandisingV1GlobalRulesetUpdateParamsEnum;
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
    ({ ruleSetId, ruleSet, version, catalogue }: SaveGlobalRulesetParams) =>
      runUpdate({
        version,
        entity: 'ruleset',
        update: (lockVersion) =>
          search().merchandisingV1GlobalRulesetUpdate(catalogue, ruleSetId, {
            ...ruleSet,
            version: lockVersion,
          }),
      }),
    [runUpdate]
  );

  return { saveGlobalRuleset, error };
};
