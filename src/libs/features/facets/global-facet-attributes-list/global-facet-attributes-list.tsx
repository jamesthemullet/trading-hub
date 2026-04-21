import type { ActionDispatch, Dispatch, SetStateAction } from 'react';
import { useCallback, useMemo } from 'react';

import type {
  MerchandisingAttributeValuesResponse,
  MerchandisingCountryCode,
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';
import {
  Checkbox,
  FilteredResultsPanel,
  Loader,
  Typography,
} from '@/libs/components';
import tableStyles from '@/libs/containers/shared/table/table.module.css';
import facetPanelStyles from '@/libs/features/facets/facets-panel/facets-panel.module.css';
import { useGlobalFacetAttributesList } from '@/libs/hooks/global/facets/use-global-facet-attributes-list';
import type {
  GlobalAttributesPageReducer,
  GlobalAttributesPageState,
} from '@/libs/stores/global-attributes-page/global-attributes-page-reducer';

import { DndContext } from '@dnd-kit/core';
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const EDITFACETVALUESMODALCOLUMNS: {
  label: string | null | false;
}[] = [
  { label: null },
  {
    label: 'Attribute',
  },
  {
    label: 'Ranking',
  },
  {
    label: 'Display name',
  },
  {
    label: 'Actions',
  },
  {
    label: '',
  },
];

export type GlobalFacetAttributesListProps = {
  attributeValues: MerchandisingAttributeValuesResponse['values'];
  searchedResultsCount?: number;
  searchQuery: string;
  countryCode: MerchandisingCountryCode;
  editingValues: string[];
  dispatch: ActionDispatch<[action: GlobalAttributesPageReducer]>;
  globalAttributesLocalState: GlobalAttributesPageState;
  isWriteEnabled: boolean;
  setEditingValues: Dispatch<SetStateAction<string[]>>;
  isAwaitingUpdate: boolean;
  setIsAwaitingUpdate: Dispatch<SetStateAction<boolean>>;
  facet: MerchandisingReturnedGlobalFacet;
};

export const GlobalFacetAttributesList = ({
  attributeValues,
  searchedResultsCount,
  searchQuery,
  countryCode,
  editingValues,
  dispatch,
  globalAttributesLocalState,
  isWriteEnabled,
  setEditingValues,
  isAwaitingUpdate,
  setIsAwaitingUpdate,
  facet,
}: GlobalFacetAttributesListProps) => {
  const initialOrders = useMemo(
    () =>
      Object.fromEntries(
        globalAttributesLocalState.boostedRows.map((item) => [
          item.displayName,
          item.order,
        ])
      ),
    [globalAttributesLocalState.boostedRows]
  );

  const handleOrderChangeCallback = useCallback(
    (displayName: string, newIndex: number) => {
      dispatch({
        type: 'SET_BOOSTED_ORDER',
        payload: { id: displayName, newIndex },
      });
    },
    [dispatch]
  );

  const totalSelectedItems = useMemo(() => {
    const selectedBoostedRows = globalAttributesLocalState.boostedRows
      .filter((row) => row.isChecked === true)
      .reduce((sum, row) => sum + row.attributes.length, 0);

    const selectedExcludedRows = globalAttributesLocalState.excludedRows
      .filter((row) => row.isChecked === true)
      .reduce((sum, row) => sum + row.attributes.length, 0);

    const selectedAlgoControlRows =
      globalAttributesLocalState.nonBoostedExcludedRows
        .filter((row) => row.isChecked === true)
        .reduce((sum, row) => sum + row.attributes.length, 0);

    return selectedBoostedRows + selectedExcludedRows + selectedAlgoControlRows;
  }, [
    globalAttributesLocalState.boostedRows,
    globalAttributesLocalState.excludedRows,
    globalAttributesLocalState.nonBoostedExcludedRows,
  ]);

  const searchQueryInLowerCase = searchQuery.toLowerCase();

  const filteredAttributeValues = useMemo(
    () =>
      attributeValues.filter((attribute) =>
        attribute.displayValue.toLowerCase().includes(searchQueryInLowerCase)
      ),
    [attributeValues, searchQueryInLowerCase]
  );

  const filteredAttributeValuesNotInAMergeGroup = useMemo(
    () =>
      filteredAttributeValues.filter(
        (attribute) =>
          !globalAttributesLocalState.merged?.some((group) =>
            group.mergedValues?.includes(attribute.displayValue)
          )
      ),
    [filteredAttributeValues, globalAttributesLocalState.merged]
  );

  const filteredMergeGroups = useMemo(
    () =>
      globalAttributesLocalState.merged?.filter(
        (group) =>
          group.displayValue?.toLowerCase().includes(searchQueryInLowerCase) ||
          group.mergedValues?.some((val) =>
            val.toLowerCase().includes(searchQueryInLowerCase)
          )
      ),
    [globalAttributesLocalState.merged, searchQueryInLowerCase]
  );

  const localFilteredResults = useMemo(() => {
    const baselineCount =
      filteredAttributeValuesNotInAMergeGroup.length +
      filteredMergeGroups.length;

    const knownAttributeValues = new Set(
      attributeValues.map(({ displayValue }) => displayValue)
    );

    const additionalFetchedValues =
      globalAttributesLocalState.nonBoostedExcludedRows.filter((row) => {
        if (row.isMergeGroup || knownAttributeValues.has(row.displayName)) {
          return false;
        }

        return (
          row.displayName.toLowerCase().includes(searchQueryInLowerCase) ||
          row.attributes.some((val) =>
            val.toLowerCase().includes(searchQueryInLowerCase)
          )
        );
      }).length;

    return baselineCount + additionalFetchedValues;
  }, [
    attributeValues,
    filteredAttributeValuesNotInAMergeGroup.length,
    filteredMergeGroups.length,
    globalAttributesLocalState.nonBoostedExcludedRows,
    searchQueryInLowerCase,
  ]);

  const totalFilteredResults =
    searchQuery.trim() && searchedResultsCount !== undefined
      ? searchedResultsCount
      : localFilteredResults;

  const hasSelectedAllAttributes = useMemo(
    () =>
      totalSelectedItems ===
      globalAttributesLocalState.excludedRows.flatMap((val) => val.attributes)
        .length +
        globalAttributesLocalState.boostedRows.flatMap((val) => val.attributes)
          .length +
        globalAttributesLocalState.nonBoostedExcludedRows.flatMap(
          (val) => val.attributes
        ).length,
    [
      totalSelectedItems,
      globalAttributesLocalState.excludedRows,
      globalAttributesLocalState.boostedRows,
      globalAttributesLocalState.nonBoostedExcludedRows,
    ]
  );

  const {
    sensors,
    boostedValuesRows,
    defaultValuesRows,
    excludedValuesRows,
    boostedVisibleIds,
    handleBoostedDragEnd,
  } = useGlobalFacetAttributesList({
    attributeValues,
    searchQuery,
    countryCode,
    editingValues,
    setEditingValues,
    globalAttributesLocalState,
    isWriteEnabled,
    setIsAwaitingUpdate,
    facet,
    dispatch,
    totalSelectedItems,
    handleOrderChangeCallback,
    initialOrders,
  });

  return (
    <>
      <div
        className={`${tableStyles.tableRow} ${tableStyles.facetAttributeValuesTableRow} ${tableStyles.globalFacetAttributeValuesTableRow}`}
      >
        {EDITFACETVALUESMODALCOLUMNS.map(({ label }) => (
          <div
            key={`add-facet-modal-column-${label}`}
            className={facetPanelStyles.tableCol}
          >
            {label ? (
              <Typography isStrong variant="bodySmall">
                {label}
              </Typography>
            ) : (
              label === null && (
                <div className={facetPanelStyles.tableCol}>
                  {isWriteEnabled && (
                    <Checkbox
                      label="Select all facet attributes"
                      shouldShowLabel={false}
                      checked={hasSelectedAllAttributes}
                      onChange={() => {
                        setIsAwaitingUpdate(true);
                        requestAnimationFrame(() => {
                          dispatch({
                            type: 'TOGGLE_ALL_ATTRIBUTES',
                            payload: {
                              areAllSelected: !hasSelectedAllAttributes,
                            },
                          });
                        });
                      }}
                    />
                  )}
                </div>
              )
            )}
          </div>
        ))}
      </div>

      <DndContext
        sensors={sensors}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={handleBoostedDragEnd}
      >
        <SortableContext
          items={boostedVisibleIds}
          strategy={verticalListSortingStrategy}
        >
          <div>{boostedValuesRows}</div>
        </SortableContext>
      </DndContext>

      {defaultValuesRows}

      {excludedValuesRows}

      {isAwaitingUpdate && <Loader isInModal />}

      <FilteredResultsPanel filteredFacets={totalFilteredResults} />
    </>
  );
};
