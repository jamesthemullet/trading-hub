import { useState } from 'react';

import type { MerchandisingCountryCode } from '@/libs/api';

import uniqBy from 'lodash/uniqBy';

import { buildFacetAttributeValuesRequests } from './utils/build-facet-attribute-values-requests';

export const MAX_FACET_ATTRIBUTE_ROWS = 1000;

export const useCheckMergeNameUnique = (): {
  error: string;
  checkMergeNameUnique: (args: {
    facetId: string;
    searchQuery: string;
    countryCode: MerchandisingCountryCode;
    categories?: string[];
    exceptions?: (string | undefined)[];
    localAttributeValues?: string[];
  }) => Promise<{ isUniqueValue: boolean; error: string | undefined }>;
} => {
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
      const promises = buildFacetAttributeValuesRequests({
        facetId,
        countryCode,
        query: searchQuery,
        rows: MAX_FACET_ATTRIBUTE_ROWS,
        categories,
      });

      const results = await Promise.all(promises);

      const result = uniqBy(results.flat(), 'displayValue');

      setError('');
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
        error: undefined,
      };
    } catch {
      const message = 'Failed to get Facet Attribute Values';
      setError(message);
      return {
        isUniqueValue: false,
        error: message,
      };
    }
  };

  return {
    error,
    checkMergeNameUnique,
  };
};
