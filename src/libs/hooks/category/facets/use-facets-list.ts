import { useCallback, useEffect, useState } from 'react';

import type {
  GetMerchandisingAttributesParamsCatalogueEnum,
  MerchandisingCountryCode,
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';
import { search } from '@/libs/api';
import { handleError } from '@/libs/hooks/utils/error';
import { convertCountryCodeToCatalogues } from '@/libs/utils/convert-country-code-to-catalogues';

import uniqBy from 'lodash/uniqBy';

export const useFacetsList = ({
  query,
  queryBy,
  enabled,
  countryCode,
}: {
  query: string[];
  queryBy: 'categoryIds' | 'searchTerms';
  enabled: boolean;
  countryCode: MerchandisingCountryCode;
}): {
  facets: MerchandisingReturnedGlobalFacet[];
  isLoading: boolean;
  error: string;
} => {
  const [isLoading, setIsLoading] = useState(false);
  const [facetsList, setFacetsList] = useState<
    MerchandisingReturnedGlobalFacet[]
  >([]);
  const [error, setError] = useState('');

  const requestData = useCallback(
    async (
      query: string[],
      catalogue: GetMerchandisingAttributesParamsCatalogueEnum,
      queryBy: 'categoryIds' | 'searchTerms'
    ) => {
      if (queryBy === 'searchTerms') {
        const response = await search().getGlobalFacets({
          catalogue,
          searchTerm: query,
        });
        return response.data.facets;
      } else {
        const categoriesToFetch = query.map((categoryId) => {
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
              const response = await search().getGlobalFacets({
                catalogue,
                categoryId: [query[index]],
              });
              return response.data.facets;
            }
            return [];
          })
        );

        return results.flat();
      }
    },
    []
  );

  const asyncCall = useCallback(
    async (
      query: string[],
      country: MerchandisingCountryCode,
      queryBy: 'categoryIds' | 'searchTerms'
    ) => {
      try {
        const catalogues = convertCountryCodeToCatalogues(country);

        const responses = await Promise.all(
          catalogues.map((catalogue) => requestData(query, catalogue, queryBy))
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

  // stringifying the query to use as a dependency as array causes 10+ rerenders inside test
  const queryJSON = JSON.stringify(query);
  useEffect(() => {
    const parsedQuery = JSON.parse(queryJSON);
    if (enabled && parsedQuery && parsedQuery.length !== 0) {
      setIsLoading(true);
      void asyncCall(parsedQuery, countryCode, queryBy);
    }
    return () => {};
  }, [queryJSON, queryBy, countryCode, enabled, asyncCall]);

  return {
    facets: facetsList,
    isLoading,
    error,
  };
};
