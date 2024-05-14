import styled from '@emotion/styled';

import { spacing } from '@/libs/components/utils/spacing';
import {
  Heading,
  Button,
  SectionWrapper,
  SectionHeader,
  Search,
  FacetsManagementTable,
} from '@/libs/components';
import { ReturnedFacet } from '@/libs/api';
import { useDebounce, useFacetsFilter } from '@/libs/hooks';

const PageNameLabel = styled.h2`
  margin: ${spacing(3)} ${spacing(2)};
`;

const NewButton = styled.div`
  margin-left: auto;
  margin-top: ${spacing(1)};
  margin-right: ${spacing(2)};
`;

const globalFacet: ReturnedFacet[] = [
  {
    lastChanged: {
      date: '2023-11-15T13:00:00.000Z',
      user: 'testuser',
    },
    displayValue: '*',
    id: '1',
    indexPropertyName: '*',
  },
];

const FacetManagementPage = () => {
  const { setSearch, filteredFacets } = useFacetsFilter(globalFacet);

  const { callback: handleSearch } = useDebounce((val: string) => {
    setSearch(val);
  }, 300);

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
          <Search onChange={(e) => handleSearch(e.target.value)} />

          <NewButton>
            <Button as="a" href="#" disabled={true}>
              Add rule
            </Button>
          </NewButton>
        </SectionHeader>

        <FacetsManagementTable
          facets={filteredFacets}
          editUrl="../../../global/facets/edit"
        />
      </SectionWrapper>
    </>
  );
};

export default FacetManagementPage;
