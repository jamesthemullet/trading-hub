import styled from '@emotion/styled';
import { spacing } from '../utils/spacing';
import { Modal } from '@mantine/core';
import { Header3, Text } from '../typography/typography.styles';
import { Button } from '../buttons/button/button';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Search } from '../search/search';
import { FacetOrderDropdown } from '../dropdowns/facet-order-dropdown/facet-order-dropdown';
import { TableRow, TableCol, TableHeading } from '../table/table.styles';
import { ModalAttributesTable, HeadingAndCloseButton } from './modal.styles';
import { useGetFacetAttributes } from '@/libs/hooks/use-get-facet-attributes';
import { AttributeResponseItem } from '@/libs/api';

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
  max-height: 492px;
  display: flex;
  flex-direction: column;
  margin: ${spacing(3)};
  overflow-y: auto;
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

export const ModalAddFacets = ({ onClose }: { onClose: () => void }) => {
  const { attributes } = useGetFacetAttributes();

  const [addFacetModalAttributes, setAddFacetModalAttributes] =
    useState<AttributeResponseItem[]>(attributes);

  useEffect(() => {
    setAddFacetModalAttributes(attributes);
  }, [attributes]);

  const filterAttributes = (search: string) => {
    setAddFacetModalAttributes(
      attributes.filter((attr) =>
        attr.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  // istanbul ignore next
  const onChange = () => {
    // TODO: Implement
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
              {addFacetModalAttributes.map(({ name }) => (
                <Row
                  key={`attribute-${name}`}
                  data-testid="rows"
                  heading={false}
                >
                  <Col heading={false}>
                    <Text>{name}</Text>
                  </Col>
                  <Col heading={false}>
                    <FacetOrderDropdown onChange={onChange} />
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
