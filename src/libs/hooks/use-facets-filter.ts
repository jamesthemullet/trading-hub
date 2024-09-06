import { useMemo, useState } from 'react';

import { ReturnedFacet } from '../api';

export const useFacetsFilter = (facets: ReturnedFacet[]) => {
  const [search, setSearch] = useState('');

  const filteredFacets = useMemo<ReturnedFacet[]>(() => {
    if (search === '') return facets;

    return facets.filter(
      (facet) =>
        (facet.displayValue && facet.displayValue.includes(search)) ||
        search.includes(facet.indexPropertyName)
    );
  }, [facets, search]);

  return { search, setSearch, filteredFacets };
};
