import styled from '@emotion/styled';
import { useState } from 'react';

import type { MerchandisingCountryCode } from '@/libs/api';
import { useOnOutsideClick } from '@/libs/hooks';

import Image from 'next/image';

import {
  Arrow,
  ArrowContainer,
  DropdownButton,
  DropdownContainer,
  DropdownHeading,
  DropdownOption,
  DropdownWrapper,
} from '../dropdown.styles';

const DropdownWrapperNoBorder = styled(DropdownWrapper)`
  border: none;
  border-bottom: 1px solid #b1b1b1;
  border-radius: 1px 1px 0 0;
  min-height: 54px;

  button {
    border: none;
    border-radius: 1px 1px 0 0;
    min-height: 54px;
  }
`;

export const CountrySelectorDropdown = ({
  onChange,
  selectedCountryCode,
}: {
  onChange: (country: MerchandisingCountryCode) => void;
  selectedCountryCode?: MerchandisingCountryCode;
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const createDropdownOption = (
    index: number,
    label: string,
    selected: boolean,
    countryCode: MerchandisingCountryCode
  ) => ({
    index,
    label,
    selected,
    ariaLabel: `select ${label}`,
    countryCode,
    flagsToShow: countryCode === 'UK_IE' ? ['UK', 'IE'] : [countryCode],
  });

  const [dropdownOptions, setDropdownOptions] = useState([
    createDropdownOption(0, 'UK/IE Market', true, 'UK_IE'),
    createDropdownOption(1, 'UK market only', false, 'UK'),
    createDropdownOption(2, 'IE market only', false, 'IE'),
  ]);

  const handleOnClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSelectedOption = (index: number) => {
    const updatedDropdownOptions = dropdownOptions.map((option) => {
      if (option.index === index) {
        if (onChange) {
          onChange(option.countryCode);
        }
        return { ...option, selected: true };
      }
      return { ...option, selected: false };
    });

    setDropdownOptions(updatedDropdownOptions);
    setIsDropdownOpen(false);
  };

  const dropdownHeading = dropdownOptions.find(
    (option) => option.countryCode === selectedCountryCode
  );

  const onClose = () => {
    setIsDropdownOpen(false);
  };

  const dropdownWrapperRef = useOnOutsideClick<HTMLDivElement>({
    handler: onClose,
  });

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && isDropdownOpen) {
      return onClose();
    }
  };

  return (
    <DropdownWrapperNoBorder
      isDropdownOpen={isDropdownOpen}
      width={220}
      ref={dropdownWrapperRef}
      onKeyDown={handleOnKeyDown}
    >
      <DropdownButton
        isDropdownOpen={isDropdownOpen}
        onClick={handleOnClick}
        aria-haspopup="listbox"
        aria-expanded={isDropdownOpen}
        aria-label="select market"
      >
        <DropdownHeading>
          {dropdownHeading?.flagsToShow.map((flag) => (
            <Image
              key={flag}
              src={`/trading-hub/asset/icon-${flag.toLowerCase()}-flag.svg`}
              width={20}
              height={20}
              alt={flag}
            />
          ))}
          {dropdownHeading?.label}
        </DropdownHeading>
        <ArrowContainer borderLeft={false}>
          <Arrow isDropdownOpen={isDropdownOpen} />
        </ArrowContainer>
      </DropdownButton>

      <DropdownContainer isDropdownOpen={isDropdownOpen}>
        {dropdownOptions.map((option) => (
          <DropdownOption
            key={option.label}
            hoverColour="#f5f5f5"
            onClick={() => handleSelectedOption(option.index)}
            aria-label={option.ariaLabel}
          >
            <>
              {option.flagsToShow.map((flag) => (
                <Image
                  key={flag}
                  src={`/trading-hub/asset/icon-${flag.toLowerCase()}-flag.svg`}
                  width={20}
                  height={20}
                  alt={flag}
                />
              ))}
              {option.label}
            </>
          </DropdownOption>
        ))}
      </DropdownContainer>
    </DropdownWrapperNoBorder>
  );
};
