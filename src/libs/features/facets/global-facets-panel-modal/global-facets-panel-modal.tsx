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
import { useDebounce } from '@/libs/hooks/utils/use-debounce';
import type { FacetDisplayType } from '@/libs/stores/facets-panel/facets-panel-reducer';
import { globalAttributesReducer } from '@/libs/stores/global-attribute/global-attribute-reducer';
import { color } from '@/libs/utils/constants';
import { spacing } from '@/libs/utils/spacing';

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
    label: 'Display name',
  },
  {
    label: false,
  },
  {
    label: 'Actions',
  },
];

type FormattedRow = {
  displayName: string;
  attributes: string[];
  isMergeGroup: boolean;
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
      selectedAttributes: [],
      allSelected: false,
      allDeselected: false,
      disableArrows: false,
      boostedRows: [],
      excludedRows: [],
      nonBoostedExcludedRows: [],
      merged: [],
      errorStates: {},
    }
  );

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

  const onCloseModal = () => setIsConfirmationModalOpen(false);

  const handleMerge = () => {
    setIsAwaitingUpdate(true);
    const isFirstAttributeBoosted = globalAttributesLocalState.boostedRows.some(
      (val) =>
        val.attributes.includes(
          globalAttributesLocalState.selectedAttributes[0]
        )
    );
    const isFirstAttributeExcluded =
      globalAttributesLocalState.excludedRows.some((val) =>
        val.attributes.includes(
          globalAttributesLocalState.selectedAttributes[0]
        )
      );

    const allCurrentlyMergedAttributes =
      globalAttributesLocalState.merged?.flatMap((group) => group.mergedValues);

    const isInExistingMergeGroup =
      allCurrentlyMergedAttributes &&
      globalAttributesLocalState.selectedAttributes?.some((val) =>
        allCurrentlyMergedAttributes.includes(val)
      );

    requestAnimationFrame(() => {
      if (isInExistingMergeGroup) {
        dispatch({
          type: 'UPDATE_MERGE_GROUP',
          payload: {
            attributes: globalAttributesLocalState.selectedAttributes,
            isFirstAttributeBoosted,
            isFirstAttributeExcluded,
          },
        });
      } else {
        dispatch({
          type: 'CREATE_MERGE_GROUP',
          payload: {
            attributes: globalAttributesLocalState.selectedAttributes,
            isFirstAttributeBoosted,
            isFirstAttributeExcluded,
          },
        });
      }

      dispatch({
        type: 'CLEAR_SELECTED_ATTRIBUTES',
      });

      setEditingValues((prev) => [
        ...prev,
        globalAttributesLocalState.selectedAttributes[0],
      ]);
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
        ({ displayName, attributes, isMergeGroup }, index) => {
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
                displayName={displayName}
                handleRemoveFromMerge={handleRemoveFromMerge}
                dispatch={dispatch}
                allSelected={globalAttributesLocalState.allSelected}
                allDeselected={globalAttributesLocalState.allDeselected}
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
                    disableArrows={globalAttributesLocalState.disableArrows}
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
      globalAttributesLocalState.allSelected,
      globalAttributesLocalState.allDeselected,
      globalAttributesLocalState.disableArrows,
      globalAttributesLocalState.boostedRows,
      globalAttributesLocalState.nonBoostedExcludedRows,
      globalAttributesLocalState.excludedRows,
      globalAttributesLocalState.merged,
      writeEnabled,
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
    globalAttributesLocalState.selectedAttributes.length ===
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
            <ErrorMessage role="alert">
              Error updating facet: {updateGlobalFacetError}
            </ErrorMessage>
          )}

          <MergeAndSearchContainer>
            <Text isStrong>All values listed</Text>

            <Button
              isDisabled={
                globalAttributesLocalState.selectedAttributes.length < 2
              }
              onClick={handleMerge}
            >
              Merge ({globalAttributesLocalState.selectedAttributes.length})
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
                                type: 'TOGGLE_SELECTED_ATTRIBUTES',
                                payload: {
                                  attributes: selectedAttributes,
                                  allSelected:
                                    selectedAttributes.length ===
                                    attributeValues.length,
                                  allDeselected:
                                    selectedAttributes.length === 0,
                                  disableArrows: selectedAttributes.length > 0,
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
            <ErrorMessage role="alert">
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
