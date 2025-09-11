import styled from '@emotion/styled';
import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Modal } from '@mantine/core';
import { useRouter } from 'next/router';

import type { MerchandisingCountryCode } from '@/libs/api';
import {
  Button,
  CombinedDropdown,
  DataTable,
  ErrorMessage,
  Search,
  spacing,
  TablePagination,
} from '@/libs/components';
import {
  PageWrapper,
  ToolsContainer,
} from '@/libs/components/utils/shared.styles';
import { track } from '@/libs/hooks/utils/analytics';
import { updateQueryParams } from '@/libs/hooks/utils/update-query-params';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import { useRuleSetRowsState } from '../../hooks/use-rule-set-rows-state';
import ConfirmationModal from '../modals/confirmation-modal/confirmation-modal';
import type { RuleSetMapping } from '../types';

const ButtonGroup = styled.div`
  width: 410px;
  display: flex;
  margin-left: auto;
  gap: ${spacing(2)};
  justify-content: end;
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
  newRowCreateMode = 'redirect-to-new',
  isDuplicateEnabled = true,
  writeEnabled,
}: {
  basePath: string;
  headings: string[];
  mapping: RuleSetMapping<A, T, N>;
  ruleType: 'redirect' | 'searchRanking' | 'categoryRanking' | 'global';
  newRowCreateMode?: 'create-then-redirect' | 'redirect-to-new';
  isDuplicateEnabled?: boolean;
  writeEnabled: boolean;
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idToUpdate, setIdToUpdate] = useState<string>('');
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

  const createNewRuleSet = useCallback(
    async (path: string) => {
      createNewRow(path, newRowCreateMode);
    },
    [createNewRow, newRowCreateMode]
  );

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

  const onToggleRow = ({ id }: { id: string }) => {
    if (ruleType === 'global') {
      setIsModalOpen(true);
      setIdToUpdate(id);
    } else {
      toggleRow({ id });
    }
  };

  const onCloseModal = () => setIsModalOpen(false);

  const handleModalConfirm = async () => {
    setIsModalOpen(false);
    toggleRow({ id: idToUpdate });
  };

  const linkConfig = {
    categoryRanking: 'category',
    searchRanking: 'search',
    global: 'global',
  };

  return (
    <PageWrapper>
      <ToolsContainer>
        <Search value={searchInputValue} onChange={handleSearchInputChange} />
        <CombinedDropdown
          variant="countryFilter"
          onChange={(country) =>
            setCountryCode(country as MerchandisingCountryCode)
          }
          ariaLabel="Select country"
        />

        {writeEnabled && (
          <>
            {(ruleType === 'categoryRanking' ||
              ruleType === 'searchRanking') && (
              <ButtonGroup>
                <Button
                  as="a"
                  isInline
                  theme="outlined"
                  icon="plus-simple-green"
                  href={`/${linkConfig[ruleType]}/facets/new`}
                  onClick={() => track({ event: `Add ${ruleType} facet rule` })}
                >
                  Add facet rule
                </Button>

                <Button
                  as="a"
                  isInline
                  theme="filled"
                  icon="plus-simple-white"
                  href={`/${linkConfig[ruleType]}/rulesets/new`}
                  onClick={() =>
                    track({ event: `Add ${ruleType} ranking rule` })
                  }
                >
                  Add ranking rule
                </Button>
              </ButtonGroup>
            )}
            {ruleType === 'global' && (
              <ButtonGroup>
                <Button
                  as="button"
                  isInline
                  theme="outlined"
                  icon="plus-simple-green"
                  onClick={() => {
                    createNewRuleSet('facets');
                    track({ event: 'Add global facet rule' });
                  }}
                >
                  Add facet rule
                </Button>

                <Button
                  as="button"
                  isInline
                  theme="filled"
                  icon="plus-simple-white"
                  onClick={() => {
                    createNewRuleSet('rulesets');
                    track({ event: 'Add global ranking rule' });
                  }}
                >
                  Add ranking rule
                </Button>
              </ButtonGroup>
            )}
            {ruleType === 'redirect' && (
              <ButtonGroup>
                <Button
                  as="a"
                  isInline
                  theme="filled"
                  icon="plus-simple-white"
                  href="/search/redirects/new"
                  onClick={() => track({ event: 'Add redirect rule' })}
                >
                  Add redirect rule
                </Button>
              </ButtonGroup>
            )}
          </>
        )}
      </ToolsContainer>

      {error && <ErrorMessage role="alert">{error}</ErrorMessage>}

      <DataTable
        headings={headings}
        rows={rowsState.rows}
        currentPageSize={currentPageSize}
        onDeleteRuleSet={deleteRow}
        onDuplicate={isDuplicateEnabled ? duplicateRow : undefined}
        onToggleRuleSet={onToggleRow}
        ruleType={ruleType}
        query={searchInputValue}
        isLoading={isLoading}
        writeEnabled={writeEnabled}
        basePath={basePath}
      />

      <TablePagination
        pagination={rowsState.pagination}
        pageSizes={pageSizes}
        handlePageChange={handlePageChange}
        currentPage={currentPage}
        currentPageSize={currentPageSize}
        isLoading={isLoading}
      />
      <Modal.Root
        centered
        opened={isModalOpen}
        onClose={onCloseModal}
        padding={10}
        role="dialog"
        aria-modal="true"
      >
        <Modal.Overlay blur={3} />
        <Modal.Content>
          <ConfirmationModal
            onCloseModal={onCloseModal}
            handleModalConfirm={handleModalConfirm}
          />
        </Modal.Content>
      </Modal.Root>
    </PageWrapper>
  );
};
