import type { ChangeEvent } from 'react';
import { useEffect, useId, useState } from 'react';
import { Modal } from '@mantine/core';
import { useRouter } from 'next/router';

import type { MerchandisingCountryCode } from '@/libs/api';
import {
  Button,
  CombinedDropdown,
  DropdownVariant,
  ErrorMessage,
  Search,
  TablePagination,
} from '@/libs/components';
import type { RuleSetMapping, RuleTypeFilter } from '@/libs/components/types';
import {
  getNewFacetRoute,
  getNewRulesetRoute,
  ROUTES,
} from '@/libs/constants/routes';
import type { FacetType } from '@/libs/constants/rule-types';
import { RuleType } from '@/libs/constants/rule-types';
import ConfirmationModal from '@/libs/containers/shared/modals/confirmation-modal/confirmation-modal';
import { DataTable } from '@/libs/containers/shared/table/datatable';
import { useDraftRuleset } from '@/libs/hooks';
import { useRuleSetRowsState } from '@/libs/hooks/use-rule-set-rows-state';
import { track } from '@/libs/hooks/utils/analytics';
import { updateQueryParams } from '@/libs/hooks/utils/update-query-params';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import styles from './table-panel.module.css';

export const TablePanel = <
  A extends { pagination: { totalItems?: number } },
  T,
  N extends { isEnabled: boolean },
>({
  basePath,
  headings,
  mapping,
  ruleType,
  facetType,
  writeEnabled,
}: {
  basePath: string;
  headings: string[];
  mapping: RuleSetMapping<A, T, N>;
  ruleType: RuleType;
  facetType?: FacetType;
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
  const [filterRules, setFilterRules] = useState<RuleTypeFilter | undefined>();

  const { clearDraft } = useDraftRuleset();

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

      getRows(currentPage, currentPageSize, query, countryCode, filterRules);
    }
  }, [router.query, router.isReady, getRows, countryCode, filterRules]);

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
    if (ruleType === RuleType.Global) {
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
    <div className={styles.wrapper}>
      <div className={styles.toolsContainer}>
        <Search value={searchInputValue} onChange={handleSearchInputChange} />
        <CombinedDropdown
          variant={DropdownVariant.CountryFilter}
          onChange={(country) =>
            setCountryCode(country as MerchandisingCountryCode)
          }
          ariaLabel="Select country"
        />

        {ruleType !== RuleType.Redirect && (
          <CombinedDropdown
            variant={DropdownVariant.RuleTypeFilter}
            onRuleTypeChange={setFilterRules}
            ariaLabel="Filter by rule type"
          />
        )}

        {writeEnabled && (
          <>
            {ruleType !== RuleType.Redirect && facetType && (
              <div className={styles.buttonGroup}>
                <Button
                  as="a"
                  isInline
                  theme="outlined"
                  icon="plus-simple-green"
                  href={getNewFacetRoute(facetType)}
                  onClick={() => {
                    track({ event: `Add ${ruleType} facet rule` });
                    clearDraft();
                  }}
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
              </div>
            )}
            {ruleType === RuleType.Redirect && (
              <div className={styles.buttonGroup}>
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
              </div>
            )}
          </>
        )}
      </div>

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
          aria-label="Confirmation modal"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
        >
          <ConfirmationModal
            onCloseModal={onCloseModal}
            handleModalConfirm={handleModalConfirm}
            titleId={titleId}
          />
        </Modal.Content>
      </Modal.Root>
    </div>
  );
};
