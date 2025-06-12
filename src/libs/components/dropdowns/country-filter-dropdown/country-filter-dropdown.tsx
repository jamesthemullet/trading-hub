import { useState } from 'react';

import type { MerchandisingCountryCode } from '@/libs/api';
import { useOnOutsideClick } from '@/libs/hooks';
import { track } from '@/libs/hooks/utils/analytics';

import {
  Arrow,
  ArrowContainer,
  DropdownButton,
  DropdownContainer,
  DropdownHeading,
  DropdownOption,
  DropdownWrapperNoBorder,
} from '../dropdown.styles';

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

    track({
      event: `Change datatable filter to ${dropdownOptions[index].label}`,
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
      width={250}
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
