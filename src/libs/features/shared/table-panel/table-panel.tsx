import styled from '@emotion/styled';
import type { ChangeEvent } from 'react';
import { useEffect, useId, useState } from 'react';
import { Modal } from '@mantine/core';
import { useRouter } from 'next/router';

import type { MerchandisingCountryCode } from '@/libs/api';
import {
  Button,
  CombinedDropdown,
  ErrorMessage,
  Search,
  TablePagination,
} from '@/libs/components';
import type { RuleSetMapping } from '@/libs/components/types';
import {
  getNewFacetRoute,
  getNewRulesetRoute,
  ROUTES,
} from '@/libs/constants/routes';
import ConfirmationModal from '@/libs/containers/shared/modals/confirmation-modal/confirmation-modal';
import { DataTable } from '@/libs/containers/shared/table/datatable';
import { useRuleSetRowsState } from '@/libs/hooks/use-rule-set-rows-state';
import { track } from '@/libs/hooks/utils/analytics';
import { updateQueryParams } from '@/libs/hooks/utils/update-query-params';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';
import { PageWrapper, ToolsContainer } from '@/libs/utils/shared.styles';
import { spacing } from '@/libs/utils/spacing';

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
  writeEnabled,
}: {
  basePath: string;
  headings: string[];
  mapping: RuleSetMapping<A, T, N>;
  ruleType: 'redirect' | 'searchRanking' | 'categoryRanking' | 'global';
  writeEnabled: boolean;
}) => {
  const {
    getRows,
    deleteRow,
    duplicateRow,
    toggleRow,
    error,
    rowsState,
    isLoading,
  } = useRuleSetRowsState(mapping);

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

  const titleId = useId();
  const descriptionId = useId();

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
            {ruleType !== 'redirect' && (
              <ButtonGroup>
                <Button
                  as="a"
                  isInline
                  theme="outlined"
                  icon="plus-simple-green"
                  href={getNewFacetRoute(ruleType)}
                  onClick={() => track({ event: `Add ${ruleType} facet rule` })}
                >
                  Add facet rule
                </Button>

                <Button
                  as="a"
                  isInline
                  theme="filled"
                  icon="plus-simple-white"
                  href={getNewRulesetRoute(ruleType)}
                  onClick={() =>
                    track({ event: `Add ${ruleType} ranking rule` })
                  }
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
                  href={ROUTES.SEARCH.REDIRECTS.NEW}
                  onClick={() => track({ event: 'Add redirect rule' })}
                >
                  Add redirect rule
                </Button>
              </ButtonGroup>
            )}
          </>
        )}
      </ToolsContainer>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <DataTable
        headings={headings}
        rows={rowsState.rows}
        currentPageSize={currentPageSize}
        onDeleteRuleSet={deleteRow}
        onDuplicate={duplicateRow}
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
      >
        <Modal.Overlay blur={3} />
        <Modal.Content
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
        >
          <ConfirmationModal
            onCloseModal={onCloseModal}
            handleModalConfirm={handleModalConfirm}
            titleId={titleId}
            descriptionId={descriptionId}
          />
        </Modal.Content>
      </Modal.Root>
    </PageWrapper>
  );
};
