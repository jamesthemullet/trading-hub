import { Button, ErrorMessage, InfoBox, Typography } from '@/libs/components';
import { FacetsPanelAccordion } from '@/libs/containers/facets/facets-panel-accordion/facets-panel-accordion';
import { getFlagFromCountryCode } from '@/libs/utils/get-flag-from-country-code';

import Image from 'next/image';

import styles from './facet-attributes-page-layout-header.module.css';

type CommonHeaderProps = {
  displayName: string;
  error?: string;
  onSave: () => void;
  writeEnabled: boolean;
  countryCode: string;
  onClose: (facetType: 'category' | 'search' | 'global') => void;
};

type GlobalHeaderProps = CommonHeaderProps & {
  facetType: 'global';
};

type NonGlobalHeaderProps = CommonHeaderProps & {
  facetType: 'category' | 'search';
  headerText?: string;
  algoControlValues: number;
  includedValues: number;
  excludedValues: number;
};

type HeaderProps = GlobalHeaderProps | NonGlobalHeaderProps;

export const FacetAttributesPageLayoutHeader = (props: HeaderProps) => {
  const {
    displayName,
    facetType,
    error,
    onClose,
    onSave,
    writeEnabled,
    countryCode,
  } = props;

  return (
    <div className={styles.wrapper}>
      <div className={styles.flagAndButtons}>
        <div className={styles.flagAndText}>
          {countryCode &&
            getFlagFromCountryCode(countryCode).map(({ flags, alt }, index) => (
              <Image key={index} src={flags} width={20} height={20} alt={alt} />
            ))}

          {facetType === 'global' ? (
            <InfoBox text="All pages on the M&S website and app" />
          ) : (
            <Typography variant="bodySmall">{props.headerText}</Typography>
          )}
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

          <Button theme="primary" isDisabled={!writeEnabled} onClick={onSave}>
            Save
          </Button>
        </div>
      </div>
      <Typography as="h1" variant="titleLarge">
        Value settings of: {displayName}
      </Typography>

      {error && <ErrorMessage>Error updating facet: {error}</ErrorMessage>}

      {facetType !== 'global' && (
        <>
          <span className={styles.divider} />

          <div className={styles.summaryWrapper}>
            <FacetsPanelAccordion
              boostedCount={props.includedValues}
              excludedCount={props.excludedValues}
              nonBoostedExcludedCount={props.algoControlValues}
            />
          </div>
        </>
      )}
    </div>
  );
};
