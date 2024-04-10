import { useState, useMemo } from 'react';

import styled from '@emotion/styled';
import type { ReturnedFacet } from '@/libs/api';

import { spacing } from '@/libs/components/utils/spacing';
import { useFacetsList } from '@/libs/hooks';
import { Heading, Facets } from '@/libs/components';

const PageNameLabel = styled.h2`
  margin: ${spacing(3)} ${spacing(2)};
`;

const PageWrapper = styled.div`
  box-shadow: #000 0 0 10px -5px;
  margin: ${spacing(2)};
  padding-top: ${spacing(1)};
  border-radius: 4px;
`;

const FacetManagementPage = () => {
  const [columnIdToSort, setColumnIdToSort] =
    useState<keyof ReturnedFacet>('displayValue');
  const [columnSortOrder, setColumnSortOrder] = useState<'asc' | 'desc'>('asc');

  const { facets } = useFacetsList();

  const categoryFacets = useMemo<
    (ReturnedFacet & { isEnabled: boolean })[]
  >(() => {
    // check here if facet is enabled for a category
    return facets.map((facet) => ({
      ...facet,
      isEnabled: false,
    }));
  }, [facets]);

  return (
    <>
      <Heading
        breadcrumbs={[
          'Search & Merchandising',
          'Categories',
          'Ranking rules',
          'facet-management',
        ]}
      />

      <PageNameLabel>Category facet management</PageNameLabel>
      <PageWrapper>
        <Facets
          facets={categoryFacets}
          columnSortOrder={columnSortOrder}
          columnOrderName={columnIdToSort}
          onColumnOrderChange={(columnId) => {
            if (columnId === columnIdToSort) {
              setColumnSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
            } else {
              setColumnSortOrder('asc');
            }
            setColumnIdToSort(columnId);
          }}
        />
      </PageWrapper>
    </>
  );
};

export default FacetManagementPage;
