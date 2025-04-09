import { useEffect, useState } from 'react';

import type {
  MerchandisingAttributeValuesResponse,
  MerchandisingCountryCode,
} from '@/libs/api';
import { search } from '@/libs/api';

import { uniqBy } from 'lodash';

import {
  convertCategoryIdToCatalogue,
  convertCountryCodeToCatalogues,
} from '../components/utils/convert-country-code-to-catalogues';
import { handleError } from './utils/error';

type Props = {
  countryCode: MerchandisingCountryCode;
  facetId: string;
  query: string;
  categories?: string[];
};

export const useGetFacetAttributeValues = ({
  countryCode,
  facetId,
  categories,
  query,
}: Props) => {
  const [attributeValues, setAttributeValues] = useState<
    MerchandisingAttributeValuesResponse['values']
  >([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const asyncCall = async () => {
      setIsLoading(true);
      try {
        const catalogues = convertCountryCodeToCatalogues(countryCode);
        const promises = categories
          ? categories.map((categoryId) =>
              search()
                .betaMerchandisingFacetAttributeValuesList(facetId, {
                  categoryId,
                  ...(query && { q: query }),
                  start: 0,
                  rows: 2000,
                  catalogue: convertCategoryIdToCatalogue(categoryId),
                })
                .then((response) => response.data.values)
            )
          : catalogues.map((catalogue) =>
              search()
                .betaMerchandisingFacetAttributeValuesList(facetId, {
                  ...(query && { q: query }),
                  start: 0,
                  rows: 2000,
                  catalogue,
                })
                .then((response) => response.data.values)
            );

        const results = await Promise.all(promises);

        setAttributeValues(uniqBy(results.flat(), 'displayValue'));
        setIsLoading(false);
      } catch (error) {
        setError(handleError(error));
        setIsLoading(false);
      }
    };
    void asyncCall();
  }, [facetId, categories, query, countryCode]);

  return {
    attributeValues,
    error,
    isLoading,
  };
};
