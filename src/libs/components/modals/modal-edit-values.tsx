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
import { useState } from 'react';

const Row = styled(TableRow)<{ heading?: boolean }>`
  border-bottom: none;
  align-items: center;
  margin-bottom: ${spacing(3)};
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
  actionSelected: 'Include only' | 'Exclude only' | null;
};

const mockAttributes = [
  {
    index: 0,
    attribute: 'Cotton',
    displayValue: 'Cotton',
    actionSelected: null,
  },
  {
    index: 1,
    attribute: 'Duck Down',
    displayValue: 'Duck Down',
    actionSelected: null,
  },
  {
    index: 2,
    attribute: 'Duck Down And Feather',
    displayValue: 'Duck Down And Feather',
    actionSelected: null,
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
              <Button>Merge (0)</Button>
              <Search />
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
              {editFacetValues.map(({ attribute, displayValue, index }) => (
                <Row
                  key={`attribute-${attribute}`}
                  data-testid="rows"
                  heading={false}
                >
                  <Col>
                    <input type="checkbox" />
                  </Col>
                  <Col heading={false}>
                    <AttributeWrapper>
                      <Image
                        width={20}
                        height={20}
                        src="/trading-hub/asset/icon-attribute.svg"
                        alt=""
                      />
                      <Text>{attribute}</Text>
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
              ))}
            </ModalAttributesTable>
          </ModalContainer>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};
