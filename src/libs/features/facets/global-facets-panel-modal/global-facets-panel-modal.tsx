import styled from '@emotion/styled';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { Modal } from '@mantine/core';

import type {
  MerchandisingAttributeValuesResponse,
  MerchandisingCountryCode,
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';
import {
  Button,
  CombinedDropdown,
  ErrorMessage,
  FacetOrderInput,
  Header3,
  Loader,
  Search,
  Text,
} from '@/libs/components';
import {
  AttributesModalHeader,
  BodyContainer,
  Col,
  MergeAndSearchContainer,
  SkeletonRow,
} from '@/libs/components/edit-facet-modal-content/edit-facet-modal-content.styles';
import { FilteredResultsPanel } from '@/libs/components/filtered-results-panel/filtered-results-panel';
import {
  HeadingContainer,
  ModalAttributesTable,
} from '@/libs/components/modals/modal.styles';
import { GlobalFacetAttribute } from '@/libs/containers';
import { GlobalArrowButtons } from '@/libs/containers/facets/global-arrow-buttons/global-arrow-buttons';
import { GlobalEditableLabel } from '@/libs/containers/facets/global-editable-label/global-editable-label';
import ConfirmationModal from '@/libs/containers/shared/modals/confirmation-modal/confirmation-modal';
import {
  FacetAttributeValuesTableRow,
  TableHeading,
} from '@/libs/containers/shared/table/table.styles';
import { useGetFacetAttributeValues, useGlobalFacetUpdate } from '@/libs/hooks';
import { useFacetOrderInput } from '@/libs/hooks/use-facet-order-input';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';
import type { FacetDisplayType } from '@/libs/stores/facets-panel/facets-panel-reducer';
import { globalAttributesReducer } from '@/libs/stores/global-attribute/global-attribute-reducer';
import { color } from '@/libs/utils/constants';
import { spacing } from '@/libs/utils/spacing';

import styles from './global-facets-panel-modal.module.css';

const ModalContainer = styled.div`
  height: 100%;
  min-width: 860px;
  display: flex;
  flex-direction: column;
`;

const ModalFooter = styled.div`
  background-color: ${color.surface.surfaceContainer};
  position: sticky;
  bottom: 0;
  width: 100%;
  border-top: solid 1px ${color.surfaceDark.onSurfaceDarkVariant};
  padding: ${spacing(1)};
  display: flex;
  justify-content: flex-end;
  gap: ${spacing(2)};

  button {
    width: 160px;
  }
`;

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
                dispatch={dispatch}
                writeEnabled={writeEnabled}
              />

              <div className={styles.facetOrderInput}>
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
                    dispatch={dispatch}
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
      <ModalContainer>
        <AttributesModalHeader>
          <HeadingContainer>
            <Text isStrong as={Header3}>
              Facet value settings of: {facet.displayValue}
            </Text>
          </HeadingContainer>

          {updateGlobalFacetError && (
            <ErrorMessage>
              Error updating facet: {updateGlobalFacetError}
            </ErrorMessage>
          )}

          <MergeAndSearchContainer>
            <Text isStrong>All values listed</Text>

            <Button isDisabled={totalSelectedItems < 2} onClick={handleMerge}>
              Merge ({totalSelectedItems})
            </Button>

            <Search onChange={handleSearch} />
          </MergeAndSearchContainer>

          <ModalAttributesTable>
            <FacetAttributeValuesTableRow>
              {EDITFACETVALUESMODALCOLUMNS.map(({ label }) => (
                <Col key={`add-facet-modal-column-${label}`}>
                  {label ? (
                    <TableHeading as="p" isStrong>
                      {label}
                    </TableHeading>
                  ) : (
                    label === null && (
                      <Col>
                        <input
                          type="checkbox"
                          aria-label="Select all facet attributes"
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
                      </Col>
                    )
                  )}
                </Col>
              ))}
            </FacetAttributeValuesTableRow>
          </ModalAttributesTable>
        </AttributesModalHeader>

        <BodyContainer>
          {boostedValuesRows}

          {defaultValuesRows}

          {excludedValuesRows}

          {isAwaitingUpdate && <Loader isInModal />}

          <FilteredResultsPanel filteredFacets={totalFilteredResults} />
        </BodyContainer>
      </ModalContainer>
      <ModalFooter>
        <Button onClick={() => onClose()}>Cancel</Button>{' '}
        <Button
          onClick={handleSave}
          disabled={Object.values(globalAttributesLocalState.errorStates).some(
            (state) => state
          )}
        >
          Save
        </Button>
      </ModalFooter>
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
      <ModalContainer>
        <AttributesModalHeader>
          <HeadingContainer>
            <Text isStrong as={Header3}>
              Facet value settings of: {facet.displayValue}
            </Text>
          </HeadingContainer>

          {attributeValuesError && (
            <ErrorMessage>
              Error retrieving values: {attributeValuesError}
            </ErrorMessage>
          )}

          <MergeAndSearchContainer>
            <Text isStrong>All values listed</Text>

            <Button isDisabled>Merge (0)</Button>

            <Search />
          </MergeAndSearchContainer>
        </AttributesModalHeader>

        <BodyContainer data-testid="loader">
          <SkeletonRow aria-busy="true" />
          <SkeletonRow aria-busy="true" />
          <SkeletonRow aria-busy="true" />
          <SkeletonRow aria-busy="true" />
          <SkeletonRow aria-busy="true" />
        </BodyContainer>
      </ModalContainer>
      <ModalFooter>
        <Button onClick={() => onClose()} type="button">
          Cancel
        </Button>{' '}
        <Button isDisabled>Save</Button>
      </ModalFooter>
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
