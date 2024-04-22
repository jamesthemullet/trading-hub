import { useState } from 'react';
import styled from '@emotion/styled';

import { Category } from '@/libs/api';
import { ModalAddFacets } from '@/libs/components/modals/modal-add-facets';
import { Button, CategorySearch, spacing, Text } from '@/libs/components';
import {
  TableRow,
  TableCol,
  TableHeading,
} from '@/libs/components/table/table.styles';

const ActionContainer = styled.div`
  display: flex;

  h1 {
    font-size: 1.5em;
    padding: ${spacing(3)} ${spacing(2)};
  }

  a,
  button {
    min-width: 110px;
    text-align: center;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: ${spacing(2)};
  margin-left: auto;
  padding: 18px;
`;

const AddFacetPanel = styled.div`
  display: flex;
  justify-content: space-between;

  button {
    width: 150px;
  }
`;

const LowerHeading = styled(Text)`
  font-size: 1em;
  margin-bottom: 1em;
`;

const AttributesTable = styled.div`
  display: flex;
  flex-direction: column;
`;

const SectionWrapper = styled.div`
  box-shadow: #000 0 0 10px -5px;
  margin: ${spacing(2)};
  margin-bottom: 0;
  padding-top: ${spacing(1)};
  border-radius: 4px;
  padding: ${spacing(2)};
`;

const Row = styled(TableRow)`
  font-size: 1rem;
  align-items: center;
  border-bottom: none;
`;

const Col = styled(TableCol)`
  justify-content: space-between;
  flex: 1;
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

const COLUMNS: {
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

export const Facets = ({
  onSave,
  onCancel,
}: {
  onSave: () => void;
  onCancel: () => void;
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>({});
  const [isAddFacetModalOpen, setIsAddFacetModalOpen] = useState(false);

  const attributes = [];

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

  return (
    <>
      <ActionContainer>
        <h1>Facet Rule Editor</h1>

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

      <SectionWrapper>
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
        </AttributesTable>
      </SectionWrapper>
      {attributes.length === 0 && (
        <NoAttributesBlock>
          <Text>No, there are no attributes yet.</Text>
          <Text>How about adding a subcategory first?</Text>
        </NoAttributesBlock>
      )}
    </>
  );
};
