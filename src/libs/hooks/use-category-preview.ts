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
  const [rules, setRules] = useState(merchandisingRules);
  const [isLoading, setIsLoading] = useState(false);
  const [merchandisingRulesWithInfo, setMerchandisingRulesWithInfo] =
    useState<MerchandisingRulesWithInfo>();

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

        const previewData = categoryPreview.data;

        setCategoryProducts(previewData.products);
        setMerchandisingRulesWithInfo(previewData.rules);

        if (previewData.facets.facets) {
          setCategoryFacets(previewData.facets.facets);
          setIsLoading(false);
        }

        setError('');
      } catch (error: unknown) {
        if (error) {
          setError(
            `Failed to get categories ${(error as { status: string })?.status}`
          );
          setIsLoading(false);
        }
      }
    };

    void asyncCall();
  }, [categoryId, rules]);

  return {
    categoryProducts,
    categoryFacets,
    error,
    isLoading,
    merchandisingRulesWithInfo,
    setRules: (rules: MerchandisingRules) => setRules(rules),
  };
};
