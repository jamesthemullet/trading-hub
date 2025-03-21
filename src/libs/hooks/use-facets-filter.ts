import { useMemo, useState } from 'react';

import type { FacetRowDisplayValue } from '../modules/facets-panel/facets-panel-reducer';

export const useFacetsFilter = (facets: FacetRowDisplayValue[]) => {
  const [search, setSearch] = useState('');

  const filteredFacets = useMemo<FacetRowDisplayValue[]>(() => {
    if (search === '') return facets;

    return facets.filter(
      (facet) =>
        facet.displayValue?.toLowerCase().includes(search.toLowerCase()) ||
        facet.indexPropertyName.toLowerCase().includes(search.toLowerCase())
    );
  }, [facets, search]);

  return { search, setSearch, filteredFacets };
};
