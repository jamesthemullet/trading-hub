import { type ActionDispatch, useCallback, useMemo } from 'react';

import type { MerchandisingAttributeValuesResponse } from '@/libs/api/generated/open-api';
import { CombinedDropdown, Text, Typography } from '@/libs/components';
import { DragHandleButton } from '@/libs/components/drag-handle-button/drag-handle-button';
import editFacetStyles from '@/libs/components/edit-facet-modal-content/edit-facet-modal-content.module.css';
import { FacetOrderInput } from '@/libs/components/facet-order-input/facet-order-input';
import type { FacetDisplayType } from '@/libs/containers/facets/facet-row';
import type { SortableRowRenderArgs } from '@/libs/containers/facets/sortable-row/sortable-row';
import { SortableRow } from '@/libs/containers/facets/sortable-row/sortable-row';
import { SearchCategoryFacetAttributeValuesTableRow } from '@/libs/containers/shared/table/table.styles';
import facetPanelStyles from '@/libs/features/facets/facets-panel/facets-panel.module.css';
import { createBoostedDragEndHandler } from '@/libs/features/facets/utils/create-boosted-drag-end-handler';
import { useFacetOrderInput } from '@/libs/hooks/use-facet-order-input';
import type { Action } from '@/libs/stores/search-and-category/facet-attributes-page-reducer';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const EDITFACETVALUESMODALCOLUMNS: {
  label: string | null | false;
}[] = [
  {
    label: 'Ranking',
  },
  {
    label: 'Attribute',
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

type AttributeValueWithOrder = {
  displayValue: string;
  order: number;
};

type SearchAndCategoryFacetAttributesListProps = {
  boostedValues: AttributeValueWithOrder[];
  algoControlValues: MerchandisingAttributeValuesResponse['values'];
  excludedValues: MerchandisingAttributeValuesResponse['values'];
  dispatch: ActionDispatch<[action: Action]>;
  searchQuery: string;
  writeEnabled: boolean;
};

export const SearchAndCategoryFacetAttributesList = ({
  boostedValues,
  algoControlValues,
  excludedValues,
  dispatch,
  searchQuery,
  writeEnabled,
}: SearchAndCategoryFacetAttributesListProps) => {
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
    () => boostedValues.map((item) => item.displayValue),
    [boostedValues]
  );

  const initialOrders = useMemo(
    () =>
      Object.fromEntries(
        boostedValues.map((item) => [item.displayValue, item.order])
      ),
    [boostedValues]
  );

  const handleOrderChange = useCallback(
    (displayValue: string, newIndex: number) => {
      dispatch({
        type: 'SET_BOOSTED_ORDER',
        payload: { id: displayValue, newIndex },
      });
    },
    [dispatch]
  );

  const {
    inputRefs,
    localOrders,
    handleInputChange,
    handleInputBlur,
    handleInputKeyDown,
  } = useFacetOrderInput(handleOrderChange, initialOrders);

  const listValues = useCallback(
    (
      values:
        | AttributeValueWithOrder[]
        | MerchandisingAttributeValuesResponse['values'],
      displayType: FacetDisplayType
    ) => {
      const handleDisplayTypeChange = (
        newDisplayType: FacetDisplayType,
        displayValue: string
      ) => {
        dispatch({
          type: 'CHANGE_DISPLAY_TYPE',
          payload: {
            id: displayValue,
            newDisplayType,
          },
        });
      };

      const filteredRows = (values ?? []).filter((row) =>
        row.displayValue.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const rows = filteredRows.map((row, index) => {
        const displayValue = row.displayValue;
        const rowKey = `${displayType}-${displayValue}`;

        let order: number | undefined;
        let localOrder: number | string | undefined;

        if ('order' in row && typeof row.order === 'number') {
          order = row.order;
          localOrder = localOrders[displayValue] ?? order;
        }
        const disableDrag =
          !!searchQuery || !writeEnabled || filteredRows.length <= 1;

        const renderRow = (sortableProps?: SortableRowRenderArgs) => (
          <SearchCategoryFacetAttributeValuesTableRow
            key={sortableProps ? undefined : rowKey}
            ref={sortableProps?.setNodeRef}
            style={sortableProps?.style}
            {...(sortableProps?.attributes ?? {})}
            isPinned={displayType === 'included'}
            isExcluded={displayType === 'excluded'}
            data-testid={`${displayType} attribute ${index} ${displayValue}`}
          >
            <div className={facetPanelStyles.tableCol}>
              {displayType === 'included' && order !== undefined && (
                <FacetOrderInput
                  displayValue={displayValue}
                  order={order}
                  localOrder={localOrder}
                  inputRef={(el) => {
                    if (el) {
                      // eslint-disable-next-line functional/immutable-data
                      inputRefs.current[displayValue] = el;
                    }
                  }}
                  onInputChange={handleInputChange}
                  onInputBlur={handleInputBlur}
                  onInputKeyDown={handleInputKeyDown}
                  writeEnabled={writeEnabled}
                />
              )}
            </div>

            <div className={facetPanelStyles.tableCol}>
              <div className={editFacetStyles.attributeWrapper}>
                <Text>{displayValue}</Text>
              </div>
            </div>

            <div className={facetPanelStyles.tableCol}>
              <Text data-testid={`Label for ${displayValue}`}>
                {displayValue}
              </Text>
            </div>

            <div className={facetPanelStyles.tableCol}>
              <CombinedDropdown
                variant="facetOrder"
                hasAlgoControl
                onChange={(newDisplayType) => {
                  handleDisplayTypeChange(
                    newDisplayType as FacetDisplayType,
                    displayValue
                  );
                }}
                status={displayType}
                attribute={displayValue}
                writeEnabled={writeEnabled}
                ariaLabel="Select to set as included, excluded or algo control"
              />
            </div>

            <div className={facetPanelStyles.tableCol}>
              {displayType === 'included' && order !== undefined && (
                <DragHandleButton
                  disabled={disableDrag}
                  displayName={displayValue}
                  setActivatorNodeRef={sortableProps?.setActivatorNodeRef}
                  listeners={sortableProps?.listeners ?? {}}
                />
              )}
            </div>
          </SearchCategoryFacetAttributeValuesTableRow>
        );

        if (displayType === 'included') {
          return (
            <SortableRow key={rowKey} id={displayValue} disabled={disableDrag}>
              {(sortableProps) => renderRow(sortableProps)}
            </SortableRow>
          );
        }

        return renderRow();
      });

      return {
        rows: rows.length > 0 ? rows : undefined,
        ids: filteredRows.map((row) => row.displayValue),
      };
    },
    [
      dispatch,
      searchQuery,
      writeEnabled,
      handleInputBlur,
      handleInputChange,
      handleInputKeyDown,
      localOrders,
      inputRefs,
    ]
  );

  const boostedValuesResult = useMemo(() => {
    return listValues(boostedValues, 'included');
  }, [boostedValues, listValues]);

  const defaultValuesResult = useMemo(() => {
    return listValues(algoControlValues, 'algoControl');
  }, [algoControlValues, listValues]);

  const excludedValuesResult = useMemo(() => {
    return listValues(excludedValues, 'excluded');
  }, [excludedValues, listValues]);

  const boostedValuesRows = boostedValuesResult.rows;
  const boostedVisibleIds = boostedValuesResult.ids;
  const defaultValuesRows = defaultValuesResult.rows;
  const excludedValuesRows = excludedValuesResult.rows;

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

  return (
    <>
      <SearchCategoryFacetAttributeValuesTableRow>
        {EDITFACETVALUESMODALCOLUMNS.map(({ label }) => (
          <div
            key={`add-facet-modal-column-${label}`}
            className={facetPanelStyles.tableCol}
          >
            <Typography isStrong variant="bodySmall">
              {label}
            </Typography>
          </div>
        ))}
      </SearchCategoryFacetAttributeValuesTableRow>

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
    </>
  );
};
