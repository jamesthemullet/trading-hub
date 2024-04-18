import { useMemo, useState } from 'react';
import styled from '@emotion/styled';

import { spacing } from '@/libs/components/utils/spacing';
import { useFacetsList } from '@/libs/hooks';
import {
  Heading,
  Facets,
  Button,
  SectionWrapper,
  SectionHeader,
  Search,
} from '@/libs/components';
import { ReturnedFacet } from '@/libs/api';

const PageNameLabel = styled.h2`
  margin: ${spacing(3)} ${spacing(2)};
`;

const NewButton = styled.div`
  margin-left: auto;
  margin-top: ${spacing(1)};
  margin-right: ${spacing(2)};
`;

const FacetManagementPage = () => {
  const { facets } = useFacetsList();
  const [search, setSearch] = useState('');

  const filteredFacets = useMemo<ReturnedFacet[]>(() => {
    if (search === '') return facets;

    return facets.filter((facet) => facet.displayValue.includes(search));
  }, [facets, search]);

  return (
    <>
      <Heading
        breadcrumbs={[
          'Search & Merchandising',
          'Categories',
          'Global Facet Management',
        ]}
      />

      <PageNameLabel>Global Facet Management</PageNameLabel>
      <SectionWrapper>
        <SectionHeader>
          <Search
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />

          <NewButton>
            <Button as="a" href="/global/facets/new">
              Add facet
            </Button>
          </NewButton>
        </SectionHeader>

        <Facets facets={filteredFacets} />
      </SectionWrapper>
    </>
  );
};

export default FacetManagementPage;
