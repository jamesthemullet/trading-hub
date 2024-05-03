import Image from 'next/image';
import { useState } from 'react';
import {
  DropdownWrapper,
  DropdownButton,
  DropdownHeading,
  ArrowContainer,
  Arrow,
  DropdownContainer,
  DropdownOption,
} from '../dropdown.styles';

export const FacetOrderDropdown = ({
  defaultOrderData,
  onChange,
}: {
  defaultOrderData?: string;
  onChange?: (label: string) => void;
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState([
    {
      index: 0,
      label: 'Select an action',
      src: null,
      selected: true,
    },
    {
      index: 1,
      label: 'Include only',
      src: '/trading-hub/asset/icon-tick.svg',
      selected: false,
    },
    {
      index: 2,
      label: 'Exclude only',
      src: '/trading-hub/asset/icon-cross.svg',
      selected: false,
    },
  ]);

  const handleOnClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSelectedOption = (index: number) => {
    const updatedDropdownOptions = dropdownOptions.map((option) => {
      if (option.index === index) {
        onChange && onChange(option.label);
        return { ...option, selected: true };
      }
      return { ...option, selected: false };
    });

    setDropdownOptions(updatedDropdownOptions);
    setIsDropdownOpen(false);
  };

  const dropdownHeading =
    dropdownOptions.find((option) => option.label === defaultOrderData) ||
    dropdownOptions.find((option) => option.selected === true);

  return (
    <DropdownWrapper isDropdownOpen={isDropdownOpen} width={237}>
      <DropdownButton
        isDropdownOpen={isDropdownOpen}
        onClick={handleOnClick}
        aria-haspopup="listbox"
        aria-expanded={isDropdownOpen}
        data-testid="button to open facet order dropdown"
      >
        <DropdownHeading>
          {dropdownHeading?.src && (
            <Image src={dropdownHeading.src} alt="" width={16} height={16} />
          )}
          {dropdownHeading?.label}
        </DropdownHeading>
        <ArrowContainer borderLeft={true}>
          <Arrow isDropdownOpen={isDropdownOpen} />
        </ArrowContainer>
      </DropdownButton>

      <DropdownContainer isDropdownOpen={isDropdownOpen}>
        {dropdownOptions.map(
          (option) =>
            option.src && (
              <DropdownOption
                key={option.label}
                hoverColour="#f5f5f5"
                onClick={() => handleSelectedOption(option.index)}
              >
                <Image src={option.src} alt="" width={16} height={16} />
                {option.label}
              </DropdownOption>
            )
        )}
      </DropdownContainer>
    </DropdownWrapper>
  );
};
