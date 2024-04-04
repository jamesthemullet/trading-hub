import styled from '@emotion/styled';
import { spacing } from '../utils/spacing';
import { Button } from '../buttons/button/button';
import { useState } from 'react';
import { ModalUnsavedChanges } from '../modal';

const RuleSetOptions = styled.div`
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

type Props = {
  hasChanges: boolean;
  hasPreview: boolean;
  categoryId?: string;
  onCancel: () => void;
  onPreview: () => void;
  onSave: (id: string) => void;
};

export const ProductGridHeader = ({
  hasChanges,
  hasPreview,
  categoryId,
  onCancel,
  onPreview,
  onSave,
}: Props) => {
  const [showModal, setShowModal] = useState(false);

  const onCancelChange = () => {
    if (hasChanges) {
      setShowModal(true);
    } else {
      onCancel();
    }
  };
  const handleSave = () => {
    if (!categoryId) return;

    onSave(categoryId);
  };

  return (
    <>
      <RuleSetOptions>
        <h1>Product Grid</h1>

        <Actions>
          <Button onClick={onCancelChange}>Cancel</Button>
          <Button onClick={onPreview} isDisabled={!hasPreview}>
            Preview
          </Button>
          <Button theme="primary" isDisabled={!hasPreview} onClick={handleSave}>
            Save
          </Button>
        </Actions>
      </RuleSetOptions>

      {showModal && (
        <ModalUnsavedChanges
          onClose={onCancel}
          onContinue={() => setShowModal(false)}
        />
      )}
    </>
  );
};
