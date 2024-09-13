import { useMemo, useState } from 'react';

import { ReturnedFacet } from '../api';

export const useFacetsFilter = (facets: ReturnedFacet[]) => {
  const [search, setSearch] = useState('');

  const filteredFacets = useMemo<ReturnedFacet[]>(() => {
    if (search === '') return facets;

    return facets.filter(
      (facet) =>
        (facet.displayValue &&
          facet.displayValue.toLowerCase().includes(search.toLowerCase())) ||
        search.toLowerCase().includes(facet.indexPropertyName.toLowerCase())
    );
  }, [facets, search]);

  return { search, setSearch, filteredFacets };
};
