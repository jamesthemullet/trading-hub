import { useEffect, useMemo, useState } from 'react';

import type {
  GetGlobalRuleSetsLiteParamsCatalogueEnum,
  MerchandisingReturnedGlobalRuleSet,
} from '@/libs/api';
import { search } from '@/libs/api';
import { EMPTY_MERCHANDISING_RULES } from '@/libs/hooks/utils/constants';
import { handleError } from '@/libs/hooks/utils/error';

/**
 * The catalogue field is present on the beta global ruleset response at
 * runtime but is not yet declared in api.yml, so it's not part of the
 * generated MerchandisingReturnedGlobalRuleSet type.
 */
export type GlobalRuleSetWithCatalogue = MerchandisingReturnedGlobalRuleSet & {
  catalogue?: GetGlobalRuleSetsLiteParamsCatalogueEnum;
};

export const useGlobalRuleSetDetail = (
  id: string
): {
  globalRuleSet: GlobalRuleSetWithCatalogue;
  error: string;
  isLoading: boolean;
} => {
  const api = useMemo(() => search(), []);
  const [globalRuleSet, setGlobalRuleSet] =
    useState<GlobalRuleSetWithCatalogue>({
      id: '',
      isEnabled: false,
      lastChanged: {
        date: '',
        user: '',
      },
      rules: structuredClone(EMPTY_MERCHANDISING_RULES),
      facets: [],
    });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const asyncCall = async () => {
      try {
        const response = await api.getGlobalRuleSet(id);

        const data = response.data;

        setGlobalRuleSet(data);
        setError('');
      } catch (error) {
        setError(handleError(error));
      }
      setIsLoading(false);
    };
    setIsLoading(true);
    void asyncCall();
  }, [id, api]);

  return { globalRuleSet, error, isLoading };
};
