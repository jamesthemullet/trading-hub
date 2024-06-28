import { useEffect, useState } from 'react';

import type {
  Facet,
  MerchandisingRules,
  MerchandisingRulesWithInfo,
  Product,
  SearchPreviewResponse,
} from '@/libs/api';
import { merchandising } from '@/libs/api';

export const useCategoryPreview = (
  categoryId: string | undefined,
  merchandisingRules: MerchandisingRules
) => {
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [totalCategoryProducts, setTotalCategoryProducts] = useState(0);
  const [categoryFacets, setCategoryFacets] = useState<Facet[]>([]);
  const [error, setError] = useState('');
  const [rules, setRules] = useState(merchandisingRules);
  const [merchandisingRulesWithInfo, setMerchandisingRulesWithInfo] =
    useState<MerchandisingRulesWithInfo>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const asyncCall = async () => {
      if (!categoryId) {
        setCategoryProducts([]);
        return;
      }
      setIsLoading(true);

      try {
        const categoryPreview = await merchandising().categoryPreviewCreate(
          categoryId,
          { rows: 140, start: 0 },
          {
            pinnedProducts: rules.pinnedProducts,
            blockedProducts: rules.blockedProducts,
            buries: rules.buries,
            boosts: rules.boosts,
          }
        );

        const previewData: SearchPreviewResponse = categoryPreview.data;

        setCategoryProducts(previewData.products);
        if (previewData.pagination.totalItems) {
          setTotalCategoryProducts(previewData.pagination.totalItems);
        }
        setMerchandisingRulesWithInfo(previewData.rules);

        if (previewData.facets.facets) {
          setCategoryFacets(previewData.facets.facets);
        }

        setError('');
        setIsLoading(false);
      } catch (error: unknown) {
        if (error) {
          setError(
            `Failed to get categories ${(error as { status: string })?.status}`
          );
        }
      }
    };

    void asyncCall();
  }, [categoryId, rules]);

  return {
    categoryFacets,
    categoryProducts,
    error,
    isLoading,
    merchandisingRulesWithInfo,
    setRules: (rules: MerchandisingRules) => setRules(rules),
    totalCategoryProducts,
  };
};
