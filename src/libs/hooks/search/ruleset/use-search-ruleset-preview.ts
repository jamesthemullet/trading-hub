import { useEffect, useMemo, useState } from 'react';

import type {
  MerchandisingProduct,
  MerchandisingReturnedKeywordRuleSet,
} from '@/libs/api';
import { search } from '@/libs/api';
import { EMPTY_MERCHANDISING_RULES } from '@/libs/hooks/utils/constants';
import { handleError } from '@/libs/hooks/utils/error';

export const useSearchRuleSetPreview = (
  id: string,
  disabled = false
): {
  ruleSet: MerchandisingReturnedKeywordRuleSet;
  products: MerchandisingProduct[];
  error: string;
  isLoading: boolean;
} => {
  const api = useMemo(() => search(), []);
  const [ruleSet, setRuleSet] = useState<MerchandisingReturnedKeywordRuleSet>({
    searchTerms: [],
    id: '',
    isEnabled: false,
    lastChanged: {
      date: '',
      user: '',
    },
    rules: structuredClone(EMPTY_MERCHANDISING_RULES),
    facets: [],
  });
  const [products, setProducts] = useState<MerchandisingProduct[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id || disabled) {
      setIsLoading(false);
      return;
    }
    const asyncCall = async () => {
      try {
        const response = await api.getKeywordRuleSet(id);

        const data = response.data;

        setRuleSet(data);

        const searchTerms = data.searchTerms;
        const searchTerm = searchTerms[0];

        const searchPreview = await api.previewMerchandisingRules(
          { rows: 12, start: 0, searchTerm },
          {
            facets: [],
            isEnabled: true,
            rules: {
              pinnedProducts: data.rules.pinnedProducts,
              blockedProducts: data.rules.blockedProducts,
              boosts: data.rules.boosts,
              buries: data.rules.buries,
              includes: {
                alphanumeric: [],
              },
              excludes: {
                alphanumeric: [],
              },
            },
          }
        );

        const previewData = searchPreview.data;

        setProducts(previewData.products);
        setError('');
      } catch (error) {
        if (error && typeof error === 'object' && 'status' in error) {
          setError(handleError(error));
          setIsLoading(false);
          return;
        }
      }
      setIsLoading(false);
    };
    setIsLoading(true);
    void asyncCall();
  }, [id, api, disabled]);

  return { ruleSet, products, error, isLoading };
};
