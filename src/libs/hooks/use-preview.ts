import { useEffect, useState } from 'react';

import type {
  MerchandisingExcludedFacets,
  MerchandisingRules,
  MerchandisingRuleSetFacetConfigWithId,
  MerchandisingSearchPreviewResponseBeta,
} from '@/libs/api';
import { search } from '@/libs/api';

import { convertCountryCodeToCatalogues } from '../utils/convert-country-code-to-catalogues';
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
  facetConfig: Array<MerchandisingRuleSetFacetConfigWithId>;
  merchandisingRules: MerchandisingRules;
  categoryId?: string;
  searchTerm?: string;
  excludedFacets?: MerchandisingExcludedFacets;
}): {
  data: MerchandisingSearchPreviewResponseBeta;
  error: string;
  isLoading: boolean;
  setFacetConfigRules: (
    facets: MerchandisingRuleSetFacetConfigWithId[]
  ) => void;
} => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [facetConfigRules, setFacetConfigRules] =
    useState<Array<MerchandisingRuleSetFacetConfigWithId>>(facetConfig);
  const [data, setData] = useState<MerchandisingSearchPreviewResponseBeta>({
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
            catalogue: convertCountryCodeToCatalogues(countryCode)[0],
          },
          {
            rules: merchandisingRules,
            excludedFacets,
            facets: facetConfigRules,
            isEnabled: true,
          }
        );

        const previewData: MerchandisingSearchPreviewResponseBeta =
          searchPreview.data;

        setData(previewData);

        setError('');
        setIsLoading(false);
      } catch (error: unknown) {
        // istanbul ignore else
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
    setFacetConfigRules: (facets: MerchandisingRuleSetFacetConfigWithId[]) =>
      setFacetConfigRules(facets),
  };
};
