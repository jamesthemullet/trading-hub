import { Divider, Modal } from '@mantine/core';

import { Button, Typography } from '@/libs/components';
import { CopyMessageBox } from '@/libs/components/copy-message-box/copy-message-box';
import {
  DIFF_TYPE_LABEL,
  LABEL_ICON,
} from '@/libs/components/ruleset-diff-modal/ruleset-diff-modal.constants';
import type { DiffItem } from '@/libs/hooks/use-ruleset-diff';

import Image from 'next/image';

import styles from './conflict-modal.module.css';

type ConflictModalProps = {
  opened: boolean;
  diffItems: DiffItem[];
  onDiscard: () => void;
  onOverwrite: () => void;
  onClose: () => void;
  changedBy?: string;
  isSaving?: boolean;
};

const buildChangesSummary = (diffItems: DiffItem[]): string =>
  diffItems
    .map(
      (item) =>
        `${DIFF_TYPE_LABEL[item.type]} ${item.label}: ${item.description}`
    )
    .join('\n');

export const ConflictModal = ({
  opened,
  diffItems,
  onDiscard,
  onOverwrite,
  onClose,
  changedBy,
  isSaving = false,
}: ConflictModalProps) => {
  return (
    <Modal.Root
      opened={opened}
      onClose={onClose}
      centered
      padding={20}
      size="lg"
      closeOnClickOutside={!isSaving}
      closeOnEscape={!isSaving}
    >
      <Modal.Overlay blur={3} />
      <Modal.Content>
        <Modal.Body>
          <Modal.Title component="div">
            <Typography as="h2" variant="titleMedium" isStrong hasMargin>
              This ruleset was changed by someone else
            </Typography>
          </Modal.Title>

          <Typography variant="bodySmall" hasMargin>
            {changedBy
              ? `Someone else (${changedBy}) saved changes to this ruleset since you opened it.`
              : 'Someone else saved changes to this ruleset since you opened it.'}{' '}
            Overwriting will replace their changes with yours. Discarding will
            keep their changes and lose yours.
          </Typography>

          <Divider
            color="var(--color-role-outline-outline-variant)"
            mx={-20}
            my="sm"
          />

          {diffItems.length === 0 ? (
            <Typography variant="bodySmall" hasMargin>
              The specific changes could not be determined.
            </Typography>
          ) : (
            <>
              <Typography variant="bodySmall" isStrong hasMargin>
                Changes made since you opened this ruleset
              </Typography>
              <ul className={styles.diffList}>
                {diffItems.map((item) => {
                  const iconSrc =
                    LABEL_ICON[`${item.type}-${item.label}`] ??
                    LABEL_ICON[item.label];

                  return (
                    <li
                      key={`${item.type}-${item.label}-${item.description}`}
                      className={styles.diffItem}
                      data-type={item.type}
                    >
                      {iconSrc && (
                        <Image
                          src={iconSrc}
                          width={16}
                          height={16}
                          alt=""
                          data-testid="change-type-icon"
                          className={styles.diffItemIcon}
                        />
                      )}
                      <div>
                        <Typography variant="bodySmall" isStrong>
                          {DIFF_TYPE_LABEL[item.type]} {item.label}
                        </Typography>
                        <Typography variant="bodySmall">
                          {item.description}
                        </Typography>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <CopyMessageBox
                message={buildChangesSummary(diffItems)}
                isMultiline
              />
            </>
          )}

          <Divider
            color="var(--color-surface-dark-on-surface-dark-container)"
            mx={-20}
            my="sm"
          />

          <div className={styles.buttons}>
            <Button
              onClick={onDiscard}
              theme="secondary"
              isInline
              isDisabled={isSaving}
            >
              Discard my changes
            </Button>
            <Button
              onClick={onOverwrite}
              theme="primary"
              isInline
              isDisabled={isSaving}
              data-autofocus
            >
              Overwrite with my changes
            </Button>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};
