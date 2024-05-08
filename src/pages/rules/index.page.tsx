import { useState } from 'react';

import styled from '@emotion/styled';
import type { MerchandisingRules, ReturnedRuleSet } from '../../libs/api';

import { spacing } from '@/libs/components/utils/spacing';
import { useRuleSet, useRuleSetDelete, useUpdateRuleSet } from '@/libs/hooks';
import {
  Button,
  Heading,
  Rulesets,
  Search,
  TablePagination,
} from '@/libs/components';

const PageNameLabel = styled.h2`
  margin: ${spacing(3)} ${spacing(2)};
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

const RuleSets = () => {
  const pageSizes = [10, 20, 50, 100];
  const [currentPageSize, setCurrentPageSize] = useState(pageSizes[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [columnIdToSort, setColumnIdToSort] =
    useState<keyof ReturnedRuleSet>('categoryName');
  const [columnSortOrder, setColumnSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { updateRuleSet } = useUpdateRuleSet();

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

  const onEnableDisableRuleSet = async ({
    ruleSetId,
    isEnabled,
    merchandisingRules,
    categoryId,
  }: {
    categoryId: string;
    isEnabled: boolean;
    merchandisingRules: MerchandisingRules;
    ruleSetId: string;
  }) => {
    await updateRuleSet({
      id: ruleSetId,
      pinnedProducts: merchandisingRules.pinnedProducts,
      categoryId,
      isEnabled,
    });
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
        <Rulesets
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
          onEnableDisableRuleSet={onEnableDisableRuleSet}
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

export default RuleSets;
