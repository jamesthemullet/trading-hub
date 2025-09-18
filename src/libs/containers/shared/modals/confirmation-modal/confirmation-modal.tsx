import styled from '@emotion/styled';
import { Divider, Modal } from '@mantine/core';

import { Button } from '@/libs/components/buttons/button/button';
import { Header3, Text } from '@/libs/components/typography/typography.styles';
import { spacing } from '@/libs/components/utils/spacing';

const Buttons = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: right;
  margin-top: ${spacing(1)};

  button {
    width: auto;
    margin-left: ${spacing(2)};
  }
`;

const ConfirmationModal = ({
  onCloseModal,
  handleModalConfirm,
  titleId,
  descriptionId,
}: {
  onCloseModal: () => void;
  handleModalConfirm: () => void;
  titleId: string;
  descriptionId: string;
}) => {
  return (
    <Modal.Body>
      <Header3 id={titleId}>Apply global changes</Header3>

      <Text withMargin id={descriptionId}>
        This action will apply live changes on the M&S website and app. Do you
        want to proceed?
      </Text>

      <Divider />

      <Buttons>
        <Button
          onClick={onCloseModal}
          theme="secondary"
          aria-label="Close confirmation modal"
        >
          Cancel
        </Button>

        <Button
          onClick={() => {
            handleModalConfirm();
          }}
          theme="primary"
          data-autofocus
        >
          Apply action
        </Button>
      </Buttons>
    </Modal.Body>
  );
};
export default ConfirmationModal;
