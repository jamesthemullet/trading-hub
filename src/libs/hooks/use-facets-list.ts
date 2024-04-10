import { useEffect, useState } from 'react';

import { ReturnedFacet } from '@/libs/api';
import { useFacetsListMockData } from './data/mock-use-facets-list';

export type CategoryFacetsList = {
  facets: ReturnedFacet[]
}

export const useFacetsList = (
  categoryIds?: string[],
) => {
  const [facets, setFacets] = useState<CategoryFacetsList>({
    facets: []
  });

  useEffect(() => {
    if (!categoryIds) {
      setFacets(useFacetsListMockData)
    }
  }, [categoryIds]);

  return {
    facets: facets.facets,
  };
};
