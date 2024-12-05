import { useCallback, useEffect, useState } from 'react';

import {
  BetaMerchandisingAttributesListParamsCatalogueEnum,
  CountryCode,
  ReturnedGlobalFacet,
  search,
} from '@/libs/api';
import { convertCountryCodeToCatalogues } from '@/libs/components/utils/convert-country-code-to-catalogues';

import { uniqBy } from 'lodash';

import { handleError } from '../../utils/error';

export const useFacetsList = ({
  categoryIds,
  enabled,
  countryCode,
}: {
  categoryIds: string[];
  enabled: boolean;
  countryCode: CountryCode;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [facetsList, setFacetsList] = useState<ReturnedGlobalFacet[]>([]);
  const [error, setError] = useState('');

  const requestData = useCallback(
    async (
      categories: string[],
      catalogue: BetaMerchandisingAttributesListParamsCatalogueEnum
    ) => {
      const categoriesToFetch = categories.map((categoryId) => {
        switch (catalogue) {
          case 'MANDSIE':
            return categoryId.includes('IE_');
          case 'MANDSUK':
          default:
            return !categoryId.includes('IE_');
        }
      });

      const results = await Promise.all(
        categoriesToFetch.map(async (shouldFetch, index) => {
          if (shouldFetch) {
            const response = await search().betaMerchandisingFacetList({
              catalogue,
              categoryId: [categories[index]],
            });

            return response.data.facets;
          }
          return [];
        })
      );

      return results.flat();
    },
    []
  );

  const asyncCall = useCallback(
    async (categories: string[], country: CountryCode) => {
      try {
        const catalogues = convertCountryCodeToCatalogues(country);

        const responses = await Promise.all(
          catalogues.map((catalogue) => requestData(categories, catalogue))
        );

        const dedupedList = uniqBy(responses.flat(), 'displayValue');

        setFacetsList(dedupedList);
      } catch (error) {
        setFacetsList([]);
        setError(handleError(error));
      } finally {
        setIsLoading(false);
      }
    },
    [requestData]
  );

  useEffect(() => {
    if (enabled && categoryIds.length !== 0) {
      setIsLoading(true);
      void asyncCall(categoryIds, countryCode);
    }
    return () => {};
  }, [categoryIds, countryCode, enabled, asyncCall]);

  return {
    facets: facetsList,
    isLoading,
    error,
  };
};
