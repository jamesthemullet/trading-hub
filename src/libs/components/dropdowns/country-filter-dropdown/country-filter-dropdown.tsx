import styled from '@emotion/styled';
import { useState } from 'react';

import type { MerchandisingCountryCode } from '@/libs/api';
import { useOnOutsideClick } from '@/libs/hooks';

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
  width: 230px;

  button {
    border: none;
    border-radius: 1px 1px 0 0;
  }
`;

export const CountryFilterDropdown = ({
  onChange,
}: {
  onChange: (country?: MerchandisingCountryCode) => void;
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const createDropdownOption = (
    index: number,
    label: string,
    selected: boolean,
    countryCodeSelected?: MerchandisingCountryCode
  ) => ({
    index,
    label,
    selected,
    ariaLabel: `select ${label}`,
    countryCodeSelected,
  });

  const [dropdownOptions, setDropdownOptions] = useState([
    createDropdownOption(0, 'All marksandspencer.com', true),
    createDropdownOption(1, 'UK only marksandspencer', false, 'UK'),
    createDropdownOption(2, 'IE only marksandspencer', false, 'IE'),
  ]);

  const handleOnClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSelectedOption = (index: number) => {
    const updatedDropdownOptions = dropdownOptions.map((option) => {
      if (option.index === index) {
        if (onChange) {
          onChange(option.countryCodeSelected);
        }
        return { ...option, selected: true };
      }
      return { ...option, selected: false };
    });

    setDropdownOptions(updatedDropdownOptions);
    setIsDropdownOpen(false);
  };

  const dropdownHeading = dropdownOptions.find(
    (option) => option.selected === true
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
      ref={dropdownWrapperRef}
      onKeyDown={handleOnKeyDown}
    >
      <DropdownButton
        isDropdownOpen={isDropdownOpen}
        onClick={handleOnClick}
        aria-haspopup="listbox"
        aria-expanded={isDropdownOpen}
      >
        <DropdownHeading>{dropdownHeading?.label}</DropdownHeading>
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
            {option.label}
          </DropdownOption>
        ))}
      </DropdownContainer>
    </DropdownWrapperNoBorder>
  );
};
