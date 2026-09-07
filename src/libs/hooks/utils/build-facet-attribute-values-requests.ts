import type {
  MerchandisingAttributeValuesResponse,
  MerchandisingCountryCode,
} from '@/libs/api';
import { search } from '@/libs/api';

import {
  convertCategoryIdToCatalogue,
  convertCountryCodeToCatalogues,
} from '../../utils/convert-country-code-to-catalogues';

type BuildFacetAttributeValuesRequestsArgs = {
  facetId: string;
  countryCode: MerchandisingCountryCode;
  query: string;
  rows: number;
  categories?: string[];
  searchTerms?: string[];
};

// Fans a facet attribute values request out into one request per category
// (when categories are supplied) or one request per catalogue derived from
// the country code otherwise. This "fan out by category, else by catalogue"
// pattern is shared by hooks that fetch facet attribute values scoped to
// either a category ruleset or a whole country.
export const buildFacetAttributeValuesRequests = ({
  facetId,
  countryCode,
  query,
  rows,
  categories,
  searchTerms,
}: BuildFacetAttributeValuesRequestsArgs): Promise<
  MerchandisingAttributeValuesResponse['values']
>[] => {
  if (categories) {
    return categories.map((categoryId) =>
      search()
        .getFacetAttributeValues(facetId, {
          categoryId,
          ...(query && { q: query }),
          start: 0,
          rows,
          catalogue: convertCategoryIdToCatalogue(categoryId),
        })
        .then((response) => response.data.values)
    );
  }

  const catalogues = convertCountryCodeToCatalogues(countryCode);

  return catalogues.map((catalogue) =>
    search()
      .getFacetAttributeValues(facetId, {
        ...(query && { q: query }),
        start: 0,
        rows,
        catalogue,
        ...(searchTerms && { searchTerm: searchTerms }),
      })
      .then((response) => response.data.values)
  );
};
