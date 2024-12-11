import styled from '@emotion/styled';
import { Modal } from '@mantine/core';

import { Button } from '../buttons/button/button';
import { Text, Title } from '../typography/typography.styles';
import { spacing } from '../utils/spacing';

const Divider = styled.span`
  border-bottom: solid 1px #000;
  width: 100%;
  display: inline-block;
`;

const Buttons = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: right;

  button {
    width: auto;
    margin-left: ${spacing(2)};
  }
`;

const Heading = styled(Title)`
  margin-bottom: ${spacing(2)};
`;

type Props = {
  onClose: () => void;
  onContinue: () => void;
};

export const ModalUnsavedChanges = ({ onClose, onContinue }: Props) => {
  return (
    <Modal.Root
      opened={true}
      onClose={onContinue}
      centered
      padding={10}
      role="dialog"
      aria-modal="true"
      aria-label="Unsaved changes modal"
    >
      <Modal.Overlay blur={3} />
      <Modal.Content>
        <Modal.Body>
          <Heading>Close without saving edits</Heading>
          <Text>
            Are you sure you want to navigate away from this page without saving
            your edits?
          </Text>
          <Divider />
          <Buttons>
            <Button onClick={onClose}>Close without saving</Button>
            <Button onClick={onContinue} theme="primary">
              Continue editing
            </Button>
          </Buttons>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};
