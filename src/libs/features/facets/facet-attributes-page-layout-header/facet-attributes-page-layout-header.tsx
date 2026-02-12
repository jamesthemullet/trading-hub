import { Button, ErrorMessage, Typography } from '@/libs/components';

import Image from 'next/image';

import styles from './facet-attributes-page-layout-header.module.css';

type HeaderProps = {
  algoControlValues: number;
  includedValues: number;
  excludedValues: number;
  displayName: string;
  facetType: 'category' | 'search' | 'global';
  isSaveDisabled: boolean;
  error?: string;
  onClose: (facetType: 'category' | 'search' | 'global') => void;
  onSave: () => void;
  writeEnabled: boolean;
};

export const FacetAttributesPageLayoutHeader = ({
  algoControlValues,
  includedValues,
  excludedValues,
  displayName,
  facetType,
  isSaveDisabled,
  error,
  onClose,
  onSave,
  writeEnabled,
}: HeaderProps) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.flagAndButtons}>
        <div className={styles.flagAndText}>
          <Image
            src="/trading-hub/asset/icon-uk-flag.svg"
            width={20}
            height={20}
            alt="UK flag"
          />
          <Typography variant="bodySmall">All pages</Typography>
        </div>
        <div className={styles.buttonContainer}>
          <Button
            theme="outlined"
            isTextCentred
            onClick={() => {
              onClose(facetType);
            }}
            type="button"
          >
            Cancel
          </Button>

          <Button
            theme="primary"
            isDisabled={isSaveDisabled || !writeEnabled}
            onClick={onSave}
          >
            Save
          </Button>
        </div>
      </div>
      <Typography as="h1" variant="titleLarge">
        Value settings of: {displayName}
      </Typography>

      {error && <ErrorMessage>Error updating facet: {error}</ErrorMessage>}

      <div className={styles.summary}>
        <div className={styles.summaryBox} data-testid="include-only-count">
          <Typography variant="headlineSmall">{includedValues}</Typography>
          <Typography variant="labelMedium">Include only</Typography>
        </div>
        <div className={styles.summaryBox} data-testid="algo-control-count">
          <Typography variant="headlineSmall">{algoControlValues}</Typography>
          <Typography variant="labelMedium">Algo control</Typography>
        </div>
        <div className={styles.summaryBox} data-testid="exclude-only-count">
          <Typography variant="headlineSmall">{excludedValues}</Typography>
          <Typography variant="labelMedium">Exclude only</Typography>
        </div>
      </div>
    </div>
  );
};
