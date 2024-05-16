import styled from '@emotion/styled';
import { spacing } from '../utils/spacing';
import { Modal } from '@mantine/core';
import { Header3, Text } from '../typography/typography.styles';
import { Button } from '../buttons/button/button';
import Image from 'next/image';
import { TableRow, TableCol, TableHeading } from '../table/table.styles';
import { ReturnedFacet } from '@/libs/api';
import { color } from '../utils/constants';
import { FacetValuesSortDropdown } from '../dropdowns/facet-values-sort-dropdown/facet-values-sort-dropdown';
import { Search } from '../search/search';
import { ModalAttributesTable, HeadingAndCloseButton } from './modal.styles';
import { FacetOrderDropdown } from '../dropdowns/facet-order-dropdown/facet-order-dropdown';
import { EditableLabel } from '../editable-label/editable-label';
import { useMemo, useState } from 'react';
import { useDebounce } from '@/libs/hooks';
import { FilteredResultsPanel } from '../filtered-results-panel/filtered-results-panel';

const Row = styled(TableRow)<{ heading?: boolean }>`
  border-bottom: none;
  align-items: center;
  margin-bottom: ${spacing(2)};
  box-shadow: #000 0 0 10px -5px;
  padding: ${spacing(2)};
`;

const Col = styled(TableCol)<{ heading?: boolean }>`
  justify-content: space-between;
  flex: 20;
  padding: 0;
`;

const MODAL_WIDTH = 1000;

const ModalContainer = styled.div`
  height: 680px;
  display: flex;
  flex-direction: column;
  margin: ${spacing(3)};
  height: 100%;
`;

const DefaultSearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(2)};
  padding: ${spacing(2)};
  background-color: ${color.infoBlueBackground};
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
    label: 'Actions',
  },
];

type Attributes = {
  index: number;
  attribute: string;
  displayValue: string;
  mergedValues?: string[];
};

const mockAttributes = [
  {
    index: 0,
    attribute: 'Cotton',
    displayValue: 'Cotton',
    mergedValues: [],
  },
  {
    index: 1,
    attribute: 'Duck Down',
    displayValue: 'Duck Down',
    mergedValues: [],
  },
  {
    index: 2,
    attribute: 'Duck Down And Feather',
    displayValue: 'Duck Down And Feather',
    mergedValues: [],
  },
  {
    index: 3,
    attribute: 'Ducky Downy',
    displayValue: 'Ducky Downy',
    mergedValues: [],
  },
  {
    index: 4,
    attribute: 'Ducky Downy And Feathery',
    displayValue: 'Ducky Downy And Feathery',
    mergedValues: [],
  },
] as Attributes[];

export const ModalEditValues = ({
  onClose,
  facet,
}: {
  onClose: () => void;
  facet: ReturnedFacet;
}) => {
  const [editFacetValues, setEditFacetValues] =
    useState<Attributes[]>(mockAttributes);
  const [mergeList, setMergeList] = useState<string[]>([]);

  const handleSelect = (attribute: string) => {
    if (!mergeList.includes(attribute)) {
      setMergeList([...mergeList, attribute]);
    } else {
      setMergeList(mergeList.filter((item) => item !== attribute));
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

  const [searchQuery, setSearchQuery] = useState('');

  const { callback: handleSearch } = useDebounce((val: string) => {
    setSearchQuery(val);
  }, 300);

  const filteredEditFacetValues = useMemo(() => {
    return !searchQuery
      ? editFacetValues
      : editFacetValues.filter(
          (value) =>
            value.attribute.toLowerCase().includes(searchQuery.toLowerCase()) ||
            value.displayValue.toLowerCase().includes(searchQuery.toLowerCase())
        );
  }, [editFacetValues, searchQuery]);

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

            <DefaultSearchContainer>
              <Text>Default sort algorithm of facet values</Text>
              <FacetValuesSortDropdown />
            </DefaultSearchContainer>

            <MergeAndSearchContainer>
              <Text isStrong>All values listed</Text>
              <Button
                isDisabled={mergeList.length < 2}
                onClick={() => mergeValues()}
              >
                Merge ({mergeList.length})
              </Button>
              <Search onChange={(e) => handleSearch(e.target.value)} />
            </MergeAndSearchContainer>

            <ModalAttributesTable>
              <Row heading={true}>
                {EDITFACETVALUESMODALCOLUMNS.map(({ label }) => (
                  <Col key={`add-facet-modal-column-${label}`} heading={true}>
                    {label ? (
                      <TableHeading as="p" isStrong={true}>
                        {label}
                      </TableHeading>
                    ) : (
                      <Col>
                        <input type="checkbox" />
                      </Col>
                    )}
                  </Col>
                ))}
              </Row>
              {filteredEditFacetValues.map(
                ({ attribute, displayValue, index, mergedValues }) => (
                  <Row
                    key={`attribute-${attribute}`}
                    data-testid="rows"
                    heading={false}
                  >
                    <Col>
                      <input
                        type="checkbox"
                        checked={mergeList.includes(attribute)}
                        onChange={() => handleSelect(attribute)}
                        aria-label={`Select ${attribute} to merge`}
                      />
                    </Col>
                    <Col heading={false}>
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
                          <Text>{attribute}</Text>
                        )}
                      </AttributeWrapper>
                    </Col>
                    <Col heading={false}>
                      <EditableLabel
                        displayValue={displayValue}
                        onDisplayValueChange={(newValue) => {
                          setEditFacetValues((prev) => {
                            const updatedFacet: Attributes = {
                              ...prev[index],
                              displayValue: newValue,
                            };
                            return [
                              ...prev.slice(0, index),
                              updatedFacet,
                              ...prev.slice(index + 1),
                            ];
                          });
                        }}
                      />
                    </Col>
                    <Col heading={false}>
                      <FacetOrderDropdown />
                    </Col>
                  </Row>
                )
              )}
            </ModalAttributesTable>
          </ModalContainer>
          <FilteredResultsPanel filteredFacets={editFacetValues.length} />
        </Modal.Body>
        <ModalFooter>
          <Button onClick={onClose}>Cancel</Button>{' '}
          <Button isDisabled={true}>Save</Button>
        </ModalFooter>
      </Modal.Content>
    </Modal.Root>
  );
};
