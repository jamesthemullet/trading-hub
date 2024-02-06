import { useState } from 'react';

import styled from '@emotion/styled';
import type { ReturnedRuleSet } from '../../libs/api';
// import {
//   Button,
//   Dropdown,
//   Heading,
//   Pagination,
//   Rules,
//   Search,
// } from '@onyx/trading-hub/components';

import { spacing } from '@/libs/components/utils/spacing';
import { useRuleSet, useRuleSetDelete } from '@/libs/hooks';
import { Button, Heading, Pagination, Rules, Search } from '@/libs/components';

const PageNameLabel = styled.h2`
  margin: ${spacing(3)} ${spacing(2)};
`;

const NavigationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: ${spacing(4)};
  margin-left: auto;
  margin-right: ${spacing(2)};
  margin-bottom: ${spacing(18)};
  font-weight: 400;
  font-size: 14px;
`;

const PageSizeItem = styled.div`
  padding: ${spacing(1)};
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const ToolsContainer = styled.div`
  display: flex;
  align-items: left;

  margin: ${spacing(2)};
`;

const PageWrapper = styled.div`
  box-shadow: #000 0 0 10px -5px;
  margin: ${spacing(2)};
  padding-top: ${spacing(1)};
  border-radius: 4px;
`;

const NewButton = styled.div`
  margin-left: auto;
  margin-top: ${spacing(1)};
  margin-right: ${spacing(2)};
`;

const TotalResultsLabel = styled.div`
  font-family: mnsLondonRegular, monospace;
  margin-left: 31px;
`;

const RowsPerPageLabel = styled.div``;

const RowsPerPageContainer = styled.div`
  font-family: mnsLondonRegular, monospace;
  display: flex;
  column-gap: 10px;
  justify-content: center;
  align-items: baseline;
  margin-right: 18px;
`;

const RuleSets = () => {
  const pageSizes = [10, 20, 50, 100];
  const [currentPageSize, setCurrentPageSize] = useState(pageSizes[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);
  const [columnIdToSort, setColumnIdToSort] =
    useState<keyof ReturnedRuleSet>('categoryName');
  const [columnSortOrder, setColumnSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentPageIndex = currentPage - 1;

  const { ruleSets, pagination, refetchRuleSetList } = useRuleSet(
    searchQuery,
    currentPageIndex * currentPageSize,
    currentPageSize
  );

  const { handleDelete } = useRuleSetDelete();

  const onDeleteRuleSet = async ({ rulesetId }: { rulesetId: string }) => {
    await handleDelete({ rulesetId });
    refetchRuleSetList();
  };

  return (
    <>
      <Heading
        breadcrumbs={['Search & Merchandising', 'Categories', 'Ranking rules']}
      />

      <PageNameLabel>Category ranking rules</PageNameLabel>
      <PageWrapper>
        <ToolsContainer>
          <Search
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
          />
          <NewButton>
            <Button as="a" href="/rules/new">
              Add rule
            </Button>
          </NewButton>
        </ToolsContainer>
        <Rules
          rules={ruleSets}
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
          onDeleteRuleSet={onDeleteRuleSet}
        />
        <NavigationContainer>
          <TotalResultsLabel>{pagination.totalItems} results</TotalResultsLabel>
          <Pagination
            current={currentPage}
            total={Math.ceil((pagination.totalItems ?? 0) / currentPageSize)}
            onClick={(e, pageNumber) => {
              e.preventDefault();
              setCurrentPage(pageNumber);
            }}
          />
          <RowsPerPageContainer>
            <RowsPerPageLabel>Rows per page</RowsPerPageLabel>
            {/* <Dropdown
              label={`${currentPageSize}`}
              isOpen={isPageSizeOpen}
              onOpen={() => {
                setIsPageSizeOpen(true);
              }}
              onClose={() => {
                setIsPageSizeOpen(false);
              }}
            >
              {pageSizes.map((size) => (
                <PageSizeItem
                  key={size}
                  onClick={() => {
                    setCurrentPageSize(size);
                    setIsPageSizeOpen(false);
                    if (
                      currentPage * size >
                      Math.ceil(pagination.totalItems ?? 0 / size)
                    ) {
                      setCurrentPage(1);
                    }
                  }}
                >
                  {size}
                </PageSizeItem>
              ))}
            </Dropdown> */}
          </RowsPerPageContainer>
        </NavigationContainer>
      </PageWrapper>
    </>
  );
};

export default RuleSets;
