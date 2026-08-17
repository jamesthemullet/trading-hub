import type { ReactElement } from 'react';
import { useId } from 'react';
import { Divider, Modal } from '@mantine/core';

import { Button, Typography } from '@/libs/components';
import type { DiffItem } from '@/libs/hooks/use-ruleset-diff';

import Image from 'next/image';

import { getDiffItemHeading, LABEL_ICON } from './ruleset-diff-modal.constants';
import styles from './ruleset-diff-modal.module.css';

type RulesetDiffModalProps = {
  isOpen: boolean;
  diffItems: DiffItem[];
  onConfirm: () => void;
  onCancel: () => void;
  shouldShowGlobalWarning?: boolean;
};

export const RulesetDiffModal = ({
  isOpen,
  diffItems,
  onConfirm,
  onCancel,
  shouldShowGlobalWarning = false,
}: RulesetDiffModalProps): ReactElement => {
  const titleId = useId();

  return (
    <Modal.Root opened={isOpen} onClose={onCancel} centered padding={20}>
      <Modal.Overlay blur={3} />
      <Modal.Content aria-labelledby={titleId}>
        <Modal.Body>
          <Modal.Title component="div" id={titleId}>
            <Typography as="h2" variant="titleMedium" isStrong hasMargin>
              Review changes
            </Typography>
          </Modal.Title>

          <Typography variant="bodySmall" hasMargin>
            The following changes will go live on the M&S website and app.
            Please review before saving.
          </Typography>

          <Divider
            color="var(--color-role-outline-outline-variant)"
            mx={-20}
            mb="sm"
          />

          {diffItems.length === 0 ? (
            <Typography variant="bodySmall" hasMargin>
              No changes detected.
            </Typography>
          ) : (
            <ul className={styles.diffList}>
              {diffItems.map((item) => {
                const iconSrc =
                  LABEL_ICON[`${item.type}-${item.label}`] ??
                  LABEL_ICON[item.label];
                const isDescendingOrderIcon =
                  item.label === 'Value order down' ||
                  item.label === 'Facet order down';

                return (
                  <li
                    key={`${item.type}-${item.label}-${item.description}`}
                    className={styles.diffItem}
                    data-type={item.type}
                  >
                    {iconSrc && (
                      <span
                        className={styles.diffItemIcon}
                        data-rotated={isDescendingOrderIcon || undefined}
                      >
                        <Image
                          src={iconSrc}
                          width={16}
                          height={16}
                          alt=""
                          data-testid="change-type-icon"
                        />
                      </span>
                    )}
                    <div>
                      <Typography variant="bodySmall" isStrong>
                        {getDiffItemHeading(item)}
                      </Typography>
                      <Typography variant="bodySmall">
                        {item.description}
                      </Typography>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <Divider
            color="var(--color-surface-dark-on-surface-dark-container)"
            mx={-20}
            mb="sm"
          />

          {shouldShowGlobalWarning && (
            <Typography variant="bodySmall">
              This action will apply changes to all live pages on the M&S
              website and app. Do you want to proceed?
            </Typography>
          )}

          <div className={styles.buttons}>
            <Button onClick={onCancel} theme="secondary" isInline>
              Cancel
            </Button>
            <Button onClick={onConfirm} theme="primary" isInline data-autofocus>
              Save changes
            </Button>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};
