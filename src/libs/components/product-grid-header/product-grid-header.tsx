import styled from '@emotion/styled';
import { useState } from 'react';

import { track } from '@/libs/hooks/utils/analytics';

import { Button } from '../buttons/button/button';
import { ModalUnsavedChanges } from '../modals';
import { spacing } from '../utils/spacing';

const RuleSetOptions = styled.div`
  display: flex;

  h1 {
    font-size: 1.5em;
    padding: ${spacing(2)} ${spacing(1.5)} ${spacing(1.5)};
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
  padding: ${spacing(1.5)};
`;

type Props = {
  canSave: boolean;
  hasChanges: boolean;
  hasPreview: boolean;
  isNewRuleSet: boolean;
  onCancel: () => void;
  onPreview?: () => void;
  onSave: () => void;
  shouldHidePreview: boolean;
  title: string;
  rulesetType: string;
  writeEnabled: boolean;
};

export const ProductGridHeader = ({
  canSave,
  hasChanges,
  hasPreview,
  isNewRuleSet,
  onCancel,
  onPreview,
  onSave,
  shouldHidePreview,
  title,
  rulesetType,
  writeEnabled,
}: Props) => {
  const [showModal, setShowModal] = useState(false);

  const onCancelChange = () => {
    if (hasChanges) {
      setShowModal(true);
    } else {
      onCancel();
    }
  };

  const isSaveButtonDisabled = !canSave;

  return (
    <>
      <RuleSetOptions>
        <h1>{title}</h1>
        <Actions>
          <Button onClick={onCancelChange}>Cancel</Button>
          {!shouldHidePreview && (
            <Button onClick={onPreview} isDisabled={!hasPreview}>
              Preview
            </Button>
          )}
          {writeEnabled && (
            <Button
              theme="primary"
              isDisabled={isSaveButtonDisabled}
              onClick={() => {
                track({
                  event: `${isNewRuleSet ? 'create' : 'edit'}-${rulesetType}-rule`,
                });
                onSave();
              }}
            >
              {isNewRuleSet ? 'Create' : 'Save'}
            </Button>
          )}
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
