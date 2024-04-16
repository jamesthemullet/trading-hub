import styled from '@emotion/styled';

import { spacing } from '@/libs/components/utils/spacing';
import { useFacetsList } from '@/libs/hooks';
import { Heading, Facets, Button } from '@/libs/components';

const PageNameLabel = styled.h2`
  margin: ${spacing(3)} ${spacing(2)};
`;

const PageWrapper = styled.div`
  box-shadow: #000 0 0 10px -5px;
  margin: ${spacing(2)};
  padding-top: ${spacing(1)};
  border-radius: 4px;
`;
const ToolsContainer = styled.div`
  display: flex;
  align-items: left;

  margin: ${spacing(2)};
`;
const NewButton = styled.div`
  margin-left: auto;
  margin-top: ${spacing(1)};
  margin-right: ${spacing(2)};
`;

const FacetManagementPage = () => {
  const { facets } = useFacetsList();

  return (
    <>
      <Heading
        breadcrumbs={[
          'Search & Merchandising',
          'Categories',
          'Global Facet Management',
        ]}
      />

      <PageNameLabel>Global facet management</PageNameLabel>
      <PageWrapper>
        <ToolsContainer>
          <NewButton>
            <Button as="a" href="/global/facets/new">
              Add facet
            </Button>
          </NewButton>
        </ToolsContainer>

        <Facets facets={facets} />
      </PageWrapper>
    </>
  );
};

export default FacetManagementPage;
