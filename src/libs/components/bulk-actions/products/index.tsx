import { Dispatch, useState } from 'react';
import { Divider, Modal } from '@mantine/core';

import { RuleSet } from '@/libs/api';

import pluralize from 'pluralize';

import { Button } from '../../buttons/button/button';
import { Action } from '../../types';
import { Header3, Text } from '../../typography/typography.styles';
import {
  BulkActionsHeader,
  Buttons,
  ConfirmationActions,
  ConfirmationInfo,
  ConfirmationPanel,
  ProductMenu,
  ProductMenuButton,
  ProductMenuOverlay,
} from '../bulk-actions.styles';

type BulkActionsTypes = {
  dispatch: Dispatch<Action>;
  ruleset: RuleSet;
  selectedProducts: string[];
  onReset: () => void;
};

type ActionType = 'boost' | 'bury' | 'block';

export const BulkActions = ({
  dispatch,
  onReset,
  ruleset,
  selectedProducts,
}: BulkActionsTypes) => {
  const [showBulkActionsMenu, setShowBulkActionsMenu] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionToPerform, setActionToPerform] = useState<ActionType>('block');
  const action = (type: ActionType) => {
    dispatch({
      type: 'product',
      payload: {
        ids: selectedProducts,
        operation: type,
        change: 'add',
      },
    });
    setShowBulkActionsMenu(false);
    onReset();
  };

  const onCloseModal = () => setIsModalOpen(false);

  const overwrittenPinnedRules = ruleset.rules.pinnedProducts.filter(({ id }) =>
    selectedProducts.includes(id)
  );
  const overwrittenBoostRules = ruleset.rules.boosts.product.filter(({ id }) =>
    selectedProducts.includes(id)
  );
  const overwrittenBuryRules = ruleset.rules.buries.product.filter(({ id }) =>
    selectedProducts.includes(id)
  );
  const overwrittenBlockedRules = ruleset.rules.blockedProducts.filter(
    ({ id }) => selectedProducts.includes(id)
  );
  const totalOverwrittenRules = [
    ...overwrittenPinnedRules,
    ...overwrittenBlockedRules,
    ...overwrittenBoostRules,
    ...overwrittenBuryRules,
  ].length;

  return (
    <>
      <ConfirmationPanel>
        <ConfirmationInfo>
          <Text>
            {selectedProducts.length}{' '}
            {pluralize('item', selectedProducts.length)} selected
          </Text>
        </ConfirmationInfo>

        <ConfirmationActions>
          <Button theme="secondary" isInline onClick={() => onReset()}>
            Deselect
          </Button>
          <Button
            theme="primary"
            isInline
            onClick={() => setShowBulkActionsMenu(!showBulkActionsMenu)}
          >
            Bulk actions
          </Button>

          {showBulkActionsMenu && (
            <>
              <ProductMenuOverlay
                aria-label="menu overlay"
                onClick={() => {
                  setShowBulkActionsMenu(false);
                }}
              />
              <ProductMenu>
                <BulkActionsHeader isStrong as="h4">
                  Bulk actions
                </BulkActionsHeader>
                <ProductMenuButton
                  icon="boost"
                  as="button"
                  onClick={() => {
                    setActionToPerform('boost');
                    setIsModalOpen(true);
                  }}
                >
                  Boost to Top
                </ProductMenuButton>

                <ProductMenuButton
                  icon="bury"
                  as="button"
                  onClick={() => {
                    setActionToPerform('bury');
                    setIsModalOpen(true);
                  }}
                >
                  Bury to Bottom
                </ProductMenuButton>

                <ProductMenuButton
                  icon="block"
                  as="button"
                  onClick={() => {
                    setActionToPerform('block');
                    setIsModalOpen(true);
                  }}
                >
                  Block Product
                </ProductMenuButton>
              </ProductMenu>
            </>
          )}
        </ConfirmationActions>
      </ConfirmationPanel>

      <Modal.Root
        centered
        opened={isModalOpen}
        onClose={onCloseModal}
        padding={10}
        role="dialog"
        aria-modal="true"
      >
        <Modal.Overlay blur={3} />
        <Modal.Content>
          <Modal.Body>
            <Header3>Apply new bulk action</Header3>

            <Text withMargin>
              Are you sure you want to proceed? This action will apply to{' '}
              <strong>
                {selectedProducts.length}&nbsp;
                {pluralize('item', selectedProducts.length)}
              </strong>{' '}
              and will overwrite existing actions on{' '}
              <strong>
                {totalOverwrittenRules}&nbsp;
                {pluralize('item', totalOverwrittenRules)}
              </strong>
              .
            </Text>

            <Divider />

            <Buttons>
              <Button onClick={() => setIsModalOpen(false)} theme="secondary">
                Cancel
              </Button>

              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  action(actionToPerform);
                }}
                theme="primary"
                data-autofocus
              >
                Apply action
              </Button>
            </Buttons>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </>
  );
};
