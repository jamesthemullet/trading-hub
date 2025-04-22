import styled from '@emotion/styled';
import { Divider, Modal } from '@mantine/core';

import { Button } from '../../buttons/button/button';
import { Header3, Text } from '../../typography/typography.styles';
import { spacing } from '../../utils/spacing';

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
}: {
  onCloseModal: () => void;
  handleModalConfirm: () => void;
}) => {
  return (
    <Modal.Body>
      <Header3>Apply global changes</Header3>

      <Text withMargin>
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
