import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { Modal, Skeleton } from '@mantine/core';

import type {
  MerchandisingAttributeValuesResponse,
  MerchandisingCountryCode,
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';
import {
  Button,
  Checkbox,
  CombinedDropdown,
  ErrorMessage,
  FacetOrderInput,
  Loader,
  Search,
  Typography,
} from '@/libs/components';
import { FilteredResultsPanel } from '@/libs/components/filtered-results-panel/filtered-results-panel';
import { GlobalFacetAttribute } from '@/libs/containers';
import { GlobalArrowButtons } from '@/libs/containers/facets/global-arrow-buttons/global-arrow-buttons';
import { GlobalEditableLabel } from '@/libs/containers/facets/global-editable-label/global-editable-label';
import ConfirmationModal from '@/libs/containers/shared/modals/confirmation-modal/confirmation-modal';
import { GlobalFacetAttributeValuesTableRow } from '@/libs/containers/shared/table/table.styles';
import facetPanelStyles from '@/libs/features/facets/facets-panel/facets-panel.module.css';
import { useGetFacetAttributeValues, useGlobalFacetUpdate } from '@/libs/hooks';
import { useFacetOrderInput } from '@/libs/hooks/use-facet-order-input';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';
import type { FacetDisplayType } from '@/libs/stores/facets-panel/facets-panel-reducer';
import { globalAttributesReducer } from '@/libs/stores/global-attribute/global-attribute-reducer';

import styles from './global-facets-panel-modal.module.css';

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

type FormattedRow = {
  displayName: string;
  attributes: string[];
  isMergeGroup: boolean;
  isChecked: boolean;
  order?: number;
};

type ContentProps = {
  attributeValues: MerchandisingAttributeValuesResponse['values'];
  countryCode: MerchandisingCountryCode;
  facet: MerchandisingReturnedGlobalFacet;
  onClose: (shouldRefetch?: boolean) => void;
  writeEnabled: boolean;
};

export const GlobalFacetPanelModalContent = ({
  countryCode,
  attributeValues,
  facet,
  onClose,
  writeEnabled,
}: ContentProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const titleId = useId();
  const descriptionId = useId();

  const [editingValues, setEditingValues] = useState<string[]>([]);

  const [isAwaitingUpdate, setIsAwaitingUpdate] = useState(false);

  useEffect(() => {
    if (!isAwaitingUpdate) return;

    setIsAwaitingUpdate(false);
  }, [isAwaitingUpdate]);

  useEffect(() => {
    dispatch({
      type: 'INITIALISE_STATE',
      payload: {
        boostedValues:
          facet.boosted?.map((value) => ({ displayValue: value })) || [],
        excludedValues:
          facet.excludedValues?.map((value) => ({ displayValue: value })) || [],
        nonBoostedExcludedValues: attributeValues.filter(
          ({ displayValue }) =>
            !facet.boosted?.includes(displayValue) &&
            !facet.excludedValues?.includes(displayValue)
        ),
        merged: facet.merged || [],
      },
    });
  }, [facet, attributeValues]);

  const [globalAttributesLocalState, dispatch] = useReducer(
    globalAttributesReducer,
    {
      boostedRows: [],
      excludedRows: [],
      nonBoostedExcludedRows: [],
      merged: [],
      errorStates: {},
    }
  );

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
    []
  );

  const {
    inputRefs,
    localOrders,
    handleInputChange,
    handleInputBlur,
    handleInputKeyDown,
  } = useFacetOrderInput(handleOrderChangeCallback, initialOrders);

  const { handleGlobalFacetUpdate, error: updateGlobalFacetError } =
    useGlobalFacetUpdate();

  const onSave = async () => {
    const response = await handleGlobalFacetUpdate({
      facetId: facet.id,
      data: {
        ...facet,
        merged: globalAttributesLocalState.merged,
        excludedValues: globalAttributesLocalState.excludedRows.flatMap(
          (val) => val.displayName
        ),
        boosted: globalAttributesLocalState.boostedRows.flatMap(
          (val) => val.displayName
        ),
      },
    });

    if ('status' in response && response.status === 'error') {
      return;
    }

    onClose(true);
  };

  const handleSave = () => {
    setIsConfirmationModalOpen(true);
  };

  const handleModalConfirm = async () => {
    setIsConfirmationModalOpen(false);
    await onSave();
  };

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

  const onCloseModal = () => setIsConfirmationModalOpen(false);

  const handleMerge = () => {
    setIsAwaitingUpdate(true);

    const isFirstAttributeBoosted =
      globalAttributesLocalState.boostedRows.filter((val) => val.isChecked)
        .length > 0;
    const isFirstAttributeExcluded =
      globalAttributesLocalState.boostedRows.filter((val) => val.isChecked)
        .length === 0 &&
      globalAttributesLocalState.nonBoostedExcludedRows.filter(
        (val) => val.isChecked
      ).length === 0;

    const selectedRows = [
      ...globalAttributesLocalState.boostedRows.filter((val) => val.isChecked),
      ...globalAttributesLocalState.excludedRows.filter((val) => val.isChecked),
      ...globalAttributesLocalState.nonBoostedExcludedRows.filter(
        (val) => val.isChecked
      ),
    ];

    const isExistingMergeGroup = selectedRows.some((row) => {
      return row.isMergeGroup === true;
    });

    requestAnimationFrame(() => {
      if (isExistingMergeGroup) {
        dispatch({
          type: 'UPDATE_MERGE_GROUP',
          payload: {
            attributes: selectedRows.flatMap((row) => row.attributes),
            isFirstAttributeBoosted,
            isFirstAttributeExcluded,
          },
        });
      } else {
        dispatch({
          type: 'CREATE_MERGE_GROUP',
          payload: {
            attributes: selectedRows.flatMap((row) => row.attributes),
            isFirstAttributeBoosted,
            isFirstAttributeExcluded,
          },
        });
      }

      dispatch({
        type: 'TOGGLE_ALL_ATTRIBUTES',
        payload: {
          allSelected: false,
        },
      });

      setEditingValues((prev) => [...prev, selectedRows[0].attributes[0]]);
    });
  };

  const { callback: handleSearch } = useDebounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setIsAwaitingUpdate(true);
      requestAnimationFrame(() => {
        setSearchQuery(event.target.value);
      });
    },
    300
  );

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
          { displayName, attributes, isMergeGroup, isChecked, order },
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
            <GlobalFacetAttributeValuesTableRow
              key={`${displayType}-${displayName}`}
              isPinned={displayType === 'included'}
              isExcluded={displayType === 'excluded'}
              data-testid={`${displayType} attribute ${index} ${displayName}`}
              modal
            >
              <GlobalFacetAttribute
                attributes={attributes}
                isMergeGroup={isMergeGroup}
                isChecked={isChecked}
                displayName={displayName}
                handleRemoveFromMerge={handleRemoveFromMerge}
                dispatch={dispatch}
                writeEnabled={writeEnabled}
                displayType={displayType}
              />

              <div className={facetPanelStyles.facetOrderInput}>
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
              </div>

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
              />

              <div className={facetPanelStyles.tableCol}>
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
                    dispatch={dispatch}
                  />
                )}
              </div>

              <div className={facetPanelStyles.tableCol}>
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
              </div>
            </GlobalFacetAttributeValuesTableRow>
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
      totalSelectedItems,
      localOrders,
      handleInputChange,
      handleInputBlur,
      handleInputKeyDown,
      inputRefs,
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

  const hasSelectedAllAttributes =
    totalSelectedItems ===
    globalAttributesLocalState.excludedRows.flatMap((val) => val.attributes)
      .length +
      globalAttributesLocalState.boostedRows.flatMap((val) => val.attributes)
        .length +
      globalAttributesLocalState.nonBoostedExcludedRows.flatMap(
        (val) => val.attributes
      ).length;

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

  return (
    <>
      <div className={styles.attributesModalHeader}>
        <div className={styles.headingContainer}>
          <Typography isStrong as="h3" variant="titleSmall">
            Facet value settings of: {facet.displayValue}
          </Typography>
        </div>

        {updateGlobalFacetError && (
          <ErrorMessage>
            Error updating facet: {updateGlobalFacetError}
          </ErrorMessage>
        )}

        <div className={styles.mergeAndSearchContainer}>
          <Typography isStrong variant="bodySmall">
            All values listed
          </Typography>

          <Button isDisabled={totalSelectedItems < 2} onClick={handleMerge}>
            Merge ({totalSelectedItems})
          </Button>

          <Search onChange={handleSearch} />
        </div>

        <div className={styles.modalAttributesTable}>
          <GlobalFacetAttributeValuesTableRow modal>
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
                      <Checkbox
                        label="Select all facet attributes"
                        showLabel={false}
                        checked={hasSelectedAllAttributes}
                        onChange={() => {
                          setIsAwaitingUpdate(true);

                          const selectedAttributes = hasSelectedAllAttributes
                            ? []
                            : attributeValues.map((val) => val.displayValue);
                          requestAnimationFrame(() => {
                            dispatch({
                              type: 'TOGGLE_ALL_ATTRIBUTES',
                              payload: {
                                allSelected:
                                  selectedAttributes.length ===
                                  attributeValues.length,
                              },
                            });
                          });
                        }}
                      />
                    </div>
                  )
                )}
              </div>
            ))}
          </GlobalFacetAttributeValuesTableRow>
        </div>
      </div>

      <div>
        {boostedValuesRows}

        {defaultValuesRows}

        {excludedValuesRows}

        {isAwaitingUpdate && <Loader isInModal />}

        <FilteredResultsPanel filteredFacets={totalFilteredResults} />
      </div>
      <div className={styles.modalFooter}>
        <Button onClick={() => onClose()}>Cancel</Button>{' '}
        <Button
          onClick={handleSave}
          disabled={Object.values(globalAttributesLocalState.errorStates).some(
            (state) => state
          )}
        >
          Save
        </Button>
      </div>
      <Modal.Root
        centered
        opened={isConfirmationModalOpen}
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
    </>
  );
};

type Props = {
  countryCode: MerchandisingCountryCode;
  facet: MerchandisingReturnedGlobalFacet;
  onClose: (shouldRefetch?: boolean) => void;
  writeEnabled: boolean;
};

export const GlobalFacetPanelModal = ({
  countryCode,
  facet,
  onClose,
  writeEnabled,
}: Props) => {
  const {
    attributeValues,
    error: attributeValuesError,
    isLoading,
  } = useGetFacetAttributeValues({
    facetId: facet.id,
    query: '',
    countryCode,
  });

  return isLoading || attributeValuesError ? (
    <>
      <div className={styles.attributesModalHeader}>
        <div className={styles.headingContainer}>
          <Typography isStrong as="h3" variant="titleSmall">
            Facet value settings of: {facet.displayValue}
          </Typography>
        </div>

        {attributeValuesError && (
          <ErrorMessage>
            Error retrieving values: {attributeValuesError}
          </ErrorMessage>
        )}

        <div className={styles.mergeAndSearchContainer}>
          <Typography isStrong variant="bodySmall">
            All values listed
          </Typography>

          <Button isDisabled>Merge (0)</Button>

          <Search />
        </div>
      </div>

      <div data-testid="loader">
        <Skeleton className={styles.skeletonRow} aria-busy="true" />
        <Skeleton className={styles.skeletonRow} aria-busy="true" />
        <Skeleton className={styles.skeletonRow} aria-busy="true" />
        <Skeleton className={styles.skeletonRow} aria-busy="true" />
        <Skeleton className={styles.skeletonRow} aria-busy="true" />
      </div>
      <div className={styles.modalFooter}>
        <Button onClick={() => onClose()} type="button">
          Cancel
        </Button>{' '}
        <Button isDisabled>Save</Button>
      </div>
    </>
  ) : (
    <GlobalFacetPanelModalContent
      attributeValues={attributeValues}
      countryCode={countryCode}
      facet={facet}
      onClose={onClose}
      writeEnabled={writeEnabled}
    />
  );
};
