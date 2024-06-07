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
  status,
  onChange,
}: {
  status?: 'included' | 'excluded';
  onChange?: (status: 'included' | 'excluded') => void;
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState<
    {
      index: number;
      label: string;
      name: 'included' | 'excluded' | 'select';
      src: string | null;
      selected: boolean;
    }[]
  >([
    {
      index: 0,
      label: 'Select an action',
      name: 'select',
      src: null,
      selected: true,
    },
    {
      index: 1,
      label: 'Include only',
      name: 'included',
      src: '/trading-hub/asset/icon-tick.svg',
      selected: false,
    },
    {
      index: 2,
      label: 'Exclude only',
      name: 'excluded',
      src: '/trading-hub/asset/icon-cross.svg',
      selected: false,
    },
  ]);

  const handleOnClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSelectedOption = (index: number) => {
    const updatedDropdownOptions = dropdownOptions.map((option) => {
      if (option.index === index && option.name !== 'select') {
        onChange && onChange(option.name);
        return { ...option, selected: true };
      }
      return { ...option, selected: false };
    });

    setDropdownOptions(updatedDropdownOptions);
    setIsDropdownOpen(false);
  };

  const dropdownHeading =
    dropdownOptions.find((option) => option.name === status) ||
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
