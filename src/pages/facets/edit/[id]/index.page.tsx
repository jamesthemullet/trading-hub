import {
  Button,
  CategorySearch,
  Header3,
  Heading,
  Search,
  spacing,
  Text,
} from '@/libs/components';

import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import { Category } from '../../../../libs/api';
import { useState } from 'react';
import { Modal } from '@mantine/core';
import Image from 'next/image';
import { FacetOrderDropdown } from '../../../../libs/components/dropdowns/facet-order-dropdown/facet-order-dropdown';

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

const Row = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 1rem;
  align-items: center;

  &:first-of-type {
    position: sticky;
    z-index: 1;
    top: 70px;
    background: #fff;
  }
`;

const Col = styled.div`
  text-overflow: ellipsis;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex: 1;
  padding: ${spacing(3)} ${spacing(1)} ${spacing(0.5)};
`;

const ColumnHeading = styled(Text)`
  color: #1d1d1b;
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

const MODAL_WIDTH = 435;

const ModalContainer = styled.div`
  height: 492px;
  display: flex;
  flex-direction: column;
`;

const HeadingAndCloseButton = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${spacing(2)};
  align-items: center;

  h3 {
    font-size: 1.25em;
  }

  button {
    background: none;
    width: 24px;
    height: 24px;
    justify-content: center;
    align-items: center;
    display: flex;
  }
`;

const ModalSectionContainer = styled.div`
  padding: ${spacing(2)};
`;

const ModalAttributesTable = styled.div`
  display: flex;
  flex-direction: column;

  > div > div:first-of-type {
    flex: 2;
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

const ADDFACETMODALCOLUMNS: {
  label: string;
}[] = [
  {
    label: 'Attribute',
  },
  {
    label: 'Actions',
  },
];

type Attributes = {
  attribute: string;
  displayName: string;
  order: number;
  actionSelected: 'Always Show' | 'Always Hide' | null;
};

const mockAttributes = [
  {
    attribute: 'Cotton',
    displayName: 'Cotton',
    order: 1,
    actionSelected: null,
  },
  {
    attribute: 'Duck Down',
    displayName: 'Duck Down',
    order: 2,
    actionSelected: null,
  },
  {
    attribute: 'Duck Down And Feather',
    displayName: 'Duck Down And Feather',
    order: 3,
    actionSelected: null,
  },
] as Attributes[];

const Page = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>({});
  const [isAddFacetModalOpen, setIsAddFacetModalOpen] = useState(false);
  const attributes = [];
  const router = useRouter();

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('save');
  };

  const onPreview = () => {
    // TODO: Implement preview functionality
    console.log('preview');
  };

  // istanbul ignore next
  const onSelectCategory = (category: Category) => {
    setSelectedCategory(category);
  };

  return (
    <>
      <Heading breadcrumbs={['Categories', 'Facet Management', 'Editor']} />

      <ActionContainer>
        <h1>Facet Management</h1>

        <Actions>
          <Button onClick={() => router.push('/facet-management')}>
            Cancel
          </Button>
          <Button onClick={onPreview}>Preview</Button>
          <Button theme="primary" onClick={handleSave}>
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

      <Modal.Root
        opened={isAddFacetModalOpen}
        onClose={
          // istanbul ignore next
          () => setIsAddFacetModalOpen(false)
        }
        centered
        size={`${2 * MODAL_WIDTH}px`}
        padding={0}
      >
        <Modal.Overlay blur={3} />
        <Modal.Content>
          <Modal.Body>
            <ModalContainer>
              <HeadingAndCloseButton>
                <Text isStrong as={Header3}>
                  Add facet
                </Text>
                <Button
                  onClick={() => setIsAddFacetModalOpen(false)}
                  aria-label="Close Modal"
                >
                  <Image
                    src="/trading-hub/asset/icon-close-black.svg"
                    width={24}
                    height={24}
                    alt=""
                  />
                </Button>
              </HeadingAndCloseButton>
              <ModalSectionContainer>
                <Search
                  onChange={
                    // istanbul ignore next
                    (e) => {
                      console.log(e.target.value);
                    }
                  }
                />
              </ModalSectionContainer>
              <ModalSectionContainer>
                <ModalAttributesTable>
                  <Row>
                    {ADDFACETMODALCOLUMNS.map(({ label }) => (
                      <Col key={`add-facet-modal-column-${label}`}>
                        <ColumnHeading as="p" isStrong={true}>
                          {label}
                        </ColumnHeading>
                      </Col>
                    ))}
                  </Row>
                  {mockAttributes.map(({ attribute }) => (
                    <Row key={`attribute-${attribute}`}>
                      <Col>
                        <Text>{attribute}</Text>
                      </Col>
                      <Col>
                        <FacetOrderDropdown />
                      </Col>
                    </Row>
                  ))}
                </ModalAttributesTable>
              </ModalSectionContainer>
            </ModalContainer>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>

      <SectionWrapper>
        <AttributesTable>
          <Row>
            {COLUMNS.map(({ label }) => (
              <Col key={`column-${label}`}>
                <ColumnHeading as="p" isStrong={true}>
                  {label}
                </ColumnHeading>
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

export default Page;
