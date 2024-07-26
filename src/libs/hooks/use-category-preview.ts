import { useEffect, useState } from 'react';

import type {
  MerchandisingRules,
  RuleSetFacetConfigWithId,
  SearchPreviewResponseBeta,
} from '@/libs/api';
import { search } from '@/libs/api';

import { validateErrorResponse } from './utils/error';

export const useCategoryPreview = ({
  categoryId,
  merchandisingRules,
  facetConfig,
}: {
  categoryId: string | undefined;
  merchandisingRules: MerchandisingRules;
  facetConfig: Array<RuleSetFacetConfigWithId>;
}) => {
  const [error, setError] = useState('');
  const [rules, setRules] = useState(merchandisingRules);
  const [isLoading, setIsLoading] = useState(false);

  const [facetConfigRules, setFacetConfigRules] =
    useState<Array<RuleSetFacetConfigWithId>>(facetConfig);
  const [data, setData] = useState<SearchPreviewResponseBeta>({
    category: '',
    products: [],
    ruleSet: {
      rules: {
        pinnedProducts: [],
        blockedProducts: [],
        boosts: {
          numeric: [],
          alphanumeric: [],
          product: [],
        },
        buries: {
          numeric: [],
          alphanumeric: [],
          product: [],
        },
      },
      facets: [],
    },
    externalChanges: {
      pinnedProducts: [],
      blockedProducts: [],
      boosts: {
        numeric: [],
        alphanumeric: [],
        product: [],
      },
      buries: {
        numeric: [],
        alphanumeric: [],
        product: [],
      },
    },
    facets: [],
    pagination: {
      totalItems: 0,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!categoryId) {
        return;
      }
      setIsLoading(true);

      try {
        const categoryPreview =
          await search().betaMerchandisingCategoryPreviewCreate(
            categoryId,
            { rows: 140, start: 0 },
            {
              rules,
              facets: facetConfigRules,
              isEnabled: true,
            }
          );

        const previewData: SearchPreviewResponseBeta = categoryPreview.data;

        setData(previewData);

        setError('');
        setIsLoading(false);
      } catch (error: unknown) {
        if (error) {
          setError(validateErrorResponse(error));
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [facetConfigRules, categoryId, rules]);

  return {
    data,
    error,
    isLoading,
    setFacetConfigRules: (facets: RuleSetFacetConfigWithId[]) =>
      setFacetConfigRules(facets),
    setRules: (rules: MerchandisingRules) => setRules(rules),
  };
};
