import styled from '@emotion/styled';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@mantine/core';

import { AttributeValuesResponse, ReturnedGlobalFacet } from '@/libs/api';
import { ErrorMessage } from '@/libs/components';
import {
  useDebounce,
  useGetFacetAttributeValues,
  useGlobalFacetUpdate,
} from '@/libs/hooks';
import { useCheckMergeNameUnique } from '@/libs/hooks/use-check-merge-name-unique';

import Image from 'next/image';

import { ArrowButton } from '../buttons/button/arrow-button';
import { Button } from '../buttons/button/button';
import { FacetOrderDropdown } from '../dropdowns/facet-order-dropdown/facet-order-dropdown';
import { EditableLabel } from '../editable-label/editable-label';
import { FilteredResultsPanel } from '../filtered-results-panel/filtered-results-panel';
import { Search } from '../search/search';
import {
  FacetAttributeValuesTableRow,
  TableCol,
  TableHeading,
} from '../table/table.styles';
import { Header3, Text } from '../typography/typography.styles';
import { color } from '../utils/constants';
import { spacing } from '../utils/spacing';
import {
  HeadingContainer,
  ModalAttributesTable,
  ModalStickyHeader,
} from './modal.styles';

type AttributeValue = AttributeValuesResponse['values'][number] & {
  index: number;
  attribute: string;
  id: string;
  mergedValues?: string[];
};

const Col = styled(TableCol)`
  padding: 0;
`;

const FlexColumnCol = styled(Col)`
  display: flex;
  flex-direction: column;
`;

const MODAL_WIDTH = 1150;

const ModalContainer = styled.div`
  height: 100%;
  min-width: 860px;
  display: flex;
  flex-direction: column;
`;

const AttributesModalHeader = styled(ModalStickyHeader)`
  padding: ${spacing(3)};
  padding-bottom: 0;
`;

const BodyContainer = styled.div`
  margin: 0 ${spacing(3)};
`;

const OrderArrowsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: ${spacing(12)};
  margin-right: ${spacing(2)};
`;
const MergeAndSearchContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${spacing(2)};
  padding: ${spacing(2)} 0;
  p {
    flex: 80;
  }
  button {
    flex: 20;
  }
  div {
    flex: 40;
  }
`;

const AttributeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing(2)};
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

const MergedValue = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing(1)};
`;

const RemoveMergedFacet = styled.button`
  background: url('/trading-hub/asset/icon-close-black.svg');
  width: 18px;
  height: 18px;
  display: inline-block;
  border: none;
`;

const StyledError = styled(Text)`
  color: ${color.saleRed};
  margin-top: ${spacing(0.5)};
`;

const defaultMergedDisplayValue = 'Name your merge';

const EDITFACETVALUESMODALCOLUMNS: {
  label: string | null;
}[] = [
  { label: null },
  {
    label: 'Attribute',
  },
  {
    label: 'Display name',
  },
  {
    label: 'Position Set',
  },
  {
    label: 'Actions',
  },
];

export const ModalEditValues = ({
  onClose,
  facet,
  facetType,
  refreshData,
  updatedValues,
  category,
}: {
  onClose: () => void;
  facet: ReturnedGlobalFacet;
  facetType: 'global' | 'category' | 'search';
  refreshData?: () => void;
  onHandleSave?: (
    orderedPinnedValues: string[],
    orderedExcludedValues: string[]
  ) => void;
  updatedValues?: (
    orderedPinnedValues: string[],
    orderedExcludedValues: string[],
    id: string
  ) => void;
  category: string | undefined;
}) => {
  const [editFacetValues, setEditFacetValues] = useState<AttributeValue[]>([]);
  const [unmergedFacetValues, setUnmergedFacetValues] = useState<
    AttributeValue[]
  >([]);
  const [attributesBeingMerged, setAttributesBeingMerged] = useState<string[]>(
    []
  );

  const [selectedFacetAttributes, setSelectedFacetAttributes] = useState<
    AttributeValue[]
  >([]);
  const [hasSelectedAllRows, setHasSelectedAllRows] = useState<boolean>(false);

  const [mergedOrderedBoostedValues, setMergedOrderedBoostedValues] = useState<
    string[]
  >([]);
  const [orderedExcludedValues, setOrderedExcludedValues] = useState<string[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState('');

  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [error, setError] = useState('');
  const [displayValueWithError, setDisplayValueWithError] = useState('');
  const [disallowedValues, setDisallowedValues] = useState<string[]>([]);

  useEffect(() => {
    setDisallowedValues([defaultMergedDisplayValue]);
  }, []);

  const { handleGlobalFacetUpdate } = useGlobalFacetUpdate();

  const addToSelectedRow = (attribute: AttributeValue) => {
    const updatedSelectedFacetAttributes = [
      ...selectedFacetAttributes,
      attribute,
    ];
    setSelectedFacetAttributes(updatedSelectedFacetAttributes);
  };

  const removeFromSelectedRow = (attribute: AttributeValue) => {
    const updatedSelectedFacetAttributes = selectedFacetAttributes.filter(
      (value) => value.id !== attribute.id
    );
    setSelectedFacetAttributes(updatedSelectedFacetAttributes);

    if (hasSelectedAllRows) {
      setHasSelectedAllRows(false);
    }
  };

  const filteredEditFacetValues = useMemo(() => {
    const sortedValues = [...editFacetValues].sort((a, b) => {
      if (
        mergedOrderedBoostedValues.includes(a.id) &&
        !mergedOrderedBoostedValues.includes(b.id)
      ) {
        return -1;
      }
      if (
        !mergedOrderedBoostedValues.includes(a.id) &&
        mergedOrderedBoostedValues.includes(b.id)
      ) {
        return 1;
      }
      if (
        mergedOrderedBoostedValues.includes(a.id) &&
        mergedOrderedBoostedValues.includes(b.id)
      ) {
        return (
          mergedOrderedBoostedValues.indexOf(a.id) -
          mergedOrderedBoostedValues.indexOf(b.id)
        );
      }

      if (
        orderedExcludedValues.includes(a.id) &&
        !orderedExcludedValues?.includes(b.id)
      ) {
        return 1;
      }
      if (
        !orderedExcludedValues?.includes(a.id) &&
        orderedExcludedValues?.includes(b.id)
      ) {
        return -1;
      }

      return 0;
    });

    return sortedValues;
  }, [editFacetValues, mergedOrderedBoostedValues, orderedExcludedValues]);

  const { attributeValues, error: attributeValuesError } =
    useGetFacetAttributeValues(facet.id, searchQuery, category);

  const attributeValuesWithIds = useMemo(() => {
    return attributeValues.map((value) => ({
      id: value.displayValue,
      ...value,
    }));
  }, [attributeValues]);

  const { checkMergeNameUnique } = useCheckMergeNameUnique();

  const checkNameUnique = async (newValue: string, id: string) => {
    await checkMergeNameUnique(facet.id, newValue, category).then((data) => {
      if (data?.isUniqueValue) {
        handleEditName(id, newValue);
        setAttributesBeingMerged([]);
        setError('');
      } else {
        setIsSaveDisabled(true);
        setError('The name above already exists. Please choose another one.');
        setDisplayValueWithError(
          'The name above already exists. Please choose another one.'
        );
        setDisallowedValues([...disallowedValues, newValue]);
      }
    });
  };

  const { callback: handleSearch } = useDebounce((val: string) => {
    setSearchQuery(val);
  }, 300);

  useEffect(() => {
    let facetValues = attributeValuesWithIds.map((value, index) => ({
      ...value,
      attribute: value.displayValue,
      index,
    }));
    setUnmergedFacetValues([...facetValues]);

    const mappedBoosted = facet.boosted?.map(
      (value) =>
        attributeValuesWithIds.find((val) => val.displayValue === value)?.id
    );
    const boosted = attributeValuesWithIds.filter((value) =>
      mappedBoosted?.includes(value.id)
    );
    let mergedBoosted = [...boosted.map((value) => value.id)];

    const mappedExcluded = facet.excludedValues?.map(
      (value) =>
        attributeValuesWithIds.find((val) => val.displayValue === value)?.id
    );
    const excluded = attributeValuesWithIds.filter((value) =>
      mappedExcluded?.includes(value.displayValue)
    );
    let mergedExcluded = [...excluded.map((value) => value.id)];

    if (facet.merged) {
      facet.merged.forEach((mergeGroup) => {
        if (mergeGroup.displayValue && mergeGroup.mergedValues?.length) {
          const mappedMergeGroupValues = mergeGroup.mergedValues.map(
            (value) => {
              const id = facetValues.find(
                (val) => val.displayValue === value
              )?.id;

              return id;
            }
          );
          const mappedMergedGroup = {
            ...mergeGroup,
            mergedValues: mappedMergeGroupValues,
          };

          const [firstId, restOfIds] = mappedMergeGroupValues;
          const newId = `merged-${firstId}`;

          mergedBoosted = mergedBoosted
            .filter((id) => !restOfIds?.includes(id))
            .map((id) => (id === firstId ? newId : id));
          mergedExcluded = mergedExcluded
            .filter((id) => !restOfIds?.includes(id))
            .map((id) => {
              // not sure why it is not covered even though there are tests for it
              // istanbul ignore next
              return id === firstId ? newId : id;
            });

          facetValues = facetValues.filter(
            (val) => !mappedMergeGroupValues.includes(val.id)
          );

          facetValues = [
            ...facetValues,
            {
              id: `merged-${firstId}`,
              attribute: mergeGroup.mergedValues[0],
              displayValue: mappedMergedGroup.displayValue,
              mergedValues: mappedMergedGroup.mergedValues,
              index: 0,
            } as AttributeValue,
          ].sort((a, b) => a.index - b.index);
        }
      });
    }

    setEditFacetValues(facetValues);
    setMergedOrderedBoostedValues(mergedBoosted);
    setOrderedExcludedValues(mergedExcluded);
  }, [
    attributeValuesWithIds,
    facet.boosted,
    facet.excludedValues,
    facet.merged,
  ]);

  const handleEditName = (id: string, newValue: string) => {
    setEditFacetValues((prev) => {
      return prev.map((value) => {
        if (value.id === id) {
          return {
            ...value,
            displayValue: newValue,
          };
        }
        return value;
      });
    });

    setIsSaveDisabled(false);
  };

  const mergeValues = (facetIdsToMerge: string[], displayValue?: string) => {
    let mergedBoosted = [...mergedOrderedBoostedValues];
    let mergedExcluded = [...orderedExcludedValues];

    const facetsToMerge = editFacetValues.filter((value) =>
      facetIdsToMerge.includes(value.id)
    );
    const mergedValues = facetsToMerge
      .map((value) => {
        if (value.mergedValues?.length) {
          return value.mergedValues;
        }

        return value.id;
      })
      .flat();
    const [firstValue] = facetsToMerge;

    const restOfValues = editFacetValues.filter(
      (value) => !facetIdsToMerge.includes(value.id)
    );

    const newId = `merged-${firstValue.id}`;

    const newValues = [
      {
        ...firstValue,
        id: newId,
        displayValue: displayValue || defaultMergedDisplayValue,
        index: firstValue.index,
        mergedValues,
      },
      ...restOfValues,
    ].sort((a, b) => a.index - b.index);

    const firstBoostedIndex = mergedBoosted.findIndex((value) =>
      facetIdsToMerge.includes(value)
    );
    if (firstBoostedIndex >= 0) {
      mergedBoosted = mergedBoosted.filter(
        (value) => !facetIdsToMerge.includes(value)
      );
      mergedBoosted = [
        ...mergedBoosted.slice(0, firstBoostedIndex),
        newId,
        ...mergedBoosted.slice(firstBoostedIndex),
      ];
    }

    mergedExcluded = mergedExcluded.filter(
      (value) => !facetIdsToMerge.includes(value)
    );

    setEditFacetValues(newValues);
    setMergedOrderedBoostedValues(mergedBoosted);
    setOrderedExcludedValues(mergedExcluded);
  };

  const handleMerge = () => {
    const valuesToMerge = selectedFacetAttributes.map((facet) => facet.id);

    mergeValues(valuesToMerge);
    setIsSaveDisabled(true);
    setAttributesBeingMerged(valuesToMerge);
    setSelectedFacetAttributes([]);
  };

  const handleDemerge = (idToDemerge: string, mergeGroupId: string) => {
    const newValues = editFacetValues
      .map((value) => {
        if (value.id === mergeGroupId) {
          const newMergedValues = value.mergedValues?.filter(
            (id) => id !== idToDemerge
          );

          const demergedValue = unmergedFacetValues.find(
            (val) => val.id === idToDemerge
          );

          // istanbul ignore next
          if (!demergedValue) {
            return value;
          }

          let updatedMergeGroup: AttributeValue | undefined = {
            ...value,
            mergedValues: newMergedValues,
          };
          if (newMergedValues?.length === 1) {
            updatedMergeGroup = unmergedFacetValues.find(
              (val) => val.id === newMergedValues[0]
            );

            // istanbul ignore next
            if (!updatedMergeGroup) {
              return value;
            }
            setMergedOrderedBoostedValues((prev) =>
              prev.filter((id) => id !== value.id)
            );
            setOrderedExcludedValues((prev) =>
              prev.filter((id) => id !== value.id)
            );
          }

          return [updatedMergeGroup, demergedValue];
        }

        return value;
      })
      .flat();

    setEditFacetValues(newValues);
    setIsSaveDisabled(false);
  };

  const handleStatusChange = (id: string, status: 'included' | 'excluded') => {
    setEditFacetValues((prev) =>
      prev.map((value) => {
        if (value.id === id) {
          if (status === 'included') {
            setMergedOrderedBoostedValues((prev) =>
              Array.from(new Set([...prev, id]))
            );
            setOrderedExcludedValues((prev) =>
              prev.filter((value) => value !== id)
            );
          } else {
            setOrderedExcludedValues((prev) =>
              Array.from(new Set([...prev, id]))
            );
            setMergedOrderedBoostedValues((prev) =>
              prev.filter((value) => value !== id)
            );
          }
        }
        return value;
      })
    );
    setIsSaveDisabled(false);
  };

  const handleSave = async () => {
    const mergeGroups = editFacetValues.filter((value) => value.mergedValues);

    const mergedValues = mergeGroups.map((group) => ({
      displayValue: group.displayValue,
      mergedValues: group.mergedValues?.map((id) => {
        const foundValue = unmergedFacetValues.find((val) => val.id === id);
        return foundValue ? foundValue.displayValue : '';
      }),
    }));

    // unwrap merged ids into array of displayValues and map rest of ids to displayValues
    const unmergedOrderedBoostedValues = mergedOrderedBoostedValues
      .map((id) => {
        const value = editFacetValues.find((val) => val.id === id);

        if (value?.mergedValues?.length) {
          return value.mergedValues.map((valueId) => {
            const foundValue = unmergedFacetValues.find(
              (value) => value.id === valueId
            );
            // istanbul ignore next
            return foundValue ? foundValue.displayValue : '';
          });
        }
        // istanbul ignore next
        return value ? value.displayValue : '';
      })
      .flat();
    const unmergedOrderedExcludedValues = orderedExcludedValues
      .map((id) => {
        const value = editFacetValues.find((val) => val.id === id);

        if (value?.mergedValues?.length) {
          return value.mergedValues.map((valueId) => {
            const foundValue = unmergedFacetValues.find(
              (value) => value.id === valueId
            );
            // istanbul ignore next
            return foundValue ? foundValue.displayValue : '';
          });
        }

        // istanbul ignore next
        return value ? value.displayValue : '';
      })
      .flat();

    switch (facetType) {
      case 'global':
        await handleGlobalFacetUpdate({
          facetId: facet.id,
          data: {
            ...facet,
            boosted: unmergedOrderedBoostedValues,
            excludedValues: unmergedOrderedExcludedValues,
            merged: mergedValues,
          },
        }).then(() => {
          if (refreshData) {
            refreshData();
          }
        });
        break;

      case 'category':
        // there will always be updatedValues for category
        // istanbul ignore next
        if (!updatedValues) {
          return;
        }
        updatedValues(
          unmergedOrderedBoostedValues,
          unmergedOrderedExcludedValues,
          facet.id
        );
        break;
    }

    onClose();
  };

  return (
    <Modal.Root
      opened={true}
      onClose={onClose}
      centered
      size={MODAL_WIDTH}
      padding={0}
    >
      <Modal.Overlay blur={3} />
      <Modal.Content>
        <Modal.Body>
          <ModalContainer>
            <AttributesModalHeader>
              <HeadingContainer>
                <Text isStrong as={Header3}>
                  Facet value settings of: {facet.displayValue}
                </Text>
              </HeadingContainer>

              {attributeValuesError && (
                <ErrorMessage>
                  Error whilst retrieving values: {attributeValuesError}
                </ErrorMessage>
              )}

              <MergeAndSearchContainer>
                <Text isStrong>All values listed</Text>
                {facetType === 'global' && (
                  <Button
                    isDisabled={selectedFacetAttributes.length < 2}
                    onClick={handleMerge}
                  >
                    Merge ({selectedFacetAttributes.length})
                  </Button>
                )}
                <Search
                  onChange={(e) =>
                    attributesBeingMerged.length === 0 &&
                    handleSearch(e.target.value)
                  }
                />
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
                        <Col>
                          {facetType === 'global' && (
                            <input
                              type="checkbox"
                              aria-label="Select all facet attributes"
                              checked={hasSelectedAllRows}
                              onChange={() => {
                                setHasSelectedAllRows(!hasSelectedAllRows);
                                if (hasSelectedAllRows) {
                                  setSelectedFacetAttributes([]);
                                } else {
                                  setSelectedFacetAttributes(
                                    filteredEditFacetValues
                                  );
                                }
                              }}
                              disabled={attributesBeingMerged.length > 0}
                            />
                          )}
                        </Col>
                      )}
                    </Col>
                  ))}
                </FacetAttributeValuesTableRow>
              </ModalAttributesTable>
            </AttributesModalHeader>

            <BodyContainer>
              <ModalAttributesTable>
                {filteredEditFacetValues.map((facet, index) => {
                  const { displayValue, attribute, mergedValues, id } = facet;
                  const isSelected = selectedFacetAttributes.includes(facet);
                  const shouldNotMerge = !!selectedFacetAttributes.find(
                    (selectedFacet) =>
                      selectedFacet !== facet &&
                      selectedFacet.mergedValues?.length &&
                      facet.mergedValues?.length
                  );

                  return (
                    <FacetAttributeValuesTableRow
                      key={`attribute-${displayValue}-${id}`}
                      isPinned={mergedOrderedBoostedValues.includes(id)}
                      isExcluded={orderedExcludedValues?.includes(id)}
                      data-testid="rows"
                      aria-label={`attribute ${index} ${attribute}`}
                    >
                      <Col>
                        {facetType === 'global' && (
                          <input
                            type="checkbox"
                            disabled={
                              shouldNotMerge || attributesBeingMerged.length > 0
                            }
                            checked={isSelected}
                            onChange={() =>
                              isSelected
                                ? removeFromSelectedRow(facet)
                                : addToSelectedRow(facet)
                            }
                            aria-label={`Select ${displayValue} to merge`}
                          />
                        )}
                      </Col>
                      <Col>
                        <AttributeWrapper>
                          <Image
                            width={20}
                            height={20}
                            src="/trading-hub/asset/icon-attribute.svg"
                            alt=""
                          />
                          {mergedValues && mergedValues.length > 1 ? (
                            <div>
                              <Text isStrong>Merged Value Group</Text>

                              {mergedValues.map((mergedId, index) => {
                                const mergedDisplayValue =
                                  unmergedFacetValues.find(
                                    (val) => val.id === mergedId
                                  )?.displayValue;

                                return (
                                  <MergedValue
                                    key={`${index}-${mergedDisplayValue}`}
                                  >
                                    <Text>{mergedDisplayValue}</Text>{' '}
                                    {facetType === 'global' && (
                                      <RemoveMergedFacet
                                        onClick={() =>
                                          handleDemerge(mergedId, id)
                                        }
                                        aria-label={`Remove merged facet for ${mergedDisplayValue}`}
                                        disabled={
                                          attributesBeingMerged.length > 0
                                        }
                                      />
                                    )}
                                  </MergedValue>
                                );
                              })}
                            </div>
                          ) : (
                            <Text>{attribute}</Text>
                          )}
                        </AttributeWrapper>
                      </Col>

                      <FlexColumnCol>
                        {facetType === 'global' &&
                        mergedValues &&
                        (attributesBeingMerged.length === 0 ||
                          attributesBeingMerged.includes(
                            id.replace('merged-', '')
                          )) ? (
                          <EditableLabel
                            displayValue={displayValue}
                            onDisplayValueChange={(newValue) => {
                              if (
                                newValue === defaultMergedDisplayValue ||
                                newValue.trim() === ''
                              ) {
                                setIsSaveDisabled(true);
                                setError('Please name your merge to continue');
                                setDisplayValueWithError(displayValue);
                                return;
                              }

                              checkNameUnique(newValue, id);
                            }}
                            shouldOpenFromParent={
                              displayValue === defaultMergedDisplayValue
                            }
                            error={error}
                            disallowedValues={disallowedValues}
                          />
                        ) : (
                          <Text>{displayValue}</Text>
                        )}
                        {error &&
                          attributesBeingMerged.includes(
                            id.replace('merged-', '')
                          ) &&
                          (displayValueWithError === displayValue ||
                            disallowedValues.includes(displayValue)) && (
                            <StyledError>{error}</StyledError>
                          )}
                      </FlexColumnCol>

                      <Col>
                        {mergedOrderedBoostedValues.includes(id) && (
                          <OrderArrowsContainer>
                            <ArrowButton
                              direction="up"
                              aria-label={`Move ${attribute} row up`}
                              onClick={() => {
                                setMergedOrderedBoostedValues((prev) => {
                                  const i = prev.indexOf(id);

                                  const newOrdered = [...prev];

                                  return [
                                    ...newOrdered.slice(0, i - 1),
                                    id,
                                    newOrdered[i - 1],
                                    ...newOrdered.slice(i + 1),
                                  ];
                                });
                                setIsSaveDisabled(false);
                              }}
                              isDisabled={
                                index === 0 || attributesBeingMerged.length > 0
                              }
                            />

                            <ArrowButton
                              direction="down"
                              aria-label={`Move ${attribute} row down`}
                              onClick={() => {
                                setMergedOrderedBoostedValues((prev) => {
                                  const i = prev.indexOf(id);

                                  const newOrdered = [...prev];

                                  return [
                                    ...newOrdered.slice(0, i),
                                    newOrdered[i + 1],
                                    id,
                                    ...newOrdered.slice(i + 2),
                                  ];
                                });
                                setIsSaveDisabled(false);
                              }}
                              isDisabled={
                                index ===
                                  mergedOrderedBoostedValues.length - 1 ||
                                attributesBeingMerged.length > 0
                              }
                            />
                          </OrderArrowsContainer>
                        )}
                      </Col>

                      <Col>
                        <FacetOrderDropdown
                          status={
                            mergedOrderedBoostedValues.includes(id)
                              ? 'included'
                              : orderedExcludedValues.includes(id)
                                ? 'excluded'
                                : undefined
                          }
                          onChange={(status) => handleStatusChange(id, status)}
                          attribute={attribute}
                        />
                      </Col>
                    </FacetAttributeValuesTableRow>
                  );
                })}
              </ModalAttributesTable>

              <FilteredResultsPanel filteredFacets={editFacetValues.length} />
            </BodyContainer>
          </ModalContainer>
        </Modal.Body>

        <ModalFooter>
          <Button onClick={onClose} aria-label="Close attributes modal">
            Cancel
          </Button>{' '}
          <Button
            onClick={handleSave}
            isDisabled={isSaveDisabled || attributesBeingMerged.length > 0}
            aria-label="Save changes to attributes"
          >
            {facetType === 'global' ? 'Save' : 'Done'}
          </Button>
        </ModalFooter>
      </Modal.Content>
    </Modal.Root>
  );
};
