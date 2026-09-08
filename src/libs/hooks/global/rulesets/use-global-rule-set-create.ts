import { useCallback, useState } from 'react';

import type {
  CreateCatalogueGlobalRuleSetParamsEnum,
  MerchandisingReturnedGlobalRuleSet,
  MerchandisingRuleSet,
} from '@/libs/api';
import { search } from '@/libs/api';
import { handleError } from '@/libs/hooks/utils/error';

export const useGlobalRuleSetCreate = (): {
  createGlobalRuleSet: (
    params: MerchandisingRuleSet,
    catalogue: CreateCatalogueGlobalRuleSetParamsEnum
  ) => Promise<MerchandisingReturnedGlobalRuleSet | undefined>;
  error: string;
} => {
  const [error, setError] = useState('');

  const createGlobalRuleSet = useCallback(
    async (
      {
        rules,
        isEnabled,
        startDate,
        endDate,
        countryCode,
      }: MerchandisingRuleSet,
      catalogue: CreateCatalogueGlobalRuleSetParamsEnum
    ) => {
      setError('');

      try {
        const body: MerchandisingRuleSet = {
          facets: [],
          rules,
          isEnabled,
          startDate,
          endDate,
          countryCode,
        };
        const response = await search().createCatalogueGlobalRuleSet(
          catalogue,
          body
        );
        return response.data;
      } catch (error) {
        setError(handleError(error));
      }
    },
    []
  );

  return { createGlobalRuleSet, error };
};
