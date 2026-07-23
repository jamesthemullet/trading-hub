import { useCallback, useState } from 'react';

import type {
  MerchandisingReturnedGlobalRuleSet,
  MerchandisingRuleSet,
} from '@/libs/api';
import { search } from '@/libs/api';
import { isConflictError } from '@/libs/hooks/utils/conflict';
import { handleError } from '@/libs/hooks/utils/error';

// The merchandising hub only manages the Clothing & Home catalogue; the v1
// endpoint takes it as a path parameter.
const GLOBAL_RULESET_CATALOGUE = 'CLOTHING_AND_HOME' as const;

type SuccessResult = { status: 'success' };
type ConflictResult = {
  status: 'conflict';
  currentEntity: MerchandisingReturnedGlobalRuleSet;
};
type ErrorResult = { status: 'error'; error: unknown };
type SaveResult = SuccessResult | ConflictResult | ErrorResult;

type SaveGlobalRulesetParams = {
  ruleSetId: string;
  ruleSet: MerchandisingRuleSet;
  version?: number;
  shouldUseV1?: boolean;
};

type UseGlobalRuleSetUpdate = {
  saveGlobalRuleset: (params: SaveGlobalRulesetParams) => Promise<SaveResult>;
  error: string;
};

const SUCCESS_RESULT: SuccessResult = { status: 'success' };

export const useGlobalRuleSetUpdate = (): UseGlobalRuleSetUpdate => {
  const [error, setError] = useState('');

  const saveGlobalRuleset = useCallback(
    async ({
      ruleSetId,
      ruleSet,
      version,
      shouldUseV1 = false,
    }: SaveGlobalRulesetParams): Promise<SaveResult> => {
      setError('');

      try {
        if (shouldUseV1) {
          if (version == null) {
            const missingVersionError = new Error(
              'Missing ruleset version for optimistic-locking update'
            );
            setError(handleError(missingVersionError));
            return { status: 'error', error: missingVersionError };
          }

          await search().merchandisingV1GlobalRulesetUpdate(
            GLOBAL_RULESET_CATALOGUE,
            ruleSetId,
            { ...ruleSet, version }
          );
        } else {
          await search().betaMerchandisingGlobalRulesetUpdate(
            ruleSetId,
            ruleSet
          );
        }

        return SUCCESS_RESULT;
      } catch (error) {
        if (isConflictError(error)) {
          return {
            status: 'conflict',
            currentEntity: error.error.currentEntity,
          };
        }

        setError(handleError(error));
        return { status: 'error', error };
      }
    },
    []
  );

  return { saveGlobalRuleset, error };
};
