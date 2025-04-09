import styled from '@emotion/styled';
import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Skeleton } from '@mantine/core';
import { useRouter } from 'next/router';

import type { MerchandisingCountryCode } from '@/libs/api';
import {
  DataTable,
  ErrorMessage,
  Search,
  spacing,
  TablePagination,
} from '@/libs/components';
import { CountryFilterDropdown } from '@/libs/components/dropdowns/country-filter-dropdown/country-filter-dropdown';
import {
  NewButton,
  PageWrapper,
  ToolsContainer,
} from '@/libs/components/utils/shared.styles';
import { updateQueryParams } from '@/libs/hooks/utils/update-query-params';
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
  writeEnabled = true,
}: {
  basePath: string;
  headings: string[];
  mapping: RuleSetMapping<A, T, N>;
  ruleType: 'redirect' | 'searchRanking' | 'categoryRanking' | 'global';
  addNewButtonLabel?: string;
  newRowCreateMode?: 'create-then-redirect' | 'redirect-to-new';
  isDuplicateEnabled?: boolean;
  writeEnabled?: boolean;
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

  const router = useRouter();

  const pageSizes = [10, 20, 50, 100];
  const [currentPageSize, setCurrentPageSize] = useState(pageSizes[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [countryCode, setCountryCode] = useState<
    MerchandisingCountryCode | undefined
  >();

  const [searchInputValue, setSearchInputValue] = useState<string>(
    router.query.searchQuery?.toString() || ''
  );

  useEffect(() => {
    if (router.isReady) {
      const currentPage = Number(router.query.currentPage) || 1;
      const currentPageSize = Number(router.query.currentPageSize) || 10;
      const query = router.query.searchQuery?.toString() || '';

      setSearchInputValue(query);
      setCurrentPage(currentPage);
      setCurrentPageSize(currentPageSize);

      getRows(currentPage, currentPageSize, query, countryCode);
    }
  }, [router.query, router.isReady, getRows, countryCode]);

  const { callback: handleSearch } = useDebounce(
    (e: ChangeEvent<HTMLInputElement>) => {
      updateQueryParams(router, {
        currentPage: 1,
        currentPageSize: Number(router.query.currentPageSize) || 10,
        searchQuery: e.target.value,
      });
    },
    300
  );

  const createNewRuleSet = useCallback(async () => {
    createNewRow(newRowCreateMode);
  }, [createNewRow, newRowCreateMode]);

  const handlePageChange = (page: number, pageSize: number) => {
    updateQueryParams(router, {
      currentPage: page,
      currentPageSize: pageSize,
      searchQuery: router.query.searchQuery?.toString() || '',
    });
  };

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInputValue(value);
    handleSearch(e);
  };

  return (
    <PageWrapper>
      <ToolsContainer>
        <Search value={searchInputValue} onChange={handleSearchInputChange} />
        <CountryFilterDropdown onChange={setCountryCode} />
        {isLoading ? (
          <SkeletonButtonWrapper aria-busy="true">
            <Skeleton height={33} width={110} />
          </SkeletonButtonWrapper>
        ) : (
          writeEnabled && (
            <NewButton onClick={createNewRuleSet}>
              <Link href={''}>{addNewButtonLabel}</Link>
            </NewButton>
          )
        )}
      </ToolsContainer>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <DataTable
        headings={headings}
        rows={rowsState.rows}
        currentPageSize={currentPageSize}
        onDeleteRuleSet={deleteRow}
        onDuplicate={isDuplicateEnabled ? duplicateRow : undefined}
        onToggleRuleSet={toggleRow}
        ruleType={ruleType}
        query={searchInputValue}
        isLoading={isLoading}
        writeEnabled={writeEnabled}
      />

      <TablePagination
        pagination={rowsState.pagination}
        pageSizes={pageSizes}
        handlePageChange={handlePageChange}
        currentPage={currentPage}
        currentPageSize={currentPageSize}
        isLoading={isLoading}
      />
    </PageWrapper>
  );
};
