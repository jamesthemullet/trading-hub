import { useState, useMemo } from 'react';
import styled from '@emotion/styled';

import type { ReturnedFacet } from '@/libs/api';
import { useRuleSet } from '@/libs/hooks';

import { spacing } from '@/libs/components/utils/spacing';
import {
  Heading,
  Button,
  FacetsManagementTable,
  TablePagination,
} from '@/libs/components';

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
  const pageSizes = [10, 20, 50, 100];
  const [currentPageSize, setCurrentPageSize] = useState(pageSizes[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery] = useState<string>('');

  const currentPageIndex = currentPage - 1;

  const { ruleSets, pagination } = useRuleSet(
    searchQuery,
    currentPageIndex * currentPageSize,
    currentPageSize
  );

  const facets = useMemo<ReturnedFacet[]>(() => {
    return ruleSets.map(({ id, categoryId, categoryName, lastChanged }) => ({
      displayValue: `${categoryId} | ${categoryName}`,
      indexPropertyName: categoryId,
      lastChanged,
      id,
    }));
  }, [ruleSets]);

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

      <PageNameLabel>Category Facet Management</PageNameLabel>
      <PageWrapper>
        <ToolsContainer>
          <NewButton>
            <Button as="a" href="/facets/new">
              Add facet
            </Button>
          </NewButton>
        </ToolsContainer>

        <FacetsManagementTable
          facets={facets}
          canToggle={true}
          editUrl="../../../facets/edit"
        />

        <TablePagination
          pagination={pagination}
          pageSizes={pageSizes}
          currentPage={currentPage}
          currentPageSize={currentPageSize}
          setCurrentPage={setCurrentPage}
          setCurrentPageSize={setCurrentPageSize}
        />
      </PageWrapper>
    </>
  );
};

export default FacetManagementPage;
