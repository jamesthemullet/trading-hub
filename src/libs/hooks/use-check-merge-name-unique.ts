import { useState } from 'react';

import type { MerchandisingCountryCode } from '@/libs/api';
import { search } from '@/libs/api';

import { uniqBy } from 'lodash';

import {
  convertCategoryIdToCatalogue,
  convertCountryCodeToCatalogues,
} from '../components/utils/convert-country-code-to-catalogues';

export const useCheckMergeNameUnique = () => {
  const [error, setError] = useState('');

  const checkMergeNameUnique = async ({
    facetId,
    searchQuery,
    countryCode,
    categories,
    exceptions,
    localAttributeValues = [],
  }: {
    facetId: string;
    searchQuery: string;
    countryCode: MerchandisingCountryCode;
    categories?: string[];
    exceptions?: (string | undefined)[];
    localAttributeValues?: string[];
  }) => {
    try {
      const catalogues = convertCountryCodeToCatalogues(countryCode);
      const promises = categories
        ? categories.map((categoryId) =>
            search()
              .betaMerchandisingFacetAttributeValuesList(facetId, {
                categoryId,
                ...(searchQuery && { q: searchQuery }),
                start: 0,
                rows: 2000,
                catalogue: convertCategoryIdToCatalogue(categoryId),
              })
              .then((response) => response.data.values)
          )
        : catalogues.map((catalogue) =>
            search()
              .betaMerchandisingFacetAttributeValuesList(facetId, {
                ...(searchQuery && { q: searchQuery }),
                start: 0,
                rows: 2000,
                catalogue,
              })
              .then((response) => response.data.values)
          );

      const results = await Promise.all(promises);

      const result = uniqBy(results.flat(), 'displayValue');

      return {
        isUniqueValue: Boolean(
          (!result.some(
            (item) =>
              item.displayValue.trim().toLowerCase() ===
              searchQuery.trim().toLowerCase()
          ) &&
            !localAttributeValues.some(
              (item) =>
                item.trim().toLowerCase() === searchQuery.trim().toLowerCase()
            )) ||
            exceptions?.some(
              (item) =>
                item?.trim().toLowerCase() === searchQuery.trim().toLowerCase()
            )
        ),
      };
    } catch {
      setError('Failed to get Facet Attribute Values');
      return {
        isUniqueValue: false,
      };
    }
  };

  return {
    error,
    checkMergeNameUnique,
  };
};
