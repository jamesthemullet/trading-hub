import styled from '@emotion/styled';
import { spacing } from '../utils/spacing';
import { Modal } from '@mantine/core';
import { Header3, Text } from '../typography/typography.styles';
import { Button } from '../buttons/button/button';
import { useState } from 'react';
import Image from 'next/image';
import { Search } from '../search/search';
import { FacetOrderDropdown } from '../dropdowns/facet-order-dropdown/facet-order-dropdown';
import { TableRow, TableCol, TableHeading } from '../table/table.styles';
import { ModalAttributesTable, HeadingAndCloseButton } from './modal.styles';

const Row = styled(TableRow)<{ heading?: boolean }>`
  border-bottom: none;
  align-items: center;

  ${({ heading }) =>
    !heading && 'box-shadow: #000 0 0 10px -5px; margin: 8px 0;'};
`;

const Col = styled(TableCol)<{ heading?: boolean }>`
  justify-content: space-between;
  flex: 1;

  ${({ heading }) => !heading && 'padding: 16px;'};
`;

const MODAL_WIDTH = 870;

const ModalContainer = styled.div`
  height: 492px;
  display: flex;
  flex-direction: column;
  margin: ${spacing(3)};
`;

const StyledSearch = styled(Search)`
  input {
    min-height: 56px;
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
  actionSelected: 'Include only' | 'Exclude only' | null;
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

            <StyledSearch
              onChange={(e) => {
                filterAttributes(e.target.value);
              }}
              data-testid="attributes-search-input"
            />

            <ModalAttributesTable>
              <Row heading={true}>
                {ADDFACETMODALCOLUMNS.map(({ label }) => (
                  <Col key={`add-facet-modal-column-${label}`} heading={true}>
                    <TableHeading as="p" isStrong={true}>
                      {label}
                    </TableHeading>
                  </Col>
                ))}
              </Row>
              {addFacetModalAttributes.map(({ attribute }) => (
                <Row
                  key={`attribute-${attribute}`}
                  data-testid="rows"
                  heading={false}
                >
                  <Col heading={false}>
                    <Text>{attribute}</Text>
                  </Col>
                  <Col heading={false}>
                    <FacetOrderDropdown />
                  </Col>
                </Row>
              ))}
              {!addFacetModalAttributes.length && (
                <NoAttributesBlock>
                  <Text>No records found</Text>
                </NoAttributesBlock>
              )}
            </ModalAttributesTable>
          </ModalContainer>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};
