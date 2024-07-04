import styled from '@emotion/styled';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@mantine/core';

import { AttributeValuesResponse, ReturnedFacet } from '@/libs/api';
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
  facet: ReturnedFacet;
  canMerge?: boolean;
}) => {
  const [editFacetValues, setEditFacetValues] = useState<AttributeValue[]>([]);
  const [mergeList, setMergeList] = useState<string[]>([]);
  const [orderedPinnedValues, setOrderedPinnedValues] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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
      attribute: value.displayValue,
      index,
    }));

    setEditFacetValues(facetValues);
    setOrderedPinnedValues(
      facetValues
        .filter((value) => value.isPinned)
        .map((value) => value.attribute)
    );
  }, [attributeValues]);

  const handleSelect = (
    displayValue: string,
    mergedValues: string[] | undefined
  ) => {
    if (mergedValues && mergedValues.length > 1) {
      const valuesNotInMergeList = mergedValues.filter(
        (value) => !mergeList.includes(value)
      );

      setMergeList([...mergeList, ...valuesNotInMergeList]);
      return;
    }
    if (!mergeList.includes(displayValue)) {
      setMergeList([...mergeList, displayValue]);
    } else {
      setMergeList(mergeList.filter((item) => item !== displayValue));
    }
  };

  const mergeValues = () => {
    // TO-DO update attributes endpoint

    setEditFacetValues((prev) => {
      const updatedFacets = prev.map((facet) => {
        if (mergeList.includes(facet.attribute)) {
          return {
            ...facet,
            displayValue: `Name your merged value group`,
            mergedValues: mergeList,
          };
        }
        return facet;
      });
      return updatedFacets;
    });
    setMergeList([]);
  };

  const handleDemerge = (value: string, mergedValues: string[]) => {
    // TO-DO update attributes endpoint - which should allow much of the below to be removed
    if (mergedValues.length === 2) {
      setEditFacetValues((prev) => {
        const updatedFacets = prev.map((facet) => {
          if (mergedValues.includes(facet.attribute)) {
            return {
              ...facet,
              displayValue: facet.attribute,
              mergedValues: [],
            };
          }
          return facet;
        });
        return updatedFacets;
      });
    } else {
      setEditFacetValues((prev) => {
        const updatedFacets = prev.map((facet) => {
          if (value === facet.attribute) {
            return {
              ...facet,
              displayValue: facet.attribute,
              mergedValues: [],
            };
          }
          if (mergedValues.includes(facet.attribute)) {
            return {
              ...facet,
              displayValue: facet.attribute,
              mergedValues: mergedValues.filter((item) => item !== value),
            };
          }
          return facet;
        });
        return updatedFacets;
      });
    }
  };

  const handleSave = async () => {
    /* istanbul ignore next */
    await handleUpdate({
      facetId: facet.id,
      data: {
        ...facet,
        boosted: orderedPinnedValues,
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
                <Button
                  isDisabled={mergeList.length < 2}
                  onClick={() => mergeValues()}
                >
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
                          checked={mergeList.includes(attribute)}
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
                                    handleDemerge(value, mergedValues)
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
