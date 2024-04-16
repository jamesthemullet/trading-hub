import styled from '@emotion/styled';
import { spacing } from '../utils/spacing';
import { Modal } from '@mantine/core';
import { Header3, Text } from '../typography/typography.styles';
import { Button } from '../buttons/button/button';
import { useState } from 'react';
import Image from 'next/image';
import { Search } from '../search/search';
import { FacetOrderDropdown } from '../dropdowns/facet-order-dropdown/facet-order-dropdown';

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

const MODAL_WIDTH = 870;

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

export const ModalAddFacets = ({ onClose }: { onClose: () => void }) => {
  const [addFacetModalAttributes, setAddFacetModalAttributes] =
    useState<Attributes[]>(mockAttributes);
  const filterAttributes = (search: string) => {
    setAddFacetModalAttributes(
      mockAttributes.filter((attr) =>
        attr.attribute.toLowerCase().includes(search.toLowerCase())
      )
    );
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
                Add facet
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
            <ModalSectionContainer>
              <Search
                onChange={(e) => {
                  filterAttributes(e.target.value);
                }}
                data-testid="attributes-search-input"
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
                {addFacetModalAttributes.map(({ attribute }) => (
                  <Row key={`attribute-${attribute}`} data-testid="rows">
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
  );
};
