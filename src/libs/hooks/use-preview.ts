import { useEffect, useState } from 'react';

import type {
  ExcludedFacets,
  MerchandisingRules,
  RuleSetFacetConfigWithId,
  SearchPreviewResponseBeta,
} from '@/libs/api';
import { search } from '@/libs/api';

import { convertCountryCodeToCatalogue } from '../components/utils/convert-country-code-to-catalogue';
import { handleError } from './utils/error';

export const usePreview = ({
  categoryId,
  countryCode,
  facetConfig,
  merchandisingRules,
  searchTerm,
  excludedFacets,
}: {
  countryCode: 'UK' | 'IE';
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
            catalogue: convertCountryCodeToCatalogue(countryCode),
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
    categoryId,
    countryCode,
    excludedFacets,
    facetConfigRules,
    merchandisingRules,
    searchTerm,
  ]);

  return {
    data,
    error,
    isLoading,
    setFacetConfigRules: (facets: RuleSetFacetConfigWithId[]) =>
      setFacetConfigRules(facets),
  };
};
