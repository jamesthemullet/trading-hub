import { useEffect, useState } from 'react';

import type {
  ExcludedFacets,
  MerchandisingRules,
  RuleSetFacetConfigWithId,
  SearchPreviewResponseBeta,
} from '@/libs/api';
import { search } from '@/libs/api';

import { handleError } from './utils/error';

export const usePreview = ({
  categoryId,
  facetConfig,
  merchandisingRules,
  searchTerm,
  excludedFacets,
}: {
  facetConfig: Array<RuleSetFacetConfigWithId>;
  merchandisingRules: MerchandisingRules;
  categoryId?: string;
  searchTerm?: string;
  excludedFacets?: ExcludedFacets;
}) => {
  const [error, setError] = useState('');
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
      if (!categoryId && !searchTerm) {
        return;
      }

      setIsLoading(true);

      try {
        const searchPreview = await search().betaMerchandisingPreviewCreate(
          {
            ...(categoryId && { categoryId }),
            ...(searchTerm && { searchTerm }),
            rows: 140,
            start: 0,
          },
          {
            rules: merchandisingRules,
            excludedFacets,
            facets: facetConfigRules,
            isEnabled: true,
          }
        );

        const previewData: SearchPreviewResponseBeta = searchPreview.data;

        setData(previewData);

        setError('');
        setIsLoading(false);
      } catch (error: unknown) {
        if (error) {
          setError(handleError(error));
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [
    facetConfigRules,
    categoryId,
    merchandisingRules,
    searchTerm,
    excludedFacets,
  ]);

  return {
    data,
    error,
    isLoading,
    setFacetConfigRules: (facets: RuleSetFacetConfigWithId[]) =>
      setFacetConfigRules(facets),
  };
};
