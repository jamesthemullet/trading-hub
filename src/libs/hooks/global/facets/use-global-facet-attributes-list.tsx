import type { ActionDispatch, Dispatch, SetStateAction } from 'react';
import { useCallback, useMemo } from 'react';

import type {
  MerchandisingAttributeValuesResponse,
  MerchandisingCountryCode,
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';
import { CombinedDropdown } from '@/libs/components';
import { DragHandleButton } from '@/libs/components/drag-handle-button/drag-handle-button';
import { GlobalFacetAttribute } from '@/libs/containers';
import type { FacetDisplayType } from '@/libs/containers/facets/facet-row';
import { GlobalEditableLabel } from '@/libs/containers/facets/global-editable-label/global-editable-label';
import type { SortableRowRenderArgs } from '@/libs/containers/facets/sortable-row/sortable-row';
import { SortableRow } from '@/libs/containers/facets/sortable-row/sortable-row';
import { GlobalFacetAttributeValuesTableRow } from '@/libs/containers/shared/table/table.styles';
import facetsPanelStyles from '@/libs/features/facets/facets-panel/facets-panel.module.css';
import { createBoostedDragEndHandler } from '@/libs/features/facets/utils/create-boosted-drag-end-handler';
import { useFacetOrderInput } from '@/libs/hooks/use-facet-order-input';
import type { GlobalAttributeReducer } from '@/libs/stores/global-attribute/global-attribute-reducer';
import type {
  FormattedRow,
  GlobalAttributesPageReducer,
  GlobalAttributesPageState,
} from '@/libs/stores/global-attributes-page/global-attributes-page-reducer';

import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

type UseGlobalFacetAttributesListParams = {
  attributeValues: MerchandisingAttributeValuesResponse['values'];
  searchQuery: string;
  countryCode: MerchandisingCountryCode;
  editingValues: string[];
  setEditingValues: Dispatch<SetStateAction<string[]>>;
  globalAttributesLocalState: GlobalAttributesPageState;
  writeEnabled: boolean;
  setIsAwaitingUpdate: Dispatch<SetStateAction<boolean>>;
  facet: MerchandisingReturnedGlobalFacet;
  dispatch: ActionDispatch<[action: GlobalAttributesPageReducer]>;
  totalSelectedItems: number;
  handleOrderChangeCallback: (displayValue: string, order: number) => void;
  initialOrders: Record<string, number>;
};

export const useGlobalFacetAttributesList = ({
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
}: UseGlobalFacetAttributesListParams) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const boostedOrder = useMemo(
    () => globalAttributesLocalState.boostedRows.map((row) => row.displayName),
    [globalAttributesLocalState.boostedRows]
  );

  const {
    getInputRef,
    localOrders,
    handleInputChange,
    handleInputBlur,
    handleInputKeyDown,
  } = useFacetOrderInput(handleOrderChangeCallback, initialOrders);

  const listValues = useCallback(
    (values: FormattedRow[], displayType: FacetDisplayType) => {
      const handleRemoveFromMerge = ({
        valueToRemove,
        mergeDisplayName,
      }: {
        valueToRemove: string;
        mergeDisplayName: string;
      }) => {
        dispatch({
          type: 'REMOVE_FROM_MERGE_GROUP',
          payload: {
            valueToRemove,
            mergeDisplayName,
          },
        });
      };

      const filteredRows = values.filter(
        (row) =>
          row.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.attributes.some((val) =>
            val.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );

      const filteredRowIds = filteredRows.map((row) => row.displayName);

      const rows = filteredRows.map(
        (
          { displayName, attributes, isMergeGroup, order, isChecked },
          index
        ) => {
          const onOrderChange = (status: FacetDisplayType) => {
            setIsAwaitingUpdate(true);
            if (status === displayType) {
              return;
            }

            requestAnimationFrame(() => {
              if (displayType === 'included') {
                dispatch({
                  type: 'AMEND_BOOSTED_ROW',
                  payload: {
                    newStatus: status,
                    displayName,
                  },
                });
              }
              if (displayType === 'algoControl') {
                dispatch({
                  type: 'AMEND_NONBOOSTEDEXCLUDED_ROW',
                  payload: {
                    newStatus: status,
                    displayName,
                  },
                });
              }
              if (displayType === 'excluded') {
                dispatch({
                  type: 'AMEND_EXCLUDED_ROW',
                  payload: {
                    newStatus: status,
                    displayName,
                  },
                });
              }
            });
          };

          const localOrder = localOrders[displayName] ?? order;
          const rowKey = `${displayType}-${displayName}`;
          const disableDrag =
            !writeEnabled || totalSelectedItems > 0 || filteredRows.length <= 1;

          const renderRow = (
            sortableProps?: SortableRowRenderArgs,
            key?: string
          ) => (
            <GlobalFacetAttributeValuesTableRow
              key={key}
              ref={sortableProps?.setNodeRef}
              style={sortableProps?.style}
              isPinned={displayType === 'included'}
              isExcluded={displayType === 'excluded'}
              data-testid={`${displayType} attribute ${index} ${displayName}`}
            >
              <GlobalFacetAttribute
                attributes={attributes}
                isMergeGroup={isMergeGroup}
                isChecked={isChecked}
                displayName={displayName}
                handleRemoveFromMerge={handleRemoveFromMerge}
                dispatch={dispatch as Dispatch<GlobalAttributeReducer>}
                writeEnabled={writeEnabled}
                displayType={displayType}
                showInput
                displayValue={displayName}
                order={order}
                localOrder={localOrder}
                inputRef={getInputRef(displayName)}
                onInputChange={handleInputChange}
                onInputBlur={handleInputBlur}
                onInputKeyDown={handleInputKeyDown}
              />

              <GlobalEditableLabel
                displayName={displayName}
                editingValues={editingValues}
                merged={globalAttributesLocalState.merged}
                boostedRows={globalAttributesLocalState.boostedRows}
                nonBoostedExcludedRows={
                  globalAttributesLocalState.nonBoostedExcludedRows
                }
                excludedRows={globalAttributesLocalState.excludedRows}
                facet={facet}
                countryCode={countryCode}
                dispatch={dispatch}
                setEditingValues={setEditingValues}
                writeEnabled={writeEnabled}
              />

              <div className={facetsPanelStyles.tableCol}>
                <CombinedDropdown
                  variant="facetOrder"
                  status={displayType}
                  attribute={displayName}
                  onChange={(status) =>
                    onOrderChange(status as FacetDisplayType)
                  }
                  writeEnabled={writeEnabled}
                  hasAlgoControl
                  ariaLabel="Select to set as included, excluded or algo control"
                  width={150}
                />
              </div>

              <div
                className={facetsPanelStyles.tableCol}
                aria-hidden={displayType !== 'included'}
              >
                {displayType === 'included' ? (
                  <DragHandleButton
                    disabled={disableDrag}
                    displayName={displayName}
                    setActivatorNodeRef={sortableProps?.setActivatorNodeRef}
                    listeners={sortableProps?.listeners ?? {}}
                  />
                ) : null}
              </div>
            </GlobalFacetAttributeValuesTableRow>
          );

          if (displayType === 'included') {
            return (
              <SortableRow key={rowKey} id={displayName} disabled={disableDrag}>
                {(sortableProps) => renderRow(sortableProps)}
              </SortableRow>
            );
          }

          return renderRow(undefined, rowKey);
        }
      );

      return {
        rows,
        ids: filteredRowIds,
      };
    },
    [
      countryCode,
      dispatch,
      editingValues,
      facet,
      globalAttributesLocalState.boostedRows,
      globalAttributesLocalState.excludedRows,
      globalAttributesLocalState.merged,
      globalAttributesLocalState.nonBoostedExcludedRows,
      handleInputBlur,
      handleInputChange,
      handleInputKeyDown,
      getInputRef,
      localOrders,
      searchQuery,
      setEditingValues,
      setIsAwaitingUpdate,
      totalSelectedItems,
      writeEnabled,
    ]
  );

  const boostedValues = useMemo(() => {
    return listValues(globalAttributesLocalState.boostedRows, 'included');
  }, [globalAttributesLocalState.boostedRows, listValues]);

  const defaultValues = useMemo(() => {
    return listValues(
      globalAttributesLocalState.nonBoostedExcludedRows,
      'algoControl'
    );
  }, [globalAttributesLocalState.nonBoostedExcludedRows, listValues]);

  const excludedValues = useMemo(() => {
    return listValues(globalAttributesLocalState.excludedRows, 'excluded');
  }, [globalAttributesLocalState.excludedRows, listValues]);

  const boostedValuesRows = boostedValues.rows;
  const boostedVisibleIds = boostedValues.ids;

  const defaultValuesRows = defaultValues.rows;
  const excludedValuesRows = excludedValues.rows;

  const handleBoostedDragEnd = useMemo(
    () =>
      createBoostedDragEndHandler({
        boostedOrder,
        dispatch,
        writeEnabled,
        shouldAbort: () => !!searchQuery,
      }),
    [boostedOrder, dispatch, searchQuery, writeEnabled]
  );

  return {
    sensors,
    boostedValuesRows,
    defaultValuesRows,
    excludedValuesRows,
    boostedVisibleIds,
    handleBoostedDragEnd,
  };
};
