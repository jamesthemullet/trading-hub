import type { Dispatch } from 'react';
import { useState } from 'react';
import { Divider, Modal } from '@mantine/core';

import type { MerchandisingRuleSet } from '@/libs/api';
import { Button, Typography } from '@/libs/components';
import type { RuleSetActions } from '@/libs/components/types';
import { track } from '@/libs/hooks/utils/analytics';

import pluralize from 'pluralize';

import styles from './bulk-actions.module.css';

type BulkActionsTypes = {
  dispatch: Dispatch<RuleSetActions>;
  hasRestore: boolean;
  ruleset: MerchandisingRuleSet;
  selectedProducts: string[];
  onReset: () => void;
  rulesetType: 'global' | 'category' | 'search';
};

type ActionType = 'boost' | 'bury' | 'block';
type ChangeType = 'add' | 'remove';

export const BulkActions = ({
  dispatch,
  hasRestore,
  onReset,
  ruleset,
  selectedProducts,
  rulesetType,
}: BulkActionsTypes) => {
  const [showBulkActionsMenu, setShowBulkActionsMenu] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionToPerform, setActionToPerform] = useState<ActionType>('block');
  const [changeToPerform, setChangeToPerform] = useState<ChangeType>('add');

  const bulkAction = (type: ActionType) => {
    dispatch({
      type: 'product',
      payload: {
        ids: selectedProducts,
        operation: type,
        change: 'add',
      },
    });
    setShowBulkActionsMenu(false);
    track({
      event: `Bulk Action - ${rulesetType} - ${type} - ${selectedProducts.length} ${pluralize('item', selectedProducts.length)}`,
    });
    onReset();
  };

  const bulkActionRemove = () => {
    dispatch({
      type: 'product',
      payload: {
        ids: selectedProducts,
        operation: 'all',
        change: 'remove',
      },
    });
    setShowBulkActionsMenu(false);
    track({
      event: `Bulk Action - ${rulesetType} - restore - ${selectedProducts.length} ${pluralize('item', selectedProducts.length)}`,
    });
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

  const allSelectedProductsBlocked =
    selectedProducts.length === overwrittenBlockedRules.length;
  const allSelectedProductsBoosted =
    selectedProducts.length === overwrittenBoostRules.length;
  const allSelectedProductsBuried =
    selectedProducts.length === overwrittenBuryRules.length;

  return (
    <>
      <div className={styles.bulkActionsSpacer} />
      <div className={styles.confirmationPanel}>
        <div className={styles.confirmationInfo}>
          <Typography variant="bodySmall">
            {selectedProducts.length}{' '}
            {pluralize('item', selectedProducts.length)} selected
          </Typography>
        </div>

        <div className={styles.confirmationActions}>
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
              <button
                className={styles.productMenuOverlay}
                type="submit"
                aria-label="select available bulk actions"
                onClick={() => {
                  setShowBulkActionsMenu(false);
                }}
              />
              <div className={styles.productMenu}>
                <div className={styles.bulkActionsHeader}>
                  <Typography as="h3" isStrong variant="bodySmall">
                    Bulk actions
                  </Typography>
                </div>
                {hasRestore && (
                  <button
                    className={`${styles.productMenuButton} ${styles.iconRestore}`}
                    type="submit"
                    onClick={() => {
                      setChangeToPerform('remove');
                      setIsModalOpen(true);
                    }}
                  >
                    <Typography variant="bodySmall">Restore</Typography>
                  </button>
                )}

                {!allSelectedProductsBoosted && (
                  <button
                    className={`${styles.productMenuButton} ${styles.iconBoost}`}
                    type="button"
                    onClick={() => {
                      setActionToPerform('boost');
                      setChangeToPerform('add');
                      setIsModalOpen(true);
                    }}
                  >
                    <Typography variant="bodySmall">Boost to Top</Typography>
                  </button>
                )}

                {!allSelectedProductsBuried && (
                  <button
                    className={`${styles.productMenuButton} ${styles.iconBury}`}
                    type="button"
                    onClick={() => {
                      setActionToPerform('bury');
                      setChangeToPerform('add');
                      setIsModalOpen(true);
                    }}
                  >
                    <Typography variant="bodySmall">Bury to Bottom</Typography>
                  </button>
                )}

                {!allSelectedProductsBlocked && (
                  <button
                    className={`${styles.productMenuButton} ${styles.iconBlock}`}
                    type="button"
                    onClick={() => {
                      setActionToPerform('block');
                      setChangeToPerform('add');
                      setIsModalOpen(true);
                    }}
                  >
                    <Typography variant="bodySmall">Block Product</Typography>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Modal.Root
        centered
        opened={isModalOpen}
        onClose={onCloseModal}
        padding={10}
      >
        <Modal.Overlay blur={3} />
        <Modal.Content aria-label="Apply bulk action confirmation">
          <Modal.Body>
            <Typography variant="titleSmall" isStrong as="h3">
              Apply new bulk action
            </Typography>

            <Typography withMargin variant="bodySmall">
              Are you sure you want to proceed? This action will apply to{' '}
              <Typography as="span" isStrong variant="bodySmall">
                {selectedProducts.length}&nbsp;
                {pluralize('item', selectedProducts.length)}
              </Typography>{' '}
              and will overwrite existing actions on{' '}
              <Typography as="span" isStrong variant="bodySmall">
                {totalOverwrittenRules}&nbsp;
                {pluralize('item', totalOverwrittenRules)}
              </Typography>
              .
            </Typography>

            <Divider />

            <div className={styles.modalButtons}>
              <Button
                onClick={() => setIsModalOpen(false)}
                theme="secondary"
                isInline
              >
                Cancel
              </Button>

              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  return changeToPerform === 'add'
                    ? bulkAction(actionToPerform)
                    : bulkActionRemove();
                }}
                theme="primary"
                data-autofocus
                isInline
              >
                Apply action
              </Button>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </>
  );
};
