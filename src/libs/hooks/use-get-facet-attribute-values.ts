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
} from '../utils/convert-country-code-to-catalogues';
import { handleError } from './utils/error';

type Props = {
  countryCode?: MerchandisingCountryCode;
  facetId: string;
  query: string;
  categories?: string[];
  searchTerms?: string[];
};

export const useGetFacetAttributeValues = ({
  countryCode,
  facetId,
  categories,
  searchTerms,
  query,
}: Props) => {
  const [attributeValues, setAttributeValues] = useState<
    MerchandisingAttributeValuesResponse['values']
  >([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const categoriesKey = categories?.join(',');
  const searchTermsKey = searchTerms?.join(',');

  useEffect(() => {
    if (!facetId) {
      setAttributeValues([]);
      setError('');
      setIsLoading(false);
      return;
    }
    const asyncCall = async () => {
      setIsLoading(true);
      try {
        if (!countryCode) {
          throw new Error('Invalid or missing country code parameter');
        }
        const catalogues = convertCountryCodeToCatalogues(countryCode);

        const promises = categories
          ? categories.map((categoryId) =>
              search()
                .betaMerchandisingFacetAttributeValuesList(facetId, {
                  categoryId,
                  ...(query && { q: query }),
                  start: 0,
                  rows: 500,
                  catalogue: convertCategoryIdToCatalogue(categoryId),
                })
                .then((response) => response.data.values)
            )
          : catalogues.map((catalogue) =>
              search()
                .betaMerchandisingFacetAttributeValuesList(facetId, {
                  ...(query && { q: query }),
                  start: 0,
                  rows: 500,
                  catalogue,
                  searchTerm: searchTerms,
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
    // adding categories and searchTerms causes infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facetId, countryCode, query, categoriesKey, searchTermsKey]);

  return {
    attributeValues,
    error,
    isLoading,
  };
};
