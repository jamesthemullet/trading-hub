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

const Row = styled(TableRow)<{ heading?: boolean }>`
  border-bottom: none;
  align-items: center;
`;

const Col = styled(TableCol)<{ heading?: boolean }>`
  justify-content: space-between;
  flex: 1;
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
    flex: 4;
  }

  button {
    flex: 1;
  }

  div {
    flex: 2;
  }
`;

const EDITFACETVALUESMODALCOLUMNS: {
  label: string;
}[] = [
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

export const ModalEditValues = ({
  onClose,
  facet,
}: {
  onClose: () => void;
  facet: ReturnedFacet;
}) => {
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
                    <TableHeading as="p" isStrong={true}>
                      {label}
                    </TableHeading>
                  </Col>
                ))}
              </Row>
            </ModalAttributesTable>
          </ModalContainer>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};
