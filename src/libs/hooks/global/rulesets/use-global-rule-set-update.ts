import { useCallback, useState } from 'react';

import type { MerchandisingRuleSet } from '@/libs/api';
import { search } from '@/libs/api';
import { handleError } from '@/libs/hooks/utils/error';

type SuccessResult = { status: 'success' };
type ErrorResult = { status: 'error'; error: unknown };
type SaveResult = SuccessResult | ErrorResult;

type UseGlobalRuleSetUpdate = {
  saveGlobalRuleset: (params: {
    ruleSetId: string;
    ruleSet: MerchandisingRuleSet;
  }) => Promise<SaveResult>;
  error: string;
};

const SUCCESS_RESULT: SuccessResult = { status: 'success' };

export const useGlobalRuleSetUpdate = (): UseGlobalRuleSetUpdate => {
  const [error, setError] = useState('');

  const saveGlobalRuleset = useCallback(
    async ({
      ruleSetId,
      ruleSet,
    }: {
      ruleSetId: string;
      ruleSet: MerchandisingRuleSet;
    }): Promise<SaveResult> => {
      setError('');

      try {
        await search().betaMerchandisingGlobalRulesetUpdate(ruleSetId, ruleSet);

        return SUCCESS_RESULT;
      } catch (error) {
        setError(handleError(error));
        return { status: 'error', error };
      }
    },
    []
  );

  return { saveGlobalRuleset, error };
};
