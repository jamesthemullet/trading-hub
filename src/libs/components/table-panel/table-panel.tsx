import styled from '@emotion/styled';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Skeleton } from '@mantine/core';

import { CountryCode } from '@/libs/api';
import {
  DataTable,
  DataTableSkeleton,
  ErrorMessage,
  Search,
  spacing,
  TablePagination,
  TablePaginationSkeleton,
} from '@/libs/components';
import { CountryFilterDropdown } from '@/libs/components/dropdowns/country-filter-dropdown/country-filter-dropdown';
import {
  NewButton,
  PageWrapper,
  ToolsContainer,
} from '@/libs/components/utils/shared.styles';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import Link from 'next/link';

import { useRuleSetRowsState } from '../../hooks/use-rule-set-rows-state';
import type { RuleSetMapping } from '../types';

const SkeletonButtonWrapper = styled.div`
  margin-left: auto;
  margin-top: ${spacing(1)};
  margin-right: ${spacing(2)};
`;

export const TablePanel = <
  A extends { pagination: { totalItems?: number } },
  T,
  N extends { isEnabled: boolean },
>({
  basePath,
  headings,
  mapping,
  ruleType,
  addNewButtonLabel = 'Add new rule',
  newRowCreateMode = 'redirect-to-new',
  isDuplicateEnabled = true,
}: {
  basePath: string;
  headings: string[];
  mapping: RuleSetMapping<A, T, N>;
  ruleType: 'redirect' | 'searchRanking' | 'categoryRanking' | 'global';
  addNewButtonLabel?: string;
  newRowCreateMode?: 'create-then-redirect' | 'redirect-to-new';
  isDuplicateEnabled?: boolean;
}) => {
  const {
    getRows,
    deleteRow,
    duplicateRow,
    toggleRow,
    createNewRow,
    error,
    rowsState,
    isLoading,
  } = useRuleSetRowsState(mapping, basePath);

  const pageSizes = [10, 20, 50, 100];
  const [currentPageSize, setCurrentPageSize] = useState(pageSizes[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [countryCode, setCountryCode] = useState<CountryCode | undefined>();
  const currentPageIndex = currentPage - 1;

  const { callback: handleSearch } = useDebounce(
    (e: ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setCurrentPage(1);
    },
    300
  );

  useEffect(() => {
    getRows(
      searchQuery,
      currentPageIndex * currentPageSize,
      currentPageSize,
      countryCode
    );
  }, [searchQuery, currentPageIndex, currentPageSize, countryCode, getRows]);

  const createNewRuleSet = useCallback(async () => {
    createNewRow(newRowCreateMode);
  }, [createNewRow, newRowCreateMode]);

  return (
    <PageWrapper>
      <ToolsContainer>
        <Search onChange={handleSearch} />
        <CountryFilterDropdown onChange={setCountryCode} />
        {isLoading ? (
          <SkeletonButtonWrapper>
            <Skeleton height={33} width={110} />
          </SkeletonButtonWrapper>
        ) : (
          <NewButton onClick={createNewRuleSet}>
            <Link href={''}>{addNewButtonLabel}</Link>
          </NewButton>
        )}
      </ToolsContainer>
      {isLoading && (
        <>
          <DataTableSkeleton headings={headings} rowsCount={currentPageSize} />

          {rowsState.rows.length ? (
            <TablePagination
              pagination={rowsState.pagination}
              pageSizes={pageSizes}
              currentPage={currentPage}
              currentPageSize={currentPageSize}
              setCurrentPage={setCurrentPage}
              setCurrentPageSize={setCurrentPageSize}
            />
          ) : (
            <TablePaginationSkeleton />
          )}
        </>
      )}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <DataTable
        headings={headings}
        rows={rowsState.rows}
        onDeleteRuleSet={deleteRow}
        onDuplicate={isDuplicateEnabled ? duplicateRow : undefined}
        onToggleRuleSet={toggleRow}
        ruleType={ruleType}
      />

      <TablePagination
        pagination={rowsState.pagination}
        pageSizes={pageSizes}
        currentPage={currentPage}
        currentPageSize={currentPageSize}
        setCurrentPage={setCurrentPage}
        setCurrentPageSize={setCurrentPageSize}
      />
    </PageWrapper>
  );
};
