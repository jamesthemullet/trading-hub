import { useState } from 'react';

import { labels } from '@/libs/utils/ruleset-attributes';

import Image from 'next/image';

import { CombinedDropdown } from '../dropdown/dropdown';
import { DropdownOption } from '../dropdown/dropdown.styles';
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
}) => {
  const [closeDropdown, setCloseDropdown] = useState(false);

  const label = labels[selectedOperation];

  return (
    <div className={styles.dropdownWrapper}>
      <CombinedDropdown
        variant="generic"
        label={label.text}
        icon={label.icon}
        width={150}
        ariaLabel={`Select to ${hasIncludeExclude ? 'include, exclude, ' : ''}boost or bury`}
        closeFromChild={closeDropdown}
        onOpen={() => {
          setCloseDropdown(false);
        }}
      >
        <DropdownOption
          onClick={() => {
            setCloseDropdown(true);
            setSelectedOperation('boost');
          }}
          role="option"
          aria-selected={selectedOperation === 'boost'}
        >
          <Image
            src="/trading-hub/asset/boost-signifier.svg"
            alt=""
            width={20}
            height={20}
          />
          Boost
        </DropdownOption>
        <DropdownOption
          onClick={() => {
            setCloseDropdown(true);
            setSelectedOperation('bury');
          }}
          role="option"
          aria-selected={selectedOperation === 'bury'}
        >
          <Image
            src="/trading-hub/asset/bury-signifier.svg"
            alt=""
            width={20}
            height={20}
          />
          Bury
        </DropdownOption>
        {hasIncludeExclude && (
          <>
            <DropdownOption
              onClick={() => {
                setCloseDropdown(true);
                setSelectedOperation('include');
              }}
              role="option"
              aria-selected={selectedOperation === 'include'}
            >
              <Image
                src="/trading-hub/asset/icon-include.svg"
                alt=""
                width={20}
                height={20}
              />
              Include only
            </DropdownOption>

            <DropdownOption
              onClick={() => {
                setCloseDropdown(true);
                setSelectedOperation('exclude');
              }}
              role="option"
              aria-selected={selectedOperation === 'exclude'}
            >
              <Image
                src="/trading-hub/asset/icon-exclude.svg"
                alt=""
                width={20}
                height={20}
              />
              Exclude only
            </DropdownOption>
          </>
        )}
      </CombinedDropdown>
    </div>
  );
};
