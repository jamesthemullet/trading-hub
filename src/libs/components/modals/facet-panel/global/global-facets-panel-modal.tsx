import styled from '@emotion/styled';
import { useCallback, useMemo, useReducer, useState } from 'react';
import { Modal } from '@mantine/core';

import type {
  MerchandisingAttributeValuesResponse,
  MerchandisingCountryCode,
  MerchandisingGlobalOnlyFacetConfig,
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';
import {
  Button,
  ErrorMessage,
  Header3,
  Search,
  spacing,
  Text,
} from '@/libs/components';
import { FacetOrderDropdown } from '@/libs/components/dropdowns/facet-order-dropdown/facet-order-dropdown';
import { FilteredResultsPanel } from '@/libs/components/filtered-results-panel/filtered-results-panel';
import {
  AttributesModalHeader,
  BodyContainer,
  Col,
  MergeAndSearchContainer,
  SkeletonRow,
} from '@/libs/components/modals/facet-panel/search-and-category/edit-facet-modal-content.styles';
import {
  HeadingContainer,
  ModalAttributesTable,
} from '@/libs/components/modals/modal.styles';
import {
  FacetAttributeValuesTableRow,
  TableHeading,
} from '@/libs/components/table/table.styles';
import { color } from '@/libs/components/utils/constants';
import { useGetFacetAttributeValues, useGlobalFacetUpdate } from '@/libs/hooks';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import type { FacetDisplayType } from '../../../../modules/facets-panel/facets-panel-reducer';
import ConfirmationModal from '../../confirmation-modal/confirmation-modal';
import { GlobalArrowButtons } from './global-arrow-buttons';
import { globalAttributesReducer } from './global-attribute-reducer';
import { GlobalEditableLabel } from './global-editable-label';
import { GlobalFacetAttribute } from './global-facet-attribute';

type MergeGroup = MerchandisingGlobalOnlyFacetConfig['merged'];

const ModalContainer = styled.div`
  height: 100%;
  min-width: 860px;
  display: flex;
  flex-direction: column;
`;

const ModalFooter = styled.div`
  background-color: #fff;
  position: sticky;
  bottom: 0;
  width: 100%;
  border-top: solid 1px ${color.grey};
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
  onClose: () => void;
  writeEnabled: boolean;
};

export const GlobalFacetPanelModalContent = ({
  countryCode,
  attributeValues,
  facet,
  onClose,
  writeEnabled,
}: ContentProps) => {
  const [globalAttributesLocalState, dispatch] = useReducer(
    globalAttributesReducer,
    {
      selectedAttributes: [],
      allSelected: false,
      allDeselected: false,
      disableArrows: false,
    }
  );

  const [searchQuery, setSearchQuery] = useState('');

  const [nonBoostedExcludedValues, setNonBoostedExcludedValues] = useState(
    attributeValues.filter(
      ({ displayValue }) =>
        !facet.boosted?.includes(displayValue) &&
        !facet.excludedValues?.includes(displayValue)
    )
  );
  const [boostedValues, setBoostedValues] = useState(
    facet.boosted?.map((value) => ({ displayValue: value })) || []
  );
  const [excludedValues, setExcludedValues] = useState(
    facet.excludedValues?.map((value) => ({ displayValue: value })) || []
  );

  const [errorStates, setErrorStates] = useState<
    Record<string, { message: string }>
  >({});
  const [editingValues, setEditingValues] = useState<string[]>([]);

  const [merged, setMerged] = useState<MergeGroup>(facet.merged || []);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const setError = (id: string, message: string) => {
    setErrorStates((prev) => ({
      ...Object.fromEntries(Object.entries(prev).filter(([key]) => key !== id)),
      ...(message && { [id]: { message } }),
    }));
  };

  const { handleGlobalFacetUpdate, error: updateGlobalFacetError } =
    useGlobalFacetUpdate();

  const onSave = async () => {
    const response = await handleGlobalFacetUpdate({
      facetId: facet.id,
      data: {
        ...facet,
        merged,
        excludedValues: excludedValues.map((val) => val.displayValue),
        boosted: boostedValues.map((val) => val.displayValue),
      },
    });

    if ('status' in response && response.status === 'error') {
      return;
    }

    onClose();
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
    const isFirstAttributeBoosted = boostedValues.some(
      (val) =>
        val.displayValue === globalAttributesLocalState.selectedAttributes[0]
    );
    const isFirstAttributeExcluded = excludedValues.some(
      (val) =>
        val.displayValue === globalAttributesLocalState.selectedAttributes[0]
    );

    const updatedBoosts = boostedValues.filter(
      (val) =>
        !globalAttributesLocalState.selectedAttributes.includes(
          val.displayValue
        )
    );

    const updatedExcludes = excludedValues.filter(
      (val) =>
        !globalAttributesLocalState.selectedAttributes.includes(
          val.displayValue
        )
    );

    const updatedNonBoostedExcludedValues = nonBoostedExcludedValues.filter(
      (val) =>
        !globalAttributesLocalState.selectedAttributes.includes(
          val.displayValue
        )
    );

    const updatedMerges = merged!.filter((group) =>
      group.mergedValues?.some(
        (val) => !globalAttributesLocalState.selectedAttributes.includes(val)
      )
    );

    setMerged([
      ...updatedMerges,
      {
        displayValue: globalAttributesLocalState.selectedAttributes[0],
        mergedValues: globalAttributesLocalState.selectedAttributes,
      },
    ]);
    if (isFirstAttributeBoosted) {
      setBoostedValues([
        ...updatedBoosts,
        ...globalAttributesLocalState.selectedAttributes.map((res) => ({
          displayValue: res,
        })),
      ]);
    } else {
      setBoostedValues(updatedBoosts);
    }
    if (isFirstAttributeExcluded) {
      setExcludedValues([
        ...updatedExcludes,
        ...globalAttributesLocalState.selectedAttributes.map((res) => ({
          displayValue: res,
        })),
      ]);
    } else {
      setExcludedValues(updatedExcludes);
    }
    if (!isFirstAttributeBoosted && !isFirstAttributeExcluded) {
      setNonBoostedExcludedValues([
        ...updatedNonBoostedExcludedValues,
        ...globalAttributesLocalState.selectedAttributes.map((res) => ({
          displayValue: res,
        })),
      ]);
    } else {
      setNonBoostedExcludedValues(updatedNonBoostedExcludedValues);
    }

    dispatch({
      type: 'CLEAR_SELECTED_ATTRIBUTES',
    });

    setEditingValues((prev) => [
      ...prev,
      globalAttributesLocalState.selectedAttributes[0],
    ]);
  };

  const { callback: handleSearch } = useDebounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    300
  );

  const listValues = useCallback(
    (
      values: MerchandisingAttributeValuesResponse['values'],
      displayType: FacetDisplayType
    ) => {
      const rows: FormattedRow[] = [];

      const handleRemoveFromMerge = ({
        valueToRemove,
        mergeDisplayName,
      }: {
        valueToRemove: string;
        mergeDisplayName: string;
      }) => {
        const mergeGroup = merged!.find((merge) =>
          merge.mergedValues!.includes(valueToRemove)
        );
        const updatedMerges =
          mergeGroup!.mergedValues!.length > 2
            ? merged!.map((mergeGroup) =>
                mergeGroup.displayValue === mergeDisplayName
                  ? {
                      displayValue: mergeGroup.displayValue,
                      mergedValues: mergeGroup.mergedValues!.filter(
                        (val) => val !== valueToRemove
                      ),
                    }
                  : mergeGroup
              )
            : merged!.filter(
                (group) => group.displayValue !== mergeGroup!.displayValue
              );
        setMerged(updatedMerges);
      };

      values.map((value) => {
        const isInMergeGroup = merged?.some((v) =>
          v.mergedValues?.includes(value.displayValue)
        );

        if (isInMergeGroup) {
          const mergeGroup = merged?.filter((v) =>
            v.mergedValues?.includes(value.displayValue)
          )[0];

          const rowsIndex = rows.findIndex(
            (row) => row.displayName === mergeGroup?.displayValue
          );

          if (
            rowsIndex === -1 &&
            mergeGroup?.displayValue &&
            mergeGroup?.mergedValues
          ) {
            // eslint-disable-next-line functional/immutable-data
            rows.push({
              attributes: mergeGroup.mergedValues,
              displayName: mergeGroup.displayValue,
              isMergeGroup: true,
            });
          }
        } else {
          // eslint-disable-next-line functional/immutable-data
          rows.push({
            attributes: [value.displayValue],
            displayName: value.displayValue,
            isMergeGroup: false,
          });
        }
      });

      const filteredRows = rows.filter(
        (row) =>
          row.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.attributes.some((val) =>
            val.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );

      return filteredRows.map(
        ({ displayName, attributes, isMergeGroup }, index) => {
          const onOrderChange = (status: FacetDisplayType) => {
            if (status === displayType) {
              return;
            }
            const attributeValues = attributes.map((attr) => ({
              displayValue: attr,
            }));

            if (status === 'included') {
              setBoostedValues([...boostedValues, ...attributeValues]);
              setExcludedValues(
                excludedValues.filter(
                  (val) => !attributes.includes(val.displayValue)
                )
              );
              setNonBoostedExcludedValues(
                nonBoostedExcludedValues.filter(
                  (val) => !attributes.includes(val.displayValue)
                )
              );
            }
            if (status === 'algoControl') {
              setNonBoostedExcludedValues([
                ...nonBoostedExcludedValues,
                ...attributeValues,
              ]);
              setExcludedValues(
                excludedValues.filter(
                  (val) => !attributes.includes(val.displayValue)
                )
              );
              setBoostedValues(
                boostedValues.filter(
                  (val) => !attributes.includes(val.displayValue)
                )
              );
            }
            if (status === 'excluded') {
              setExcludedValues([...excludedValues, ...attributeValues]);
              setBoostedValues(
                boostedValues.filter(
                  (val) => !attributes.includes(val.displayValue)
                )
              );
              setNonBoostedExcludedValues(
                nonBoostedExcludedValues.filter(
                  (val) => !attributes.includes(val.displayValue)
                )
              );
            }
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
                errorStates={errorStates}
                editingValues={editingValues}
                merged={merged}
                facet={facet}
                countryCode={countryCode}
                setError={setError}
                setMerged={setMerged}
                setEditingValues={setEditingValues}
              />

              {displayType === 'included' && (
                <GlobalArrowButtons
                  displayName={displayName}
                  index={index}
                  searchQuery={searchQuery}
                  boostedValues={boostedValues}
                  attributes={attributes}
                  merged={merged}
                  rows={rows}
                  disableArrows={globalAttributesLocalState.disableArrows}
                  setBoostedValues={setBoostedValues}
                />
              )}

              <Col>
                <FacetOrderDropdown
                  hasAlgoControl
                  status={displayType}
                  onChange={onOrderChange}
                  attribute={displayName}
                  writeEnabled={writeEnabled}
                />
              </Col>
            </FacetAttributeValuesTableRow>
          );
        }
      );
    },
    [
      boostedValues,
      excludedValues,
      nonBoostedExcludedValues,
      errorStates,
      searchQuery,
      countryCode,
      editingValues,
      facet,
      merged,
      globalAttributesLocalState.allSelected,
      globalAttributesLocalState.allDeselected,
      globalAttributesLocalState.disableArrows,
      writeEnabled,
    ]
  );

  const boostedValuesRows = useMemo(() => {
    return listValues(boostedValues, 'included');
  }, [boostedValues, listValues]);

  const defaultValuesRows = useMemo(() => {
    return listValues(nonBoostedExcludedValues, 'algoControl');
  }, [nonBoostedExcludedValues, listValues]);

  const excludedValuesRows = useMemo(() => {
    return listValues(excludedValues, 'excluded');
  }, [excludedValues, listValues]);

  const hasSelectedAllAttributes =
    globalAttributesLocalState.selectedAttributes.length ===
    excludedValues.length +
      nonBoostedExcludedValues.length +
      boostedValues.length;

  const filteredAttributeValues = attributeValues.filter((attribute) =>
    attribute.displayValue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAttributeValuesNotInAMergeGroup =
    filteredAttributeValues.filter(
      (attribute) =>
        !merged?.some((group) =>
          group.mergedValues?.includes(attribute.displayValue)
        )
    );

  const filteredMergeGroups = merged!.filter(
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
                    <TableHeading as="p" isStrong={true}>
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
                            const selectedAttributes = hasSelectedAllAttributes
                              ? []
                              : attributeValues.map((val) => val.displayValue);

                            dispatch({
                              type: 'TOGGLE_SELECTED_ATTRIBUTES',
                              payload: {
                                attributes: selectedAttributes,
                                allSelected:
                                  selectedAttributes.length ===
                                  attributeValues.length,
                                allDeselected: selectedAttributes.length === 0,
                                disableArrows: selectedAttributes.length > 0,
                              },
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

          <FilteredResultsPanel filteredFacets={totalFilteredResults} />
        </BodyContainer>
      </ModalContainer>
      <ModalFooter>
        <Button onClick={onClose}>Cancel</Button>{' '}
        <Button
          onClick={handleSave}
          disabled={Object.values(errorStates).some((state) => state)}
        >
          Save
        </Button>
      </ModalFooter>
      <Modal.Root
        centered
        opened={isConfirmationModalOpen}
        onClose={onCloseModal}
        padding={10}
        role="dialog"
        aria-modal="true"
      >
        <Modal.Overlay blur={3} />
        <Modal.Content>
          <ConfirmationModal
            onCloseModal={onCloseModal}
            handleModalConfirm={handleModalConfirm}
          />
        </Modal.Content>
      </Modal.Root>
    </>
  );
};

type Props = {
  countryCode: MerchandisingCountryCode;
  facet: MerchandisingReturnedGlobalFacet;
  onClose: () => void;
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
        <Button onClick={onClose} type="button">
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
