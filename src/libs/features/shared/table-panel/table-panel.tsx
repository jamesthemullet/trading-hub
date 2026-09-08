import type { ChangeEvent, ReactElement } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import type { MerchandisingCountryCode } from '@/libs/api';
import {
  CombinedDropdown,
  DropdownVariant,
  ErrorMessage,
  Search,
  TablePagination,
} from '@/libs/components';
import { useFavouriteRulesetsFlag } from '@/libs/components/feature-flag/feature-flag';
import { RulesetDiffModal } from '@/libs/components/ruleset-diff-modal/ruleset-diff-modal';
import type { RuleSetMapping, RuleTypeFilter } from '@/libs/components/types';
import { RuleType } from '@/libs/constants/rule-types';
import { DataTable } from '@/libs/containers/shared/table/datatable';
import {
  getStoredFavourites,
  removeFavourite,
  toggleFavourite,
} from '@/libs/hooks/use-favourite-rulesets';
import type { PageSize } from '@/libs/hooks/use-rows-per-page-setting';
import {
  DEFAULT_PAGE_SIZE,
  getStoredRowsPerPage,
  PAGE_SIZES,
} from '@/libs/hooks/use-rows-per-page-setting';
import { useRuleSetRowsState } from '@/libs/hooks/use-rule-set-rows-state';
import type { DiffItem } from '@/libs/hooks/use-ruleset-diff';
import { DEBOUNCE_DELAY_MS } from '@/libs/hooks/utils/constants';
import { createDiffItem } from '@/libs/hooks/utils/diff';
import { updateQueryParams } from '@/libs/hooks/utils/update-query-params';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';
import { getRulesetType } from '@/libs/utils/ruleset-type';

import styles from './table-panel.module.css';

const pageSizes = [...PAGE_SIZES];
const FAVOURITES_PERSISTENCE_ERROR =
  'Unable to save favourite rulesets in this browser session.';

const isPageSize = (value: number): value is PageSize =>
  (pageSizes as number[]).includes(value);

export const TablePanel = <
  RuleSetListResponse extends { pagination: { totalItems?: number } },
  ReturnedRuleSet extends RuleSetListItem,
  RuleSetPayload extends { isEnabled: boolean },
  RuleSetListItem = ReturnedRuleSet,
>({
  basePath,
  headings,
  mapping,
  ruleType,
  isWriteEnabled,
}: {
  basePath: string;
  headings: string[];
  mapping: RuleSetMapping<
    RuleSetListResponse,
    ReturnedRuleSet,
    RuleSetPayload,
    RuleSetListItem
  >;
  ruleType: RuleType;
  isWriteEnabled: boolean;
}): ReactElement => {
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

  const [currentPageSize, setCurrentPageSize] =
    useState<PageSize>(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idToUpdate, setIdToUpdate] = useState<string>('');
  const [countryCode, setCountryCode] = useState<
    MerchandisingCountryCode | undefined
  >();
  const [filterRules, setFilterRules] = useState<RuleTypeFilter | undefined>();

  const isFavouriteRulesetsEnabled = useFavouriteRulesetsFlag();
  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);
  const [favouritesError, setFavouritesError] = useState('');

  const handleToggleFavourite = useCallback(
    (id: string) => {
      const row = rowsState.rows.find((r) => r.id === id);
      /* istanbul ignore next */
      if (!row) return;
      const isFavouriteToggled = toggleFavourite({
        id: row.id,
        label: row.identifier,
        url: row.url,
        type: getRulesetType(ruleType),
      });
      if (!isFavouriteToggled) {
        setFavouritesError(FAVOURITES_PERSISTENCE_ERROR);
        return;
      }
      setFavouritesError('');
      setFavouriteIds(getStoredFavourites().map((r) => r.id));
    },
    [rowsState.rows, ruleType]
  );

  const [searchInputValue, setSearchInputValue] = useState<string>(
    router.query.searchQuery?.toString() ?? ''
  );

  useEffect(() => {
    setFavouriteIds(getStoredFavourites().map((r) => r.id));
  }, []);

  useEffect(() => {
    if (router.isReady) {
      const currentPage = Number(router.query.currentPage) || 1;
      const parsed = Number(router.query.currentPageSize);
      const currentPageSize = isPageSize(parsed)
        ? parsed
        : getStoredRowsPerPage();
      const query = router.query.searchQuery?.toString() ?? '';

      setSearchInputValue(query);
      setCurrentPage(currentPage);
      setCurrentPageSize(currentPageSize);

      getRows(currentPage, currentPageSize, query, countryCode, filterRules);
    }
  }, [router.query, router.isReady, getRows, countryCode, filterRules]);

  const { callback: handleSearch } = useDebounce(
    (e: ChangeEvent<HTMLInputElement>) => {
      const parsed = Number(router.query.currentPageSize);
      const pageSize = isPageSize(parsed) ? parsed : getStoredRowsPerPage();
      updateQueryParams(router, {
        currentPage: 1,
        currentPageSize: pageSize,
        searchQuery: e.target.value,
      });
    },
    DEBOUNCE_DELAY_MS
  );

  const handlePageChange = (page: number, pageSize: number) => {
    updateQueryParams(router, {
      currentPage: page,
      currentPageSize: pageSize,
      searchQuery: router.query.searchQuery?.toString() ?? '',
    });
  };

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInputValue(value);
    handleSearch(e);
  };

  const onToggleRow = ({ id }: { id: string }) => {
    setIsModalOpen(true);
    setIdToUpdate(id);
  };

  const onCloseModal = () => setIsModalOpen(false);

  const handleModalConfirm = async () => {
    setIsModalOpen(false);
    toggleRow({ id: idToUpdate });
  };

  const rowToToggle = rowsState.rows.find((row) => row.id === idToUpdate);
  const toggleDiffItems: DiffItem[] = rowToToggle
    ? [
        createDiffItem(
          'changed',
          'Status',
          `${rowToToggle.identifier}: ${
            rowToToggle.isEnabled ? 'Enabled' : 'Disabled'
          } → ${rowToToggle.isEnabled ? 'Disabled' : 'Enabled'}`
        ),
      ]
    : [];

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolsContainer}>
        <Search value={searchInputValue} onChange={handleSearchInputChange} />
        <CombinedDropdown
          variant={DropdownVariant.CountryFilter}
          onChange={(country) =>
            setCountryCode(country as MerchandisingCountryCode)
          }
          ariaLabel="Filter by country"
        />

        {ruleType !== RuleType.Redirect && (
          <CombinedDropdown
            variant={DropdownVariant.RuleTypeFilter}
            onRuleTypeChange={setFilterRules}
            ariaLabel="Filter by rule type"
          />
        )}
      </div>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {favouritesError && <ErrorMessage>{favouritesError}</ErrorMessage>}

      <DataTable
        headings={headings}
        rows={rowsState.rows}
        currentPageSize={currentPageSize}
        onDeleteRuleSet={({ id }) => {
          void (async () => {
            const isDeleted = await deleteRow({ id });
            if (!isDeleted) return;
            const isFavouriteRemoved = removeFavourite(id);
            if (!isFavouriteRemoved) {
              setFavouritesError(FAVOURITES_PERSISTENCE_ERROR);
              return;
            }
            setFavouritesError('');
            setFavouriteIds(getStoredFavourites().map((r) => r.id));
          })();
        }}
        onDuplicate={duplicateRow}
        onToggleRuleSet={onToggleRow}
        ruleType={ruleType}
        query={searchInputValue}
        isLoading={isLoading}
        isWriteEnabled={isWriteEnabled}
        basePath={basePath}
        onToggleFavourite={
          isFavouriteRulesetsEnabled ? handleToggleFavourite : undefined
        }
        favouriteIds={isFavouriteRulesetsEnabled ? favouriteIds : undefined}
      />

      <TablePagination
        pagination={rowsState.pagination}
        pageSizes={pageSizes}
        handlePageChange={handlePageChange}
        currentPage={currentPage}
        currentPageSize={currentPageSize}
        isLoading={isLoading}
      />
      <RulesetDiffModal
        isOpen={isModalOpen}
        diffItems={toggleDiffItems}
        onConfirm={() => {
          void handleModalConfirm();
        }}
        onCancel={onCloseModal}
        shouldShowGlobalWarning={ruleType === RuleType.Global}
      />
    </div>
  );
};
