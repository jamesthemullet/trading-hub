import styled from '@emotion/styled';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@mantine/core';

import { AttributeValuesResponse, ReturnedGlobalFacet } from '@/libs/api';
import { useDebounce, useGlobalFacetUpdate } from '@/libs/hooks';
import { useGetFacetAttributeValues } from '@/libs/hooks';

import Image from 'next/image';

import { ArrowButton } from '../buttons/button/arrow-button';
import { Button } from '../buttons/button/button';
import { FacetOrderDropdown } from '../dropdowns/facet-order-dropdown/facet-order-dropdown';
import { DisplayName, EditableLabel } from '../editable-label/editable-label';
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
import { HeadingAndCloseButton, ModalAttributesTable } from './modal.styles';

type AttributeValue = AttributeValuesResponse['values'][number] & {
  index: number;
  attribute: string;
};

const Col = styled(TableCol)`
  justify-content: space-between;
  flex: 20;
  padding: 0;
`;

const MODAL_WIDTH = 1150;

const ModalContainer = styled.div`
  height: 680px;
  display: flex;
  flex-direction: column;
  margin: ${spacing(3)};
  height: 100%;
  min-width: 860px;
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

const defaultMergedDisplayValue = 'Name your merged value group';

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
  canMerge = false,
}: {
  onClose: () => void;
  facet: ReturnedGlobalFacet;
  canMerge?: boolean;
}) => {
  const [editFacetValues, setEditFacetValues] = useState<AttributeValue[]>([]);
  const [mergeList, setMergeList] = useState<string[]>([]);
  const [orderedPinnedValues, setOrderedPinnedValues] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [facetMergedValues, setFacetMergedValues] = useState(facet.merged);

  const filteredEditFacetValues = useMemo(() => {
    const filteredValues = !searchQuery
      ? editFacetValues
      : editFacetValues.filter((value) =>
          value.displayValue.toLowerCase().includes(searchQuery.toLowerCase())
        );

    // Array.toSorted does not work in test env
    // eslint-disable-next-line functional/immutable-data
    return filteredValues.sort((a, b) => {
      // pinned
      if (a.isPinned && !b.isPinned) {
        return -1;
      }
      if (!a.isPinned && b.isPinned) {
        return 1;
      }
      if (a.isPinned && b.isPinned) {
        return (
          orderedPinnedValues.indexOf(a.attribute) -
          orderedPinnedValues.indexOf(b.attribute)
        );
      }

      // excluded
      if (a.isExcluded && !b.isExcluded) {
        return 1;
      }
      if (!a.isExcluded && b.isExcluded) {
        return -1;
      }

      return 0;
    });
  }, [editFacetValues, orderedPinnedValues, searchQuery]);

  const { attributeValues } = useGetFacetAttributeValues(facet.id);
  const { handleUpdate } = useGlobalFacetUpdate();

  const { callback: handleSearch } = useDebounce((val: string) => {
    setSearchQuery(val);
  }, 300);

  useEffect(() => {
    const facetValues = attributeValues.map((value, index) => ({
      ...value,
      attribute: value.displayValue.toLowerCase(),
      index,
    }));

    setEditFacetValues(facetValues);
    setOrderedPinnedValues(
      facetValues
        .filter((value) => value.isPinned)
        .map((value) => value.attribute)
    );

    facet.merged?.forEach((merged) => {
      if (merged.mergedValues) {
        mergeValues(merged.mergedValues, merged.displayValue);
      }
    });
  }, [attributeValues, facet.merged]);

  const handleSelect = (
    attribute: string,
    mergedValues: string[] | undefined
  ) => {
    if (mergedValues && mergedValues.length > 1) {
      if (mergeList.includes(mergedValues[0])) {
        setMergeList((prev) =>
          prev.filter((value) => !mergedValues.includes(value.toLowerCase()))
        );
        return;
      }
      const valuesNotInMergeList = mergedValues.filter(
        (value) => !mergeList.includes(value.toLowerCase())
      );

      setMergeList([...mergeList, ...valuesNotInMergeList]);
      return;
    }

    if (!mergeList.includes(attribute.toLowerCase())) {
      setMergeList([...mergeList, attribute.toLowerCase()]);
    } else {
      setMergeList(
        mergeList.filter((item) => item !== attribute.toLowerCase())
      );
    }
  };

  const mergeValues = (facetsToMerge: string[], displayValue?: string) => {
    setEditFacetValues((prev) => {
      const firstValue = prev.find((value) =>
        facetsToMerge.includes(value.attribute.toLowerCase())
      );

      // this is here since find returns type | undefined
      /* istanbul ignore next */
      if (!firstValue) return prev;

      const pinnedValues = prev.filter((value) => value.isPinned);
      const restOfValues = prev.filter(
        (value) => !facetsToMerge.includes(value.attribute.toLowerCase())
      );

      const newValues = [
        {
          ...firstValue,
          displayValue: displayValue || defaultMergedDisplayValue,
          mergedValues: facetsToMerge,
          index: pinnedValues.length,
        },
        ...restOfValues,
      ];

      return newValues;
    });
  };

  const handleMerge = () => {
    mergeValues(mergeList);
    setFacetMergedValues((prev) =>
      prev?.some((values) =>
        values.mergedValues?.some((v) => mergeList.includes(v))
      )
        ? prev?.map((values) => {
            if (values.mergedValues?.some((v) => mergeList.includes(v))) {
              return {
                ...values,
                mergedValues: mergeList,
              };
            }
            return values;
          })
        : [
            ...(prev || []),
            {
              mergedValues: mergeList,
              displayValue: defaultMergedDisplayValue,
            },
          ]
    );
    setMergeList([]);
  };

  const handleDemerge = (
    valueToDemerge: string,
    mergedValues: string[],
    displayValue: string
  ) => {
    setEditFacetValues((prev) => {
      let demergedValue: AttributeValue | undefined;

      const updatedFacets = prev.map((value, index) => {
        const { mergedValues } = value;

        if (mergedValues?.length && mergedValues.includes(value.attribute)) {
          const initialDemergedValue = attributeValues.find(
            (attribute) =>
              attribute.displayValue.toLowerCase() === valueToDemerge
          );

          if (initialDemergedValue) {
            demergedValue = {
              ...initialDemergedValue,
              index: index + 1,
              attribute: valueToDemerge,
            };
          }

          const newMergedValues = mergedValues.filter(
            (item) => item !== valueToDemerge
          );

          if (newMergedValues.length <= 1) {
            const initialValue = attributeValues.find(
              (attribute) =>
                attribute.displayValue.toLowerCase() === newMergedValues[0]
            );

            if (initialValue) {
              return {
                ...initialValue,
                index: index,
                attribute: initialValue?.displayValue.toLowerCase(),
              };
            }
          }

          return {
            ...value,
            mergedValues: newMergedValues,
          };
        }

        return value;
      });

      if (demergedValue) {
        return [...updatedFacets, demergedValue].sort(
          (a, b) => a.index - b.index
        );
      }

      // again type safety, demerged value will be found but initialised as undefined so this is here as a fallback
      /* istanbul ignore next */
      return updatedFacets;
    });
    setFacetMergedValues((prev) => {
      const mergedListWithoutValue = mergedValues.filter(
        (value) => value !== valueToDemerge
      );

      if (mergedListWithoutValue.length > 1) {
        return prev?.map((merged) => {
          if (merged.displayValue === displayValue) {
            return {
              ...merged,
              mergedValues: mergedListWithoutValue,
            };
          }

          return merged;
        });
      }

      return prev?.filter((merged) => merged.displayValue !== displayValue);
    });
  };

  const handleStatusChange = (
    attribute: string,
    status: 'included' | 'excluded'
  ) => {
    setEditFacetValues((prev) =>
      prev.map((value) => {
        if (value.attribute === attribute) {
          let { isExcluded, isPinned } = value;

          if (status === 'included') {
            isPinned = true;
            isExcluded = false;
            setOrderedPinnedValues((prev) => [...prev, attribute]);
          } else {
            isPinned = false;
            isExcluded = true;
            setOrderedPinnedValues((prev) =>
              prev.filter((value) => value !== attribute)
            );
          }

          return {
            ...value,
            isPinned,
            isExcluded,
          };
        }

        return value;
      })
    );
  };

  const handleSave = async () => {
    /* istanbul ignore next */
    await handleUpdate({
      facetId: facet.id,
      data: {
        ...facet,
        boosted: orderedPinnedValues,
        excludedValues: editFacetValues
          .filter((value) => value.isExcluded)
          .map((value) => value.displayValue),
        merged: facetMergedValues,
      },
    });

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
            <HeadingAndCloseButton>
              <Text isStrong as={Header3}>
                Facet value settings of: {facet.displayValue}
              </Text>
              <Button onClick={onClose} aria-label="Close Modal">
                <Image
                  src="/trading-hub/asset/icon-close-black.svg"
                  width={24}
                  height={24}
                  alt=""
                />
              </Button>
            </HeadingAndCloseButton>

            <MergeAndSearchContainer>
              <Text isStrong>All values listed</Text>
              {canMerge && (
                <Button isDisabled={mergeList.length < 2} onClick={handleMerge}>
                  Merge ({mergeList.length})
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
                      <Col>{canMerge && <input type="checkbox" />}</Col>
                    )}
                  </Col>
                ))}
              </FacetAttributeValuesTableRow>

              {filteredEditFacetValues.map(
                (
                  {
                    displayValue,
                    attribute,
                    mergedValues,
                    isPinned,
                    isExcluded,
                  },
                  index
                ) => (
                  <FacetAttributeValuesTableRow
                    key={`attribute-${attribute}`}
                    isPinned={isPinned}
                    isExcluded={isExcluded}
                    data-testid="rows"
                    aria-label={`attribute ${index} ${attribute}`}
                  >
                    <Col>
                      {canMerge && (
                        <input
                          type="checkbox"
                          checked={mergeList.includes(attribute.toLowerCase())}
                          onChange={() => handleSelect(attribute, mergedValues)}
                          aria-label={`Select ${attribute} to merge`}
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
                                <RemoveMergedFacet
                                  onClick={() =>
                                    handleDemerge(
                                      value,
                                      mergedValues,
                                      displayValue
                                    )
                                  }
                                  aria-label={`Remove merged facet for ${value}`}
                                />
                              </MergedValue>
                            ))}
                          </div>
                        ) : (
                          <Text>{displayValue}</Text>
                        )}
                      </AttributeWrapper>
                    </Col>

                    <Col>
                      <EditableLabel
                        displayValue={displayValue}
                        onDisplayValueChange={(newValue) => {
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

                          if (mergedValues && mergedValues.length > 1) {
                            setFacetMergedValues((prev) =>
                              prev?.map((values) => {
                                if (
                                  values.mergedValues?.includes(
                                    attribute.toLocaleLowerCase()
                                  )
                                ) {
                                  return {
                                    ...values,
                                    displayValue: newValue,
                                  };
                                }

                                return values;
                              })
                            );
                          }
                        }}
                      />
                    </Col>

                    <Col>
                      {isPinned && (
                        <>
                          <DisplayName>
                            {/* TODO: need to update that if changed */}
                            default
                          </DisplayName>

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
                              }}
                              isDisabled={
                                index === orderedPinnedValues.length - 1
                              }
                            />
                          </OrderArrowsContainer>
                        </>
                      )}
                    </Col>

                    <Col>
                      <FacetOrderDropdown
                        status={
                          isPinned
                            ? 'included'
                            : isExcluded
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
                )
              )}
            </ModalAttributesTable>
          </ModalContainer>

          <FilteredResultsPanel filteredFacets={editFacetValues.length} />
        </Modal.Body>

        <ModalFooter>
          <Button onClick={onClose}>Cancel</Button>{' '}
          <Button onClick={handleSave}>Save</Button>
        </ModalFooter>
      </Modal.Content>
    </Modal.Root>
  );
};
