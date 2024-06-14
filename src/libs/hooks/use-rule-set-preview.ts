import { useEffect, useMemo, useState } from 'react';

import type { Product, ReturnedFacet, ReturnedRuleSet } from '@/libs/api';
import { merchandising, search } from '@/libs/api';

export const useRuleSetPreview = (id: string) => {
  const api = useMemo(() => merchandising(), []);
  const [facets, setFacets] = useState<ReturnedFacet[]>([]);
  const [ruleSets, setRuleSets] = useState<ReturnedRuleSet>({
    categoryId: '',
    categoryName: '',
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
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const asyncCall = async () => {
      try {
        const response = await api.rulesetDetail(id);

        const data = response.data;

        setRuleSets(data);

        const categoryId = data.categoryId;

        const categoryPreview = await api.categoryPreviewCreate(
          categoryId,
          { rows: 12, start: 0 },
          {
            pinnedProducts: data.rules.pinnedProducts,
            blockedProducts: data.rules.blockedProducts,
            boosts: data.rules.boosts,
            buries: data.rules.buries,
          }
        );

        const previewData = categoryPreview.data;

        setProducts(previewData.products);
        setError('');
      } catch (error) {
        console.log('error', error);
        if (error && typeof error === 'object' && 'status' in error) {
          setError(`POST status ${error.status}`);
          setIsLoading(false);
          return;
        }
      }
      setIsLoading(false);
    };
    setIsLoading(true);
    void asyncCall();
  }, [id, api]);

  useEffect(() => {
    if (facets.length === 0) {
      Promise.all(
        (ruleSets.facets ?? []).map(async ({ id }) => {
          const response = await search().betaMerchandisingFacetDetail(id);
          return response.data;
        })
      ).then((facetDetails) => {
        setFacets(facetDetails);
      });
    }
  }, [ruleSets, facets, api]);

  return { ruleSets, products, error, facets, isLoading };
};
