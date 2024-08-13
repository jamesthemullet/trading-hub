import { useEffect, useMemo, useState } from 'react';

import type { Product, ReturnedKeywordRuleSet } from '@/libs/api';
import { search } from '@/libs/api';

export const useSearchRuleSetPreview = (id: string) => {
  const api = useMemo(() => search(), []);
  const [ruleSet, setRuleSet] = useState<ReturnedKeywordRuleSet>({
    searchTerms: [],
    id: '',
    isEnabled: false,
    lastChanged: {
      date: '',
      user: '',
    },
    rules: {
      pinnedProducts: [],
      blockedProducts: [],
      boosts: { alphanumeric: [], numeric: [], product: [] },
      buries: {
        alphanumeric: [],
        numeric: [],
        product: [],
      },
    },
    facets: [],
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const asyncCall = async () => {
      try {
        const response = await api.betaMerchandisingKeywordRulesetDetail(id);

        const data = response.data;

        setRuleSet(data);

        const searchTerms = data.searchTerms;
        const searchTerm = searchTerms[0];

        const searchPreview = await api.betaMerchandisingPreviewCreate(
          { rows: 12, start: 0, searchTerm },
          {
            facets: [],
            isEnabled: true,
            rules: {
              pinnedProducts: data.rules.pinnedProducts,
              blockedProducts: data.rules.blockedProducts,
              boosts: data.rules.boosts,
              buries: data.rules.buries,
            },
          }
        );

        const previewData = searchPreview.data;

        setProducts(previewData.products);
        setError('');
      } catch (error) {
        console.log('error', error);
        if (error && typeof error === 'object' && 'status' in error) {
          setError(`POST status ${error.status} ${JSON.stringify(error)}`);
          setIsLoading(false);
          return;
        }
      }
      setIsLoading(false);
    };
    setIsLoading(true);
    void asyncCall();
  }, [id, api]);

  return { ruleSet, products, error, isLoading };
};
