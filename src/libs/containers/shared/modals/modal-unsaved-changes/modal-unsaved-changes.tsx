import styled from '@emotion/styled';
import { useId } from 'react';
import { Modal } from '@mantine/core';

import { Button, Text, Title } from '@/libs/components';
import { spacing } from '@/libs/utils/spacing';

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
  opened?: boolean;
};

export const ModalUnsavedChanges = ({
  onClose,
  onContinue,
  opened = true,
}: Props) => {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Modal.Root opened={opened} onClose={onContinue} centered padding={10}>
      <Modal.Overlay blur={3} />
      <Modal.Content aria-labelledby={titleId} aria-describedby={descriptionId}>
        <Modal.Body>
          <Heading id={titleId}>Close without saving edits</Heading>
          <Text id={descriptionId}>
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
