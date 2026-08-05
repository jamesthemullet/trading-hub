import { useMemo, useState } from 'react';

import type { FacetRowDisplayValue } from '@/types/facets';

export const useFacetsFilter = (
  facets: FacetRowDisplayValue[]
): {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  filteredFacets: FacetRowDisplayValue[];
} => {
  const [search, setSearch] = useState('');

  const filteredFacets = useMemo<FacetRowDisplayValue[]>(() => {
    if (search === '') return facets;

    const searchLower = search.toLowerCase();
    return facets.filter(
      (facet) =>
        facet.displayValue?.toLowerCase().includes(searchLower) ||
        facet.indexPropertyName.toLowerCase().includes(searchLower)
    );
  }, [facets, search]);

  return { search, setSearch, filteredFacets };
};
