import { useEffect, useState } from 'react';

import type {
  Facet,
  MerchandisingRules,
  MerchandisingRulesWithInfo,
  Product,
} from '@/libs/api';
import { merchandising } from '@/libs/api';

export const useCategoryPreview = (
  categoryId: string | undefined,
  merchandisingRules: MerchandisingRules
) => {
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [categoryFacets, setCategoryFacets] = useState<Facet[]>([]);
  const [error, setError] = useState('');
  const [shouldRefetch, refetch] = useState({});
  const [merchandisingRulesWithInfo, setMerchandisingRulesWithInfo] =
    useState<MerchandisingRulesWithInfo>();

  useEffect(() => {
    const asyncCall = async () => {
      if (!categoryId) {
        setCategoryProducts([]);
        return;
      }

      try {
        const categoryPreview = await merchandising().categoryPreviewCreate(
          categoryId,
          { rows: 12, start: 0 },
          {
            pinnedProducts: merchandisingRules.pinnedProducts,
            blockedProducts: merchandisingRules.blockedProducts,
            buries: merchandisingRules.buries,
            boosts: merchandisingRules.boosts,
          }
        );

        const previewData = categoryPreview.data;

        setCategoryProducts(previewData.products);
        setMerchandisingRulesWithInfo(previewData.rules);

        if (previewData.facets.facets) {
          setCategoryFacets(previewData.facets.facets);
        }

        setError('');
      } catch (error: any) {
        setError(`Failed to get categories ${error.status}`);
      }
    };

    void asyncCall();
  }, [categoryId, shouldRefetch, merchandisingRules]);

  return {
    categoryProducts,
    categoryFacets,
    merchandisingRulesWithInfo,
    error,
    refetchRuleSetPreview: () => refetch({}),
  };
};
