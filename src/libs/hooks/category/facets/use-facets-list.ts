import { useEffect, useState } from 'react';

import { CountryCode, ReturnedGlobalFacet, search } from '@/libs/api';
import { convertCountryCodeToCatalogues } from '@/libs/components/utils/convert-country-code-to-catalogues';

import { union, uniqBy } from 'lodash';

import { handleError } from '../../utils/error';

export const useFacetsList = ({
  categoryIds,
  enabled,
  emptyListWhenCategoryNotSelected,
  countryCode,
}: {
  categoryIds?: string[];
  enabled: boolean;
  emptyListWhenCategoryNotSelected: boolean;
  countryCode: CountryCode;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [facetsList, setFacetsList] = useState<ReturnedGlobalFacet[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const requestData = async (categoryId?: string[]) => {
      return await search().betaMerchandisingFacetList({
        catalogue: convertCountryCodeToCatalogues(countryCode)[0],
        categoryId,
      });
    };

    const asyncCall = async () => {
      try {
        if (!categoryIds?.length) {
          const response = await requestData();

          return setFacetsList(response.data.facets);
        }
        const responses = await Promise.all(
          categoryIds.map((categoryId) => requestData([categoryId]))
        );

        const facetList = responses.reduce(
          (acc: ReturnedGlobalFacet[], response) => {
            return [...acc, ...response.data.facets];
          },
          []
        );

        const dedupedList = uniqBy(union(facetList), 'id');

        setFacetsList(dedupedList);
      } catch (error) {
        setError(handleError(error));
      } finally {
        setIsLoading(false);
      }
    };

    if (enabled) {
      if (!categoryIds && emptyListWhenCategoryNotSelected) {
        return setFacetsList([]);
      } else {
        setIsLoading(true);
        void asyncCall();
      }
    }
  }, [categoryIds, countryCode, enabled, emptyListWhenCategoryNotSelected]);

  return {
    facets: facetsList,
    isLoading,
    error,
  };
};
