import { useState } from 'react';
import styled from '@emotion/styled';

import { Category, ReturnedFacet } from '@/libs/api';
import { ModalAddFacets } from '@/libs/components/modals/modal-add-facets';
import {
  Button,
  CategorySearch,
  Search,
  SelectedCategory,
  spacing,
  Text,
} from '@/libs/components';
import {
  TableRow,
  TableCol,
  TableHeading,
} from '@/libs/components/table/table.styles';
import { FacetOrderDropdown } from '@/libs/components/dropdowns/facet-order-dropdown/facet-order-dropdown';
import { EditableLabel } from '@/libs/components/editable-label/editable-label';
import { DefaultCategorySearchBox } from '@/libs/components/default-category-search-box/default-category-search-box';
import { useFacetsFilter } from '@/libs/hooks/use-facets-filter';
import { color } from '@/libs/components/utils/constants';

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

type TableRowProps = {
  optionSelected?: string;
};

export const Row = styled(TableRow)<TableRowProps>`
  font-size: 1rem;
  align-items: center;
  border-bottom: none;
  box-shadow: #000 0 0 10px -5px;
  margin-bottom: ${spacing(2)};
  padding: 0 ${spacing(2)} ${spacing(2)};

  ${({ optionSelected }) =>
    optionSelected === 'Include only' &&
    `background-color: ${color.successGreenBackground}`}

  ${({ optionSelected }) =>
    optionSelected === 'Exclude only' &&
    `background-color: ${color.errorRedBackground}`}
`;

export const Col = styled(TableCol)`
  justify-content: space-between;
  flex: 2;

  &:last-of-type {
    flex: 1;
  }
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
  title,
  facetsData,
  categoryName,
  defaultCategory,
  defaultOrderData,
}: {
  onSave: () => void;
  onCancel: () => void;
  title: string;
  facetsData: ReturnedFacet[];
  categoryName?: string;
  defaultCategory?: Category;
  defaultOrderData?: defaultOrderDataType;
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>({});
  const [isAddFacetModalOpen, setIsAddFacetModalOpen] = useState(false);
  const [localFacetData, setLocalFacetData] =
    useState<ReturnedFacet[]>(facetsData);

  // This will be replaced when we have the defaultOrder field on the get facets endpoint
  const [localDefaultOrderData, setLocalDefaultOrderData] =
    useState<defaultOrderDataType>(defaultOrderData || []);

  const { setSearch, filteredFacets } = useFacetsFilter(localFacetData);

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
  };

  const handleChange = (label: string, index: number) => {
    setLocalDefaultOrderData((prev) => {
      const updatedDefaultOrderData = prev.map((order, i) => {
        if (i === index) {
          return { defaultOrder: label };
        }
        return order;
      });
      return updatedDefaultOrderData;
    });
  };

  const FacetRow = ({
    facet,
    index,
  }: {
    facet: ReturnedFacet;
    index: number;
  }) => {
    return (
      <Row
        optionSelected={
          localDefaultOrderData[index]
            ? localDefaultOrderData[index].defaultOrder
            : ''
        }
        data-testid="facets-table-row"
      >
        <Col>
          <Text>{facet.indexPropertyName}</Text>
        </Col>
        <Col>
          <EditableLabel
            displayValue={facet.displayValue}
            onDisplayValueChange={(newValue) => {
              setLocalFacetData((prev) => {
                const updatedFacet: ReturnedFacet = {
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
        <Col>
          <FacetOrderDropdown
            defaultOrderData={
              localDefaultOrderData[index]
                ? localDefaultOrderData[index].defaultOrder
                : undefined
            }
            onChange={(label: string): void => handleChange(label, index)}
          />
        </Col>
        <Col>
          <Button>Edit values</Button>
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
          <Button onClick={onPreview}>Preview</Button>
          <Button theme="primary" onClick={onSave}>
            Save
          </Button>
        </Actions>
      </ActionContainer>
      <SectionWrapper>
        <LowerHeading isStrong>Rule scope</LowerHeading>
        {defaultCategory && (
          <DefaultCategorySearchBox defaultCategory={defaultCategory} />
        )}
        {!defaultCategory &&
          (categoryName ? (
            <SelectedCategory>{categoryName}</SelectedCategory>
          ) : (
            <CategorySearch
              selectedCategory={selectedCategory}
              onClearSelection={() => {
                setSelectedCategory({});
              }}
              onSelectCategory={onSelectCategory}
            />
          ))}
      </SectionWrapper>
      <SectionWrapper>
        <AddFacetPanel>
          <div>
            <LowerHeading isStrong>Preview and manage facets</LowerHeading>
            <Text>(sort by algo control)</Text>
          </div>
          <div>
            <Button
              onClick={() => setIsAddFacetModalOpen(!isAddFacetModalOpen)}
            >
              Add facet
            </Button>
          </div>
        </AddFacetPanel>
      </SectionWrapper>

      {isAddFacetModalOpen && <ModalAddFacets onClose={onClose} />}

      {defaultCategory && (
        <SectionWrapper>
          <Search
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />
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

        {filteredFacets &&
          filteredFacets.map((facet, index) => (
            <FacetRow key={facet.id} facet={facet} index={index}></FacetRow>
          ))}
      </AttributesTable>

      {localFacetData.length === 0 && (
        <NoAttributesBlock>
          <Text>No, there are no attributes yet.</Text>
          <Text>How about adding a subcategory first?</Text>
        </NoAttributesBlock>
      )}
    </>
  );
};
