import styled from '@emotion/styled';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@mantine/core';

import { AttributeValuesResponse, ReturnedGlobalFacet } from '@/libs/api';
import {
  useDebounce,
  useGetFacetAttributeValues,
  useGlobalFacetUpdate,
} from '@/libs/hooks';

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
}) => {
  const [editFacetValues, setEditFacetValues] = useState<AttributeValue[]>([]);
  const [originalFacetValues, setOriginalFacetValues] = useState<
    AttributeValue[]
  >([]);
  const [isSettingName, setIsSettingName] = useState(false);

  const [selectedFacetAttributes, setSelectedFacetAttributes] = useState<
    AttributeValue[]
  >([]);
  const [hasSelectedAllRows, setHasSelectedAllRows] = useState<boolean>(false);

  const [orderedPinnedValues, setOrderedPinnedValues] = useState<string[]>([]);

  const [orderedExcludedValues, setOrderedExcludedValues] = useState<string[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState('');

  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [error, setError] = useState('');

  const { handleGlobalFacetUpdate } = useGlobalFacetUpdate();

  const addToSelectedRow = (attribute: AttributeValue) => {
    const updatedSelectedFacetAttributess = [
      ...selectedFacetAttributes,
      attribute,
    ];
    setSelectedFacetAttributes(updatedSelectedFacetAttributess);
  };

  const removeFromSelectedRow = (attribute: AttributeValue) => {
    const updatedSelectedFacetAttributess = selectedFacetAttributes.filter(
      (value) => value.attribute !== attribute.attribute
    );
    setSelectedFacetAttributes(updatedSelectedFacetAttributess);

    if (hasSelectedAllRows) {
      setHasSelectedAllRows(false);
    }
  };

  const filteredEditFacetValues = useMemo(() => {
    const filteredValues = !searchQuery
      ? editFacetValues
      : editFacetValues.filter(
          (value) =>
            value.displayValue
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            value.attribute.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const sortedValues = [...filteredValues].sort((a, b) => {
      if (
        orderedPinnedValues.includes(a.attribute) &&
        !orderedPinnedValues.includes(b.attribute)
      ) {
        return -1;
      }
      if (
        !orderedPinnedValues.includes(a.attribute) &&
        orderedPinnedValues.includes(b.attribute)
      ) {
        return 1;
      }
      if (
        orderedPinnedValues.includes(a.attribute) &&
        orderedPinnedValues.includes(b.attribute)
      ) {
        return (
          orderedPinnedValues.indexOf(a.attribute) -
          orderedPinnedValues.indexOf(b.attribute)
        );
      }

      if (
        orderedExcludedValues.includes(a.attribute) &&
        !orderedExcludedValues?.includes(b.attribute)
      ) {
        return 1;
      }
      if (
        !orderedExcludedValues?.includes(a.attribute) &&
        orderedExcludedValues?.includes(b.attribute)
      ) {
        return -1;
      }

      return 0;
    });

    return sortedValues;
  }, [
    editFacetValues,
    searchQuery,
    orderedPinnedValues,
    orderedExcludedValues,
  ]);

  const { attributeValues } = useGetFacetAttributeValues(facet.id);

  const { callback: handleSearch } = useDebounce((val: string) => {
    setSearchQuery(val);
  }, 300);

  useEffect(() => {
    let facetValues = attributeValues.map((value, index) => ({
      ...value,
      attribute: value.displayValue,
      index,
    }));

    if (facet.merged) {
      facet.merged.forEach((mergeGroup) => {
        if (mergeGroup.displayValue && mergeGroup.mergedValues?.length) {
          facetValues = facetValues.filter(
            (val) => !mergeGroup.mergedValues?.includes(val.attribute)
          );
          facetValues = [
            ...facetValues,
            {
              displayValue: mergeGroup.displayValue,
              attribute: mergeGroup.mergedValues[0],
              mergedValues: mergeGroup.mergedValues,
              index: 0,
            } as AttributeValue,
          ].sort((a, b) => a.index - b.index);
        }
      });
    }

    setEditFacetValues(facetValues);
    setOriginalFacetValues(facetValues);
    const pinned = attributeValues.filter((value) =>
      facet.boosted?.includes(value.displayValue)
    );
    const excluded = attributeValues.filter((value) =>
      facet.excludedValues?.includes(value.displayValue)
    );

    setOrderedPinnedValues([...pinned.map((value) => value.displayValue)]);
    setOrderedExcludedValues([...excluded.map((value) => value.displayValue)]);
  }, [attributeValues, facet.boosted, facet.excludedValues, facet.merged]);

  const handleEditName = (displayValue: string, newValue: string) => {
    setEditFacetValues((prev) => {
      return prev.map((value) => {
        if (value.displayValue === displayValue) {
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

  const mergeValues = (facetsToMerge: string[], displayValue?: string) => {
    setEditFacetValues((prev) => {
      const firstValue = prev.find((value) =>
        facetsToMerge.includes(value.displayValue)
      );
      // this is here since find returns type | undefined
      /* istanbul ignore next */
      if (!firstValue) return prev;
      const restOfValues = prev.filter(
        (value) => !facetsToMerge.includes(value.attribute)
      );
      const newValues = [
        {
          ...firstValue,
          displayValue: displayValue || defaultMergedDisplayValue,
          mergedValues: facetsToMerge,
          index: firstValue.index,
        },
        ...restOfValues,
      ].sort((a, b) => a.index - b.index);
      return newValues;
    });
  };

  const handleMerge = () => {
    const valuesToMerge = selectedFacetAttributes
      .map((facet) =>
        facet.mergedValues ? facet.mergedValues : facet.attribute
      )
      .flat();
    mergeValues(valuesToMerge);
    setIsSaveDisabled(true);
    setIsSettingName(true);
    setSelectedFacetAttributes([]);
  };

  const handleDemerge = (
    valueToDemerge: string,
    mergeGroupToAmend?: AttributeValue
  ) => {
    setEditFacetValues((prev) => {
      if (
        mergeGroupToAmend?.mergedValues &&
        mergeGroupToAmend.mergedValues.length > 2
      ) {
        const originalAttribute = originalFacetValues.find(
          (attribute) => attribute.displayValue === valueToDemerge
        );

        // There will always be an original attribute since we are demerging
        // istanbul ignore next
        if (!originalAttribute) return prev;

        const mergeGroupWithAttributeRemoved = {
          displayValue: mergeGroupToAmend.displayValue,
          mergedValues: mergeGroupToAmend.mergedValues.filter(
            (value) => value !== valueToDemerge
          ),
          attribute: originalAttribute.attribute,
          index: originalAttribute.index,
        };

        const newValues = [
          ...prev.filter(
            (attribute) =>
              attribute.displayValue !== mergeGroupToAmend.displayValue
          ),
          mergeGroupWithAttributeRemoved,
          {
            ...originalAttribute,
            index: originalAttribute.index,
          },
        ].sort((a, b) => a.index - b.index);
        return newValues;
      } else if (
        mergeGroupToAmend?.mergedValues &&
        mergeGroupToAmend.mergedValues.length === 2
      ) {
        const originalAttributes = [
          ...mergeGroupToAmend.mergedValues.map((value) => {
            const attribute = originalFacetValues.find(
              (attribute) => attribute.displayValue === value
            );
            return { ...attribute! };
          }),
        ];
        const newValues = [
          ...prev.filter(
            (item) => !item.mergedValues?.includes(valueToDemerge)
          ),
          ...originalAttributes,
        ].sort((a, b) => a.index! - b.index!);

        return newValues;
      }
      // There will always be a merge group, otherwise the demerge button would not be visible
      // istanbul ignore next
      return prev;
    });
  };

  const handleStatusChange = (
    attribute: string,
    status: 'included' | 'excluded'
  ) => {
    setEditFacetValues((prev) =>
      prev.map((value) => {
        if (value.attribute === attribute) {
          if (status === 'included') {
            setOrderedPinnedValues((prev) => [...prev, attribute]);
            setOrderedExcludedValues((prev) =>
              prev.filter((value) => value !== attribute)
            );
          } else {
            setOrderedExcludedValues((prev) => [...prev, attribute]);
            setOrderedPinnedValues((prev) =>
              prev.filter((value) => value !== attribute)
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
      mergedValues: group.mergedValues,
    }));

    switch (facetType) {
      case 'global':
        await handleGlobalFacetUpdate({
          facetId: facet.id,
          data: {
            ...facet,
            boosted: orderedPinnedValues,
            excludedValues: orderedExcludedValues,
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
        updatedValues(orderedPinnedValues, orderedExcludedValues, facet.id);
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
                <Search onChange={(e) => handleSearch(e.target.value)} />
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
                  const { displayValue, attribute, mergedValues } = facet;
                  const isSelected = selectedFacetAttributes.includes(facet);
                  const shouldNotMerge = !!selectedFacetAttributes.find(
                    (selectedFacet) =>
                      selectedFacet !== facet &&
                      selectedFacet.mergedValues?.length &&
                      facet.mergedValues?.length
                  );

                  return (
                    <FacetAttributeValuesTableRow
                      key={`attribute-${displayValue}-${index}`}
                      isPinned={orderedPinnedValues.includes(attribute)}
                      isExcluded={orderedExcludedValues?.includes(attribute)}
                      data-testid="rows"
                      aria-label={`attribute ${index} ${attribute}`}
                    >
                      <Col>
                        {facetType === 'global' && (
                          <input
                            type="checkbox"
                            disabled={shouldNotMerge}
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
                              {mergedValues.map((value, index) => (
                                <MergedValue key={`${index}-${value}`}>
                                  <Text>{value}</Text>{' '}
                                  {facetType === 'global' && (
                                    <RemoveMergedFacet
                                      onClick={() =>
                                        !isSettingName &&
                                        handleDemerge(
                                          value,
                                          filteredEditFacetValues.find(
                                            (attribute) =>
                                              attribute.mergedValues?.includes(
                                                value
                                              )
                                          )
                                        )
                                      }
                                      aria-label={`Remove merged facet for ${value}`}
                                    />
                                  )}
                                </MergedValue>
                              ))}
                            </div>
                          ) : (
                            <Text>{attribute}</Text>
                          )}
                        </AttributeWrapper>
                      </Col>

                      <FlexColumnCol>
                        {facetType === 'global' ? (
                          <EditableLabel
                            displayValue={displayValue}
                            onDisplayValueChange={(newValue) => {
                              if (newValue === defaultMergedDisplayValue) {
                                setIsSaveDisabled(true);
                                setError('Please name your merge to continue');
                                return;
                              }

                              handleEditName(displayValue, newValue);

                              setIsSettingName(false);
                            }}
                            shouldOpenFromParent={
                              displayValue === defaultMergedDisplayValue
                            }
                            error={
                              displayValue === defaultMergedDisplayValue
                                ? error
                                : undefined
                            }
                          />
                        ) : (
                          <Text>{displayValue}</Text>
                        )}
                        {error &&
                          displayValue === defaultMergedDisplayValue && (
                            <StyledError>{error}</StyledError>
                          )}
                      </FlexColumnCol>

                      <Col>
                        {orderedPinnedValues.includes(attribute) && (
                          <OrderArrowsContainer>
                            <ArrowButton
                              direction="up"
                              aria-label={`Move ${attribute} row up`}
                              onClick={() => {
                                setOrderedPinnedValues((prev) => {
                                  const i = prev.indexOf(attribute);

                                  const newOrdered = [...prev];

                                  return [
                                    ...newOrdered.slice(0, i - 1),
                                    attribute,
                                    newOrdered[i - 1],
                                    ...newOrdered.slice(i + 1),
                                  ];
                                });
                                setIsSaveDisabled(false);
                              }}
                              isDisabled={index === 0}
                            />

                            <ArrowButton
                              direction="down"
                              aria-label={`Move ${attribute} row down`}
                              onClick={() => {
                                setOrderedPinnedValues((prev) => {
                                  const i = prev.indexOf(attribute);

                                  const newOrdered = [...prev];

                                  return [
                                    ...newOrdered.slice(0, i),
                                    newOrdered[i + 1],
                                    attribute,
                                    ...newOrdered.slice(i + 2),
                                  ];
                                });
                                setIsSaveDisabled(false);
                              }}
                              isDisabled={
                                index === orderedPinnedValues.length - 1
                              }
                            />
                          </OrderArrowsContainer>
                        )}
                      </Col>

                      <Col>
                        <FacetOrderDropdown
                          status={
                            orderedPinnedValues.includes(attribute)
                              ? 'included'
                              : orderedExcludedValues.includes(attribute)
                                ? 'excluded'
                                : undefined
                          }
                          onChange={(status) =>
                            handleStatusChange(attribute, status)
                          }
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
            isDisabled={isSaveDisabled}
            aria-label="Save changes to attributes"
          >
            {facetType === 'global' ? 'Save' : 'Done'}
          </Button>
        </ModalFooter>
      </Modal.Content>
    </Modal.Root>
  );
};
