import { useState } from 'react';

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

export const FacetOrderDropdown = ({
  status,
  attribute,
  onChange,
}: {
  status?: 'included' | 'excluded';
  attribute?: string;
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
      ariaLabel: string;
    }[]
  >([
    {
      index: 0,
      label: 'Select an action',
      name: 'select',
      src: null,
      selected: true,
      ariaLabel: `select${attribute ? ` ${attribute}` : ''}`,
    },
    {
      index: 1,
      label: 'Include only',
      name: 'included',
      src: '/trading-hub/asset/icon-include-only.svg',
      selected: false,
      ariaLabel: `include${attribute ? ` ${attribute}` : ''}`,
    },
    {
      index: 2,
      label: 'Exclude only',
      name: 'excluded',
      src: '/trading-hub/asset/icon-exclude-only.svg',
      selected: false,
      ariaLabel: `exclude${attribute ? ` ${attribute}` : ''}`,
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
    <DropdownWrapper
      isDropdownOpen={isDropdownOpen}
      width={237}
      ref={dropdownWrapperRef}
      onKeyDown={handleOnKeyDown}
    >
      <DropdownButton
        isDropdownOpen={isDropdownOpen}
        onClick={handleOnClick}
        aria-haspopup="listbox"
        aria-expanded={isDropdownOpen}
        data-testid={`button to open facet order dropdown${attribute ? ` for ${attribute}` : ''}`}
      >
        <DropdownHeading>
          {dropdownHeading?.src && (
            <Image src={dropdownHeading.src} alt="" width={24} height={24} />
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
                aria-label={option.ariaLabel}
              >
                <Image src={option.src} alt="" width={24} height={24} />
                {option.label}
              </DropdownOption>
            )
        )}
      </DropdownContainer>
    </DropdownWrapper>
  );
};
