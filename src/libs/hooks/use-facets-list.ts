import { useEffect, useState } from 'react';

import { ReturnedFacet } from '@/libs/api';
import { useFacetsListMockData } from './data/mock-use-facets-list';

export type CategoryFacetsList = {
  facets: ReturnedFacet[];
};

export const useFacetsList = (categoryIds?: string[]) => {
  const [facetsList, setFacetsList] = useState<CategoryFacetsList>({
    facets: [],
  });

  useEffect(() => {
    if (!categoryIds) {
      setFacetsList(useFacetsListMockData);
    }
  }, [categoryIds]);

  return {
    facets: facetsList.facets,
  };
};
