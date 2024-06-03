import { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { Modal } from '@mantine/core';

import type { ReturnedFacet } from '@/libs/api';
import { useDebounce, useRuleSet, useRuleSetDelete } from '@/libs/hooks';

import { spacing } from '@/libs/components/utils/spacing';
import {
  Heading,
  Button,
  FacetsManagementTable,
  TablePagination,
  Title,
  Search,
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
const Divider = styled.span`
  border-bottom: solid 1px #000;
  width: 100%;
  display: inline-block;
`;

const Buttons = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: right;

  button {
    width: auto;
    margin-left: ${spacing(2)};
  }
`;

const FacetManagementPage = () => {
  const pageSizes = [10, 20, 50, 100];
  const [currentPageSize, setCurrentPageSize] = useState(pageSizes[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [facetIdToDelete, setFacetIdToDelete] = useState('');

  const currentPageIndex = currentPage - 1;

  const { ruleSets, pagination, refetchRuleSetList } = useRuleSet(
    searchQuery,
    currentPageIndex * currentPageSize,
    currentPageSize
  );

  const { callback: handleSearch } = useDebounce((val: string) => {
    setSearchQuery(val);
  }, 300);

  const { handleDelete } = useRuleSetDelete();

  const handleDeleteFacet = (facetId: string) => {
    setFacetIdToDelete(facetId);
    setIsOpen(true);
  };
  const onDeleteFacet = async () => {
    await handleDelete({ rulesetId: facetIdToDelete });

    setIsOpen(false);
    setFacetIdToDelete('');
    refetchRuleSetList();
  };

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
          <Search onChange={(e) => handleSearch(e.target.value)} />

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
          canDelete
          onDeleteFacet={handleDeleteFacet}
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

      <Modal.Root
        centered
        opened={isOpen}
        onClose={
          // istanbul ignore next
          () => setIsOpen(false)
        }
        padding={10}
      >
        <Modal.Overlay blur={3} />
        <Modal.Content>
          <Modal.Body>
            <Title>Delete facet rule?</Title>

            <Divider />

            <Buttons>
              <Button onClick={() => setIsOpen(false)}>Cancel</Button>

              <Button
                onClick={onDeleteFacet}
                theme="primary"
                aria-label="delete-facet"
              >
                Delete
              </Button>
            </Buttons>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </>
  );
};

export default FacetManagementPage;
