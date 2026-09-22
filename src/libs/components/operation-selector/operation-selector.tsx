import type { ReactElement } from 'react';
import { useState } from 'react';

import { Typography } from '@/libs/components';
import { labels } from '@/libs/utils/ruleset-attributes';

import Image from 'next/image';

import { Button } from '../button/button';
import { CombinedDropdown, DropdownVariant } from '../dropdown/dropdown';
import dropdownStyles from '../dropdown/dropdown.module.css';
import styles from './operation-selector.module.css';

export const OperationSelector = ({
  hasIncludeExclude,
  selectedOperation,
  setSelectedOperation,
}: {
  hasIncludeExclude: boolean;
  selectedOperation: 'boost' | 'bury' | 'include' | 'exclude';
  setSelectedOperation: (
    args: 'boost' | 'bury' | 'include' | 'exclude'
  ) => void;
}): ReactElement => {
  const [shouldCloseDropdown, setShouldCloseDropdown] = useState(false);

  const label = labels[selectedOperation];

  return (
    <div className={styles.dropdownWrapper}>
      <CombinedDropdown
        variant={DropdownVariant.Generic}
        label={label.text}
        icon={label.icon}
        width={150}
        ariaLabel={`Select to ${hasIncludeExclude ? 'include, exclude, ' : ''}boost or bury`}
        shouldCloseFromChild={shouldCloseDropdown}
        onOpen={() => {
          setShouldCloseDropdown(false);
        }}
      >
        <Button
          className={dropdownStyles.dropdownOption}
          data-hover-grey
          type="button"
          onClick={() => {
            setShouldCloseDropdown(true);
            setSelectedOperation('boost');
          }}
          role="menuitemradio"
          aria-checked={selectedOperation === 'boost'}
        >
          <Image
            src="/trading-hub/asset/boost-signifier.svg"
            alt=""
            width={20}
            height={20}
          />
          <Typography variant="bodySmall" as="span">
            Boost
          </Typography>
        </Button>
        <Button
          className={dropdownStyles.dropdownOption}
          data-hover-grey
          type="button"
          onClick={() => {
            setShouldCloseDropdown(true);
            setSelectedOperation('bury');
          }}
          role="menuitemradio"
          aria-checked={selectedOperation === 'bury'}
        >
          <Image
            src="/trading-hub/asset/bury-signifier.svg"
            alt=""
            width={20}
            height={20}
          />
          <Typography variant="bodySmall" as="span">
            Bury
          </Typography>
        </Button>
        {hasIncludeExclude && (
          <>
            <Button
              className={dropdownStyles.dropdownOption}
              data-hover-grey
              type="button"
              onClick={() => {
                setShouldCloseDropdown(true);
                setSelectedOperation('include');
              }}
              role="menuitemradio"
              aria-checked={selectedOperation === 'include'}
            >
              <Image
                src="/trading-hub/asset/icon-include.svg"
                alt=""
                width={20}
                height={20}
              />
              <Typography variant="bodySmall" as="span">
                Include only
              </Typography>
            </Button>

            <Button
              className={dropdownStyles.dropdownOption}
              data-hover-grey
              type="button"
              onClick={() => {
                setShouldCloseDropdown(true);
                setSelectedOperation('exclude');
              }}
              role="menuitemradio"
              aria-checked={selectedOperation === 'exclude'}
            >
              <Image
                src="/trading-hub/asset/icon-exclude.svg"
                alt=""
                width={20}
                height={20}
              />
              <Typography variant="bodySmall" as="span">
                Exclude only
              </Typography>
            </Button>
          </>
        )}
      </CombinedDropdown>
    </div>
  );
};
