import styled from '@emotion/styled';
import { useState } from 'react';
import { Box } from '@mantine/core';

import { Category, ReturnedFacet } from '@/libs/api';
import {
  Button,
  CategorySearch,
  Search,
  spacing,
  Text,
} from '@/libs/components';
import { ArrowButton } from '@/libs/components/buttons/button/arrow-button';
import { FacetOrderDropdown } from '@/libs/components/dropdowns/facet-order-dropdown/facet-order-dropdown';
import { EditableLabel } from '@/libs/components/editable-label/editable-label';
import { ModalAddFacets } from '@/libs/components/modals/modal-add-facets';
import { ModalEditValues } from '@/libs/components/modals/modal-edit-values';
import {
  TableCol,
  TableHeading,
  TableRow,
} from '@/libs/components/table/table.styles';
import { color } from '@/libs/components/utils/constants';
import { useDebounce } from '@/libs/hooks';

export const ActionContainer = styled.div`
  display: flex;

  h1 {
    font-size: 1.5em;
    padding: ${spacing(3)} ${spacing(2)};
  }

  a,
  button {
    min-width: 150px;
    text-align: center;
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: ${spacing(2)};
  margin-left: auto;
  padding: 18px;
`;

export const AddFacetPanel = styled.div`
  display: flex;
  justify-content: space-between;

  div {
    &:first-of-type {
      flex: 6;
    }

    &:last-of-type {
      flex: 1;
    }
  }
`;

export const LowerHeading = styled(Text)`
  font-size: 1em;
  margin-bottom: 1em;
`;

export const AttributesTable = styled.div`
  display: flex;
  flex-direction: column;
  margin: ${spacing(2)};
`;

export const SectionWrapper = styled.div`
  box-shadow: #000 0 0 10px -5px;
  margin: ${spacing(2)};
  margin-bottom: 0;
  border-radius: 4px;
  padding: ${spacing(2)};
`;

const OrderColumn = styled.div`
  display: flex;
  gap: ${spacing(1)};
  padding-right: ${spacing(1)};
`;

type TableRowProps = {
  optionSelected?: string;
};

export const Row = styled(TableRow)<TableRowProps>`
  font-size: 1rem;
  align-items: center;
  border-bottom: none;
  box-shadow: #000 0 0 10px -5px;
  margin-bottom: ${spacing(2)};
  padding: ${spacing(2)};

  ${({ optionSelected }) =>
    optionSelected === 'included' &&
    `background-color: ${color.successGreenBackground}`}

  ${({ optionSelected }) =>
    optionSelected === 'excluded' &&
    `background-color: ${color.errorRedBackground}`}
`;

export const Col = styled(TableCol)`
  justify-content: space-between;
`;

const NoAttributesBlock = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  margin-top: 100px;

  p {
    font-size: 1.25rem;
    color: #707070;
  }
`;

export const COLUMNS: {
  label: string;
}[] = [
  {
    label: 'Attribute',
  },
  {
    label: 'Display name',
  },
  {
    label: 'Order',
  },
  {
    label: 'Value options',
  },
];

type defaultOrderDataType = {
  defaultOrder: string;
}[];

export const FacetsPanel = ({
  onSave,
  onCancel,
  setSearch,
  onFacetDataChange,
  onFacetsDataRowOrderChange,
  onHandleStatusChange,
  title,
  facetsData,
  defaultCategory,
  canMergeValueAttributes,
  displayRowOrderControls = false,
  canPreviewChanges,
  canAddFacet,
}: {
  onSave: () => void;
  onCancel: () => void;
  setSearch?: (value: string) => void;
  onFacetDataChange?: (
    index: number,
    value: string | 'included' | 'excluded',
    facet: ReturnedFacet
  ) => void;
  onFacetsDataRowOrderChange?: (index: number, direction: -1 | 1) => void;
  onHandleStatusChange?: (
    index: number,
    status: 'included' | 'excluded'
  ) => void;
  displayRowOrderControls?: boolean;
  title: string;
  facetsData: ReturnedFacet[];
  defaultCategory?: Category;
  canMergeValueAttributes?: boolean;
  defaultOrderData?: defaultOrderDataType;
  canPreviewChanges?: boolean;
  canAddFacet?: boolean;
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    defaultCategory || {}
  );
  const [selectedFacet, setSelectedFacet] = useState<ReturnedFacet | undefined>(
    undefined
  );
  const [isAddFacetModalOpen, setIsAddFacetModalOpen] = useState(false);
  const [isEditValuesModalOpen, setIsEditValuesModalOpen] = useState(false);

  const { callback: handleSearch } = useDebounce((val: string) => {
    setSearch?.(val);
  }, 300);

  const onPreview = () => {
    // TODO: Implement preview functionality
    console.log('preview');
  };

  // istanbul ignore next
  const onSelectCategory = (category: Category) => {
    setSelectedCategory(category);
  };

  const onClose = () => {
    setIsAddFacetModalOpen(false);
    setIsEditValuesModalOpen(false);
  };

  const handleOpenFacetEditModal = (facet: ReturnedFacet) => {
    setIsEditValuesModalOpen(true);
    setSelectedFacet(facet);
  };

  const FacetRow = ({
    facet,
    index,
    totalCount,
  }: {
    facet: ReturnedFacet;
    index: number;
    totalCount: number;
  }) => {
    return (
      <Row optionSelected={facet.status} data-testid="facets-table-row">
        <Col>
          <Text>{facet.indexPropertyName}</Text>
        </Col>
        <Col>
          {onFacetDataChange && (
            <EditableLabel
              displayValue={facet.displayValue}
              onDisplayValueChange={(newValue) =>
                onFacetDataChange(index, newValue, facet)
              }
            />
          )}
        </Col>
        <Col>
          <OrderColumn>
            <FacetOrderDropdown
              status={facet.status}
              onChange={(status): void => {
                if (onHandleStatusChange) {
                  onHandleStatusChange(index, status);
                }
              }}
            />
            {index === 0 || !displayRowOrderControls ? (
              <Box w="40" h="40" />
            ) : (
              <ArrowButton
                direction="up"
                aria-label={`Move ${facet.displayValue} row up`}
                onClick={() => {
                  if (onFacetsDataRowOrderChange) {
                    onFacetsDataRowOrderChange(index, -1);
                  }
                }}
              ></ArrowButton>
            )}
            {index === totalCount - 1 || !displayRowOrderControls ? (
              <Box w="40" h="40" />
            ) : (
              <ArrowButton
                direction="down"
                aria-label={`Move ${facet.displayValue} row down`}
                onClick={() => {
                  if (onFacetsDataRowOrderChange) {
                    onFacetsDataRowOrderChange(index, 1);
                  }
                }}
              ></ArrowButton>
            )}
          </OrderColumn>
        </Col>
        <Col>
          <Button onClick={() => handleOpenFacetEditModal(facet)}>
            Edit values
          </Button>
        </Col>
      </Row>
    );
  };

  return (
    <>
      <ActionContainer>
        <h1>{title}</h1>

        <Actions>
          <Button onClick={onCancel}>Cancel</Button>
          {canPreviewChanges && <Button onClick={onPreview}>Preview</Button>}
          <Button theme="primary" onClick={onSave}>
            Save
          </Button>
        </Actions>
      </ActionContainer>
      <SectionWrapper>
        <LowerHeading isStrong>Rule scope</LowerHeading>
        <CategorySearch
          selectedCategory={selectedCategory}
          onClearSelection={() => {
            setSelectedCategory({});
          }}
          onSelectCategory={onSelectCategory}
        />
      </SectionWrapper>
      <SectionWrapper>
        <AddFacetPanel>
          <div>
            <LowerHeading isStrong>Preview and manage facets</LowerHeading>
            <Text>(sort by algo control)</Text>
          </div>
          {canAddFacet && (
            <div>
              <Button
                onClick={() => setIsAddFacetModalOpen(!isAddFacetModalOpen)}
              >
                Add facet
              </Button>
            </div>
          )}
        </AddFacetPanel>
      </SectionWrapper>

      {isAddFacetModalOpen && <ModalAddFacets onClose={onClose} />}

      {selectedCategory && setSearch && (
        <SectionWrapper>
          <Search onChange={(e) => handleSearch(e.target.value)} />
        </SectionWrapper>
      )}

      <AttributesTable>
        <Row>
          {COLUMNS.map(({ label }) => (
            <Col key={`column-${label}`}>
              <TableHeading as="p" isStrong={true}>
                {label}
              </TableHeading>
            </Col>
          ))}
        </Row>

        {facetsData &&
          facetsData.map((facet, index) => (
            <FacetRow
              key={facet.id}
              facet={facet}
              index={index}
              totalCount={facetsData.length}
            ></FacetRow>
          ))}
      </AttributesTable>

      {isEditValuesModalOpen && selectedFacet && (
        <ModalEditValues
          onClose={onClose}
          facet={selectedFacet}
          canMerge={canMergeValueAttributes}
        />
      )}

      {facetsData.length === 0 && (
        <NoAttributesBlock>
          <Text>No, there are no attributes yet.</Text>
          <Text>How about adding a subcategory first?</Text>
        </NoAttributesBlock>
      )}
    </>
  );
};
