import type { ActionDispatch, Dispatch, SetStateAction } from 'react';
import { useCallback, useMemo } from 'react';

import type {
  MerchandisingAttributeValuesResponse,
  MerchandisingCountryCode,
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';
import { FilteredResultsPanel, Loader, Typography } from '@/libs/components';
import { Col } from '@/libs/components/edit-facet-modal-content/edit-facet-modal-content.styles';
import { FacetAttributeValuesTableRow } from '@/libs/containers/shared/table/table.styles';
import { useGlobalFacetAttributesList } from '@/libs/hooks/global/facets/use-global-facet-attributes-list';
import type {
  GlobalAttributesPageReducer,
  GlobalAttributesPageState,
} from '@/libs/stores/global-attributes-page/global-attributes-page-reducer';

import { DndContext } from '@dnd-kit/core';
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
  searchQuery: string;
  countryCode: MerchandisingCountryCode;
  editingValues: string[];
  dispatch: ActionDispatch<[action: GlobalAttributesPageReducer]>;
  globalAttributesLocalState: GlobalAttributesPageState;
  writeEnabled: boolean;
  setEditingValues: Dispatch<SetStateAction<string[]>>;
  isAwaitingUpdate: boolean;
  setIsAwaitingUpdate: Dispatch<SetStateAction<boolean>>;
  facet: MerchandisingReturnedGlobalFacet;
};

export const GlobalFacetAttributesList = ({
  attributeValues,
  searchQuery,
  countryCode,
  editingValues,
  dispatch,
  globalAttributesLocalState,
  writeEnabled,
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

  const filteredAttributeValues = attributeValues.filter((attribute) =>
    attribute.displayValue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAttributeValuesNotInAMergeGroup =
    filteredAttributeValues.filter(
      (attribute) =>
        !globalAttributesLocalState.merged?.some((group) =>
          group.mergedValues?.includes(attribute.displayValue)
        )
    );

  const filteredMergeGroups = globalAttributesLocalState.merged?.filter(
    (group) =>
      group.displayValue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.mergedValues?.some((val) =>
        val.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const totalFilteredResults =
    filteredAttributeValuesNotInAMergeGroup.length + filteredMergeGroups.length;

  const hasSelectedAllAttributes =
    totalSelectedItems ===
    globalAttributesLocalState.excludedRows.flatMap((val) => val.attributes)
      .length +
      globalAttributesLocalState.boostedRows.flatMap((val) => val.attributes)
        .length +
      globalAttributesLocalState.nonBoostedExcludedRows.flatMap(
        (val) => val.attributes
      ).length;

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
    writeEnabled,
    setIsAwaitingUpdate,
    facet,
    dispatch,
    totalSelectedItems,
    handleOrderChangeCallback,
    initialOrders,
  });

  return (
    <>
      <FacetAttributeValuesTableRow isHeading>
        {EDITFACETVALUESMODALCOLUMNS.map(({ label }) => (
          <Col key={`add-facet-modal-column-${label}`}>
            {label ? (
              <Typography isStrong variant="bodySmall">
                {label}
              </Typography>
            ) : (
              label === null && (
                <Col>
                  {writeEnabled && (
                    <input
                      type="checkbox"
                      aria-label="Select all facet attributes"
                      checked={hasSelectedAllAttributes}
                      onChange={() => {
                        setIsAwaitingUpdate(true);
                        requestAnimationFrame(() => {
                          dispatch({
                            type: 'TOGGLE_ALL_ATTRIBUTES',
                            payload: {
                              allSelected: !hasSelectedAllAttributes,
                            },
                          });
                        });
                      }}
                    />
                  )}
                </Col>
              )
            )}
          </Col>
        ))}
      </FacetAttributeValuesTableRow>

      <DndContext sensors={sensors} onDragEnd={handleBoostedDragEnd}>
        <SortableContext
          items={boostedVisibleIds}
          strategy={verticalListSortingStrategy}
        >
          {boostedValuesRows}
        </SortableContext>
      </DndContext>

      {defaultValuesRows}

      {excludedValuesRows}

      {isAwaitingUpdate && <Loader isInModal />}

      <FilteredResultsPanel filteredFacets={totalFilteredResults} />
    </>
  );
};
