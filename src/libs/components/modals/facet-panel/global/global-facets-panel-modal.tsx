import styled from '@emotion/styled';
import { useCallback, useMemo, useState } from 'react';

import type { GlobalOnlyFacetConfig } from '@/libs/api';
import {
  type AttributeValuesResponse,
  type CountryCode,
  type ReturnedGlobalFacet,
} from '@/libs/api';
import {
  Button,
  ErrorMessage,
  Header3,
  Search,
  spacing,
  Text,
} from '@/libs/components';
import { ArrowButton } from '@/libs/components/buttons/button/arrow-button';
import { FacetOrderDropdown } from '@/libs/components/dropdowns/facet-order-dropdown/facet-order-dropdown';
import { EditableLabel } from '@/libs/components/editable-label/editable-label';
import { FilteredResultsPanel } from '@/libs/components/filtered-results-panel/filtered-results-panel';
import {
  AttributesModalHeader,
  AttributeWrapper,
  BodyContainer,
  Col,
  FlexColumnCol,
  MergeAndSearchContainer,
  MergedValue,
  OrderArrowsContainer,
  RemoveMergedFacet,
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
import {
  useCheckMergeNameUnique,
  useGetFacetAttributeValues,
  useGlobalFacetUpdate,
} from '@/libs/hooks';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import type { FacetDisplayType } from '../../../../modules/facets-panel/facets-panel-reducer';

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

export const DEFAULT_MERGE_DISPLAY_NAME = 'Name your merge';

type FormattedRow = {
  displayName: string;
  attributes: string[];
  isMergeGroup: boolean;
};

type MergeGroup = GlobalOnlyFacetConfig['merged'];

type ContentProps = {
  attributeValues: AttributeValuesResponse['values'];
  countryCode: CountryCode;
  facet: ReturnedGlobalFacet;
  onClose: () => void;
};

export const GlobalFacetPanelModalContent = ({
  countryCode,
  attributeValues,
  facet,
  onClose,
}: ContentProps) => {
  const [selectedFacetAttributes, setSelectedFacetAttributes] = useState<
    string[]
  >([]);

  const [merged, setMerged] = useState<MergeGroup>(facet.merged || []);

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

  const setError = (id: string, message: string) => {
    setErrorStates((prev) => ({
      ...Object.fromEntries(Object.entries(prev).filter(([key]) => key !== id)),
      ...(message && { [id]: { message } }),
    }));
  };

  const { checkMergeNameUnique } = useCheckMergeNameUnique();
  const { handleGlobalFacetUpdate, error: updateGlobalFacetError } =
    useGlobalFacetUpdate();

  const disallowedValues = [
    ...merged!.map((val) => val.displayValue!),
    DEFAULT_MERGE_DISPLAY_NAME,
  ];

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

  const handleMerge = () => {
    const isFirstAttributeBoosted = boostedValues.some(
      (val) => val.displayValue === selectedFacetAttributes[0]
    );
    const isFirstAttributeExcluded = excludedValues.some(
      (val) => val.displayValue === selectedFacetAttributes[0]
    );

    const updatedBoosts = boostedValues.filter(
      (val) => !selectedFacetAttributes.includes(val.displayValue)
    );

    const updatedExcludes = excludedValues.filter(
      (val) => !selectedFacetAttributes.includes(val.displayValue)
    );

    const updatedNonBoostedExcludedValues = nonBoostedExcludedValues.filter(
      (val) => !selectedFacetAttributes.includes(val.displayValue)
    );

    const updatedMerges = merged!.filter((group) =>
      group.mergedValues?.some((val) => !selectedFacetAttributes.includes(val))
    );

    setMerged([
      ...updatedMerges,
      {
        displayValue: DEFAULT_MERGE_DISPLAY_NAME,
        mergedValues: selectedFacetAttributes,
      },
    ]);
    if (isFirstAttributeBoosted) {
      setBoostedValues([
        ...updatedBoosts,
        ...selectedFacetAttributes.map((res) => ({ displayValue: res })),
      ]);
    } else {
      setBoostedValues(updatedBoosts);
    }
    if (isFirstAttributeExcluded) {
      setExcludedValues([
        ...updatedExcludes,
        ...selectedFacetAttributes.map((res) => ({ displayValue: res })),
      ]);
    } else {
      setExcludedValues(updatedExcludes);
    }
    if (!isFirstAttributeBoosted && !isFirstAttributeExcluded) {
      setNonBoostedExcludedValues([
        ...updatedNonBoostedExcludedValues,
        ...selectedFacetAttributes.map((res) => ({ displayValue: res })),
      ]);
    } else {
      setNonBoostedExcludedValues(updatedNonBoostedExcludedValues);
    }
    setSelectedFacetAttributes([]);

    setError(DEFAULT_MERGE_DISPLAY_NAME, 'Please name your merge to continue');
  };

  const { callback: handleSearch } = useDebounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    300
  );

  const listValues = useCallback(
    (
      values: AttributeValuesResponse['values'],
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

      const handleDisplayNameChange = async (
        oldValue: string,
        newValue: string
      ) => {
        if (oldValue === newValue) return;

        const trimmedNewValue = newValue.trim();

        const existingMergeGroup = merged!.findIndex(
          (val) => val.displayValue === oldValue
        );

        const otherMergeGroups = merged!.toSpliced(existingMergeGroup);

        const isInOtherMergeGroups = otherMergeGroups
          .map((group) =>
            group.mergedValues?.map(
              (val) => val.toLowerCase() === trimmedNewValue.toLowerCase()
            )
          )
          .flat()
          .some((val) => !!val);

        if (isInOtherMergeGroups) {
          setError(oldValue, `${trimmedNewValue} is not a unique value`);
          return;
        }

        const { isUniqueValue } = await checkMergeNameUnique({
          facetId: facet.id,
          searchQuery: trimmedNewValue,
          countryCode,
          exceptions:
            existingMergeGroup > -1
              ? merged![existingMergeGroup].mergedValues
              : undefined,
        });

        if (!isUniqueValue) {
          setError(oldValue, `${trimmedNewValue} is not a unique value`);
          return;
        }

        if (existingMergeGroup > -1) {
          setMerged([
            ...merged!.map((group, index) =>
              index === existingMergeGroup
                ? { ...group, displayValue: newValue }
                : group
            ),
          ]);
        } else {
          setMerged([
            ...merged!,
            { displayValue: newValue, mergedValues: [oldValue] },
          ]);
        }

        setError(oldValue, '');
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
          const isChecked = selectedFacetAttributes.some((attr) =>
            attributes.includes(attr)
          );

          const selectAttribute = () => {
            const updatedSelectedValues = selectedFacetAttributes.some((attr) =>
              attributes.includes(attr)
            )
              ? selectedFacetAttributes.filter(
                  (val) => !attributes.includes(val)
                )
              : [...selectedFacetAttributes, ...attributes];
            setSelectedFacetAttributes(updatedSelectedValues);
          };

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

          const errorState = errorStates[displayName] || {
            message: '',
          };

          return (
            <FacetAttributeValuesTableRow
              key={`${displayType}-${displayName}`}
              isPinned={displayType === 'included'}
              isExcluded={displayType === 'excluded'}
              data-testid={`${displayType} attribute ${index} ${displayName}`}
            >
              <Col>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={selectAttribute}
                  aria-label={`Select ${displayName} to merge`}
                />
              </Col>
              <Col>
                <AttributeWrapper>
                  {attributes.length > 1 ? (
                    <div>
                      <Text isStrong>Merged Value Group</Text>

                      {attributes.map((value, index) => {
                        return (
                          <MergedValue key={`${index}-${value}`}>
                            <Text>{value}</Text>{' '}
                            {isMergeGroup && value !== displayName && (
                              <RemoveMergedFacet
                                onClick={() => {
                                  handleRemoveFromMerge({
                                    valueToRemove: value,
                                    mergeDisplayName: displayName,
                                  });
                                }}
                                aria-label={`Remove merged facet for ${value}`}
                              />
                            )}
                          </MergedValue>
                        );
                      })}
                    </div>
                  ) : (
                    <Text>{attributes[0]}</Text>
                  )}
                </AttributeWrapper>
              </Col>

              <FlexColumnCol>
                <EditableLabel
                  displayValue={displayName}
                  onCancel={() => setError(displayName, '')}
                  onDisplayValueChange={(newValue) => {
                    handleDisplayNameChange(displayName, newValue);
                  }}
                  canCancelEdit={displayName !== DEFAULT_MERGE_DISPLAY_NAME}
                  showErrorState={!!errorStates[displayName]?.message}
                  setError={(message) => setError(displayName, message)}
                  disallowedErrorMessage={errorState.message}
                  handleUpdatedValue={(event) => {
                    event.stopPropagation();
                    if (event.target.value === '') {
                      setError(displayName, 'You must supply a value');
                    } else if (disallowedValues?.includes(event.target.value)) {
                      setError(
                        displayName,
                        `${event.target.value} is not a unique value`
                      );
                    } else {
                      setError(displayName, '');
                    }
                  }}
                />
              </FlexColumnCol>

              <Col>
                {displayType === 'included' && (
                  <OrderArrowsContainer>
                    <ArrowButton
                      direction="up"
                      aria-label={`Move ${displayName} row up`}
                      isDisabled={
                        index === 0 ||
                        !!searchQuery ||
                        selectedFacetAttributes.length > 0
                      }
                      onClick={() => {
                        const rowAboveIndex = boostedValues.findIndex(
                          (val) => val.displayValue === attributes[0]
                        );

                        const rowAboveMergeGroup = merged
                          ?.map((m) =>
                            m.mergedValues?.includes(
                              boostedValues[rowAboveIndex - 1].displayValue
                            )
                              ? m
                              : /* istanbul ignore next */
                                null
                          )
                          .filter(Boolean);

                        const newPosition =
                          rowAboveMergeGroup?.length &&
                          rowAboveMergeGroup?.[0]?.mergedValues?.length
                            ? boostedValues.findIndex(
                                (val) =>
                                  val.displayValue ===
                                  rowAboveMergeGroup?.[0]?.mergedValues?.[0]
                              )
                            : rowAboveIndex - 1;

                        const updatedBoostedValues = boostedValues.filter(
                          (val) => !attributes.includes(val.displayValue)
                        );
                        setBoostedValues(
                          updatedBoostedValues.toSpliced(
                            newPosition,
                            0,
                            ...attributes.map((attr) => ({
                              displayValue: attr,
                            }))
                          )
                        );
                      }}
                    />

                    <ArrowButton
                      direction="down"
                      aria-label={`Move ${displayName} row down`}
                      isDisabled={
                        index === rows.length - 1 ||
                        !!searchQuery ||
                        selectedFacetAttributes.length > 0
                      }
                      onClick={() => {
                        const rowBelowIndex =
                          boostedValues.findIndex(
                            (val) =>
                              val.displayValue === attributes.slice(-1).pop()
                          ) + 1;

                        const rowBelowMergeGroup = merged
                          ?.map((m) =>
                            m.mergedValues?.includes(
                              boostedValues[rowBelowIndex].displayValue
                            )
                              ? m
                              : /* istanbul ignore next */
                                null
                          )
                          .filter(Boolean);

                        const valueToInsertAfter =
                          rowBelowMergeGroup?.[0]?.mergedValues
                            ?.slice(-1)
                            .pop() || boostedValues[rowBelowIndex].displayValue;

                        const updatedBoostedValues = boostedValues.filter(
                          (val) => !attributes.includes(val.displayValue)
                        );

                        const newPosition =
                          updatedBoostedValues.findIndex(
                            (val) => val.displayValue === valueToInsertAfter
                          ) + 1;

                        setBoostedValues(
                          updatedBoostedValues.toSpliced(
                            newPosition,
                            0,
                            ...attributes.map((attr) => ({
                              displayValue: attr,
                            }))
                          )
                        );
                      }}
                    />
                  </OrderArrowsContainer>
                )}
              </Col>

              <Col>
                <FacetOrderDropdown
                  hasAlgoControl
                  status={displayType}
                  onChange={onOrderChange}
                  attribute={displayName}
                />
              </Col>
            </FacetAttributeValuesTableRow>
          );
        }
      );
    },
    [
      boostedValues,
      checkMergeNameUnique,
      countryCode,
      excludedValues,
      facet.id,
      merged,
      nonBoostedExcludedValues,
      errorStates,
      searchQuery,
      selectedFacetAttributes,
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
    selectedFacetAttributes.length ===
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
              isDisabled={selectedFacetAttributes.length < 2}
              onClick={handleMerge}
            >
              Merge ({selectedFacetAttributes.length})
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

                            setSelectedFacetAttributes(selectedAttributes);
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
          onClick={onSave}
          disabled={Object.values(errorStates).some((state) => state)}
        >
          Save
        </Button>
      </ModalFooter>
    </>
  );
};

type Props = {
  countryCode: CountryCode;
  facet: ReturnedGlobalFacet;
  onClose: () => void;
};

export const GlobalFacetPanelModal = ({
  countryCode,
  facet,
  onClose,
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
    />
  );
};
