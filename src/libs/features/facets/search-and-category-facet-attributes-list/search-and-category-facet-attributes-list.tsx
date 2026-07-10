import type { ActionDispatch, ReactElement } from 'react';
import { useCallback, useMemo } from 'react';

import type { MerchandisingAttributeValuesResponse } from '@/libs/api/generated/open-api';
import { CombinedDropdown, DropdownVariant } from '@/libs/components';
import { DragHandleButton } from '@/libs/components/drag-handle-button/drag-handle-button';
import { FacetOrderInput } from '@/libs/components/facet-order-input/facet-order-input';
import { Typography } from '@/libs/components/typography/typography';
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
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
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
  isWriteEnabled: boolean;
};

export const SearchAndCategoryFacetAttributesList = ({
  boostedValues,
  algoControlValues,
  excludedValues,
  dispatch,
  searchQuery,
  isWriteEnabled,
}: SearchAndCategoryFacetAttributesListProps): ReactElement => {
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
    getInputRef,
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
        let localOrder: number | '' = '';

        if ('order' in row && typeof row.order === 'number') {
          order = row.order;
          localOrder = localOrders[displayValue] ?? order;
        }
        const shouldDisableDrag = !isWriteEnabled || filteredRows.length <= 1;

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
            <div
              className={`${facetPanelStyles.tableCol} ${facetPanelStyles.facetOrderInput}`}
            >
              {displayType === 'included' && order !== undefined && (
                <FacetOrderInput
                  displayValue={displayValue}
                  order={order}
                  localOrder={localOrder}
                  inputRef={getInputRef(displayValue)}
                  onInputChange={handleInputChange}
                  onInputBlur={handleInputBlur}
                  onInputKeyDown={handleInputKeyDown}
                  isWriteEnabled={isWriteEnabled}
                />
              )}
            </div>

            <div className={facetPanelStyles.tableCol}>
              <div className={facetPanelStyles.attributeWrapper}>
                <Typography variant="bodySmall">{displayValue}</Typography>
              </div>
            </div>

            <div className={facetPanelStyles.tableCol}>
              <Typography
                variant="bodySmall"
                data-testid={`Label for ${displayValue}`}
              >
                {displayValue}
              </Typography>
            </div>

            <div className={facetPanelStyles.tableCol}>
              <CombinedDropdown
                variant={DropdownVariant.FacetOrder}
                hasAlgoControl
                onChange={(newDisplayType) => {
                  handleDisplayTypeChange(
                    newDisplayType as FacetDisplayType,
                    displayValue
                  );
                }}
                status={displayType}
                attribute={displayValue}
                isWriteEnabled={isWriteEnabled}
                ariaLabel="Select to set as included, excluded or algo control"
              />
            </div>

            <div className={facetPanelStyles.tableCol}>
              {displayType === 'included' && order !== undefined && (
                <DragHandleButton
                  disabled={shouldDisableDrag}
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
            <SortableRow
              key={rowKey}
              id={displayValue}
              disabled={shouldDisableDrag}
            >
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
      isWriteEnabled,
      handleInputBlur,
      handleInputChange,
      handleInputKeyDown,
      localOrders,
      getInputRef,
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
        isWriteEnabled,
      }),
    [boostedOrder, dispatch, isWriteEnabled]
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
    </>
  );
};
