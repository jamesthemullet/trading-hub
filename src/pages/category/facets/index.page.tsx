import styled from '@emotion/styled';
import { useState } from 'react';
import { Skeleton } from '@mantine/core';

import type { ReturnedRuleSet } from '@/libs/api';
import {
  DataTable,
  DataTableSkeleton,
  ErrorMessage,
  Heading,
  Search,
  TablePagination,
  TablePaginationSkeleton,
} from '@/libs/components';
import { color } from '@/libs/components/utils/constants';
import { spacing } from '@/libs/components/utils/spacing';
import { useRuleSet, useRuleSetDelete, useUpdateRuleSet } from '@/libs/hooks';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import Link from 'next/link';

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

  & a {
    color: ${color.focusBlue};
  }
`;

const FacetManagementPage = () => {
  const pageSizes = [10, 20, 50, 100];
  const [currentPageSize, setCurrentPageSize] = useState(pageSizes[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const currentPageIndex = currentPage - 1;

  const {
    categoryRuleSets,
    pagination,
    refetchRuleSetList,
    setCategoryRuleSets,
    error: getRulesetError,
    isLoading,
  } = useRuleSet(
    searchQuery,
    currentPageIndex * currentPageSize,
    currentPageSize,
    'category'
  );

  const sizeIsUnknownYet = pagination.totalItems === 0;

  const { callback: handleSearch } = useDebounce((val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  }, 300);

  const { handleDelete, error: deleteRulesetError } = useRuleSetDelete();

  const { updateRuleSet, error: updateRulesetError } = useUpdateRuleSet();

  const onDeleteRuleSet = async ({ id }: { id: string }) => {
    await handleDelete({ rulesetId: id });

    refetchRuleSetList();
  };

  const onEnableDisableRuleSet = async ({ id }: { id: string }) => {
    const ruleSet = categoryRuleSets.find((ruleSet) => ruleSet.id === id);

    // istanbul ignore next
    if (!ruleSet) return;

    const { facets, isEnabled, rules, categoryId } = ruleSet;
    await updateRuleSet({
      ruleSetId: id,
      rules: {
        facets,
        rules,
        isEnabled: !isEnabled,
      },
      categoryId,
    });
    const updatedRuleSetsList = categoryRuleSets.map(
      (ruleset: ReturnedRuleSet) =>
        ruleset.id === id ? { ...ruleset, isEnabled: !isEnabled } : ruleset
    );
    setCategoryRuleSets(updatedRuleSetsList);
  };

  const headings = ['Identifier', 'Enable', 'Last Changed', 'User', 'Actions'];

  const rows = categoryRuleSets.map(
    ({
      categoryId,
      categoryName,
      id,
      isEnabled,
      lastChanged,
      categoriesInfo,
    }) => ({
      id: id,
      identifier: `${categoryId} | ${categoryName}`,
      isEnabled,
      lastChanged,
      onToggle: onEnableDisableRuleSet,
      url: `/category/facets/edit/${id}`,
      categoryPlpUrl: categoriesInfo.find(
        (category) => category.id === categoryId
      )?.plpUrl,
    })
  );

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

      {getRulesetError && (
        <ErrorMessage>
          Error whilst retrieving ruleset: {getRulesetError}
        </ErrorMessage>
      )}
      {deleteRulesetError && (
        <ErrorMessage>
          Error whilst deleting ruleset: {deleteRulesetError}
        </ErrorMessage>
      )}
      {updateRulesetError && (
        <ErrorMessage>
          Error whilst updating ruleset: {updateRulesetError}
        </ErrorMessage>
      )}

      <PageNameLabel>Category Facet Management</PageNameLabel>
      <PageWrapper>
        <ToolsContainer>
          <Search onChange={(e) => handleSearch(e.target.value)} />
          <NewButton>
            {isLoading ? (
              <Skeleton height={33} width={110} />
            ) : (
              <NewButton>
                <Link href="/category/facets/new">Add new facet</Link>
              </NewButton>
            )}
          </NewButton>
        </ToolsContainer>

        {isLoading ? (
          <DataTableSkeleton headings={headings} rowsCount={10} />
        ) : (
          <DataTable
            headings={headings}
            rows={rows}
            onDeleteRuleSet={onDeleteRuleSet}
          />
        )}

        {isLoading && sizeIsUnknownYet ? (
          <TablePaginationSkeleton />
        ) : (
          <TablePagination
            pagination={pagination}
            pageSizes={pageSizes}
            currentPage={currentPage}
            currentPageSize={currentPageSize}
            setCurrentPage={setCurrentPage}
            setCurrentPageSize={setCurrentPageSize}
          />
        )}
      </PageWrapper>
    </>
  );
};

export default FacetManagementPage;
