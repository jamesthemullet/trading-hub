import type { ActionDispatch, Dispatch, SetStateAction } from 'react';
import { useCallback, useMemo } from 'react';

import type {
  MerchandisingAttributeValuesResponse,
  MerchandisingCountryCode,
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';
import {
  CombinedDropdown,
  FilteredResultsPanel,
  Loader,
} from '@/libs/components';
import { Col } from '@/libs/components/edit-facet-modal-content/edit-facet-modal-content.styles';
import { FacetOrderInput } from '@/libs/components/facet-order-input/facet-order-input';
import { GlobalFacetAttribute } from '@/libs/containers';
import { GlobalArrowButtons } from '@/libs/containers/facets/global-arrow-buttons/global-arrow-buttons';
import { GlobalEditableLabel } from '@/libs/containers/facets/global-editable-label/global-editable-label';
import {
  FacetAttributeValuesTableRow,
  TableHeading,
} from '@/libs/containers/shared/table/table.styles';
import { useFacetOrderInput } from '@/libs/hooks/use-facet-order-input';
import type { FacetDisplayType } from '@/libs/modules/facet-list/facet-list';
import type { GlobalAttributeReducer } from '@/libs/stores/global-attribute/global-attribute-reducer';
import type {
  FormattedRow,
  GlobalAttributesPageReducer,
  GlobalAttributesPageState,
} from '@/libs/stores/global-attributes-page/global-attributes-page-reducer';

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
    label: '',
  },
  {
    label: 'Actions',
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

  const {
    inputRefs,
    localOrders,
    handleInputChange,
    handleInputBlur,
    handleInputKeyDown,
  } = useFacetOrderInput(handleOrderChangeCallback, initialOrders);
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

      return filteredRows.map(
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

          return (
            <FacetAttributeValuesTableRow
              key={`${displayType}-${displayName}`}
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
              />
              <Col>
                {displayType === 'included' && order && (
                  <FacetOrderInput
                    displayValue={displayName}
                    order={order}
                    localOrder={localOrder}
                    inputRef={(el) => {
                      if (el) {
                        // eslint-disable-next-line functional/immutable-data
                        inputRefs.current[displayName] = el;
                      }
                    }}
                    onInputChange={handleInputChange}
                    onInputBlur={handleInputBlur}
                    onInputKeyDown={handleInputKeyDown}
                    writeEnabled={writeEnabled}
                  />
                )}
              </Col>

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
                dispatch={dispatch as Dispatch<GlobalAttributeReducer>}
                setEditingValues={setEditingValues}
                writeEnabled={writeEnabled}
              />

              <Col>
                {displayType === 'included' && (
                  <GlobalArrowButtons
                    displayName={displayName}
                    index={index}
                    searchQuery={searchQuery}
                    boostedRows={globalAttributesLocalState.boostedRows}
                    attributes={attributes}
                    rows={filteredRows}
                    disableArrows={totalSelectedItems > 0}
                    writeEnabled={writeEnabled}
                    dispatch={dispatch as Dispatch<GlobalAttributeReducer>}
                  />
                )}
              </Col>

              <Col>
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
                />
              </Col>
            </FacetAttributeValuesTableRow>
          );
        }
      );
    },
    [
      searchQuery,
      countryCode,
      editingValues,
      facet,
      globalAttributesLocalState.boostedRows,
      globalAttributesLocalState.nonBoostedExcludedRows,
      globalAttributesLocalState.excludedRows,
      globalAttributesLocalState.merged,
      writeEnabled,
      dispatch,
      setEditingValues,
      handleInputBlur,
      handleInputChange,
      handleInputKeyDown,
      setIsAwaitingUpdate,
      localOrders,
      inputRefs,
      totalSelectedItems,
    ]
  );

  const boostedValuesRows = useMemo(() => {
    return listValues(globalAttributesLocalState.boostedRows, 'included');
  }, [globalAttributesLocalState.boostedRows, listValues]);

  const defaultValuesRows = useMemo(() => {
    return listValues(
      globalAttributesLocalState.nonBoostedExcludedRows,
      'algoControl'
    );
  }, [globalAttributesLocalState.nonBoostedExcludedRows, listValues]);

  const excludedValuesRows = useMemo(() => {
    return listValues(globalAttributesLocalState.excludedRows, 'excluded');
  }, [globalAttributesLocalState.excludedRows, listValues]);

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

  return (
    <>
      <FacetAttributeValuesTableRow isHeading>
        {EDITFACETVALUESMODALCOLUMNS.map(({ label }) => (
          <Col key={`add-facet-modal-column-${label}`}>
            {label ? (
              <TableHeading as="p" isStrong>
                {label}
              </TableHeading>
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

      {boostedValuesRows}

      {defaultValuesRows}

      {excludedValuesRows}

      {isAwaitingUpdate && <Loader isInModal />}

      <FilteredResultsPanel filteredFacets={totalFilteredResults} />
    </>
  );
};
