import type { ChangeEvent } from 'react';

import { Button, Search } from '@/libs/components';
import { Typography } from '@/libs/components/typography/typography';

import Image from 'next/image';

import styles from './global-facet-attributes-compact-bar.module.css';

type CompactBarProps = {
  onClose: () => void;
  onSave: () => void;
  onMergeClick: () => void;
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isWriteEnabled: boolean;
  isMergeDisabled: boolean;
  checkedRows: number;
  isPinned: boolean;
  onTogglePin: () => void;
};

export const GlobalFacetAttributesCompactBar = ({
  onClose,
  onSave,
  onMergeClick,
  onSearchChange,
  isWriteEnabled,
  isMergeDisabled,
  checkedRows,
  isPinned,
  onTogglePin,
}: CompactBarProps) => (
  <div className={styles.bar}>
    <Button
      className={styles.mergeButton}
      theme="primary"
      onClick={onMergeClick}
      isDisabled={isMergeDisabled || !isWriteEnabled}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <use
          href="/trading-hub/asset/icon-merge.svg"
          className={styles.mergeIcon}
        />
      </svg>
      <span>Merge</span>
    </Button>

    {checkedRows > 0 && (
      <Typography variant="bodyMedium" className={styles.selectedCount}>
        {checkedRows} selected
      </Typography>
    )}

    <div className={styles.searchWrapper}>
      <Search onChange={onSearchChange} placeholder="Search" fullWidth />
    </div>

    <div className={styles.actions}>
      <Button
        theme="outlined"
        isTextCentred
        onClick={onClose}
        type="button"
        className={styles.cancelButton}
      >
        Cancel
      </Button>
      <Button
        theme="primary"
        isDisabled={!isWriteEnabled}
        onClick={onSave}
        className={styles.saveButton}
      >
        Save
      </Button>
      <Button
        appearance="icon"
        aria-label="Unpin top bar"
        aria-pressed={isPinned}
        className={`${styles.pinButton} ${styles.pinButtonActive}`}
        onClick={onTogglePin}
      >
        <Image
          src="/trading-hub/asset/icon-pin.svg"
          width={14}
          height={19}
          alt=""
          className={styles.pinIcon}
        />
      </Button>
    </div>
  </div>
);
