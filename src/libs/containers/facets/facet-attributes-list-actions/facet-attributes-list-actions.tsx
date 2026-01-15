import type { ChangeEvent } from 'react';

import { Button, Search } from '@/libs/components';
import { Typography } from '@/libs/components/typography/typography';

import styles from './facet-attributes-list-actions.module.css';

export const FacetAttributesListActions = ({
  onSearchChange,
  onMergeClick,
  writeEnabled,
  isMergeHidden = false,
  isMergeDisabled = true,
  checkedRows = 0,
}: {
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onMergeClick?: () => void;
  writeEnabled: boolean;
  isMergeHidden?: boolean;
  isMergeDisabled?: boolean;
  checkedRows?: number;
}) => {
  const isDisabled = isMergeDisabled || !writeEnabled;
  return (
    <div className={styles.container}>
      <div className={styles.buttonsContainer}>
        {!isMergeHidden && (
          <>
            <Button
              className={styles.button}
              theme="primary"
              onClick={onMergeClick}
              isDisabled={isDisabled}
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

            <Typography
              variant="bodyMedium"
              className={checkedRows > 0 ? '' : styles.dragText}
            >
              {checkedRows > 0
                ? `${checkedRows} selected`
                : 'Drag and drop to change ranking below'}
            </Typography>
          </>
        )}
      </div>

      <div className={styles.searchWrapper}>
        <Search onChange={onSearchChange} placeholder="Search" fullWidth />
      </div>
    </div>
  );
};
