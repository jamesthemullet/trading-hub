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
  query,
  queryBy,
  enabled,
  countryCode,
}: {
  query: string[];
  queryBy: 'categoryIds' | 'searchTerms';
  enabled: boolean;
  countryCode: CountryCode;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [facetsList, setFacetsList] = useState<ReturnedGlobalFacet[]>([]);
  const [error, setError] = useState('');

  const requestData = useCallback(
    async (
      query: string[],
      catalogue: BetaMerchandisingAttributesListParamsCatalogueEnum,
      queryBy: 'categoryIds' | 'searchTerms'
    ) => {
      if (queryBy === 'searchTerms') {
        const response = await search().betaMerchandisingFacetList({
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
              const response = await search().betaMerchandisingFacetList({
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
      country: CountryCode,
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
