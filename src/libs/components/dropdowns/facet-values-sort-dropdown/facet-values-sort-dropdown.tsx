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

export const FacetValuesSortDropdown = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState([
    {
      index: 0,
      label: 'Default',
      selected: true,
    },
    {
      index: 1,
      label: 'Alphabetical - Ascending (A to Z)',
      selected: false,
    },
    {
      index: 2,
      label: 'Alphabetical - Descending (Z to A)',
      selected: false,
    },
    {
      index: 3,
      label: 'Product Count - Ascending (Less to More)',
      selected: false,
    },
    {
      index: 4,
      label: 'Product Count - Descending (More to Less)',
      selected: false,
    },
  ]);

  const handleOnClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSelectedOption = (index: number) => {
    const updatedDropdownOptions = dropdownOptions.map((option) => {
      if (option.index === index) {
        return { ...option, selected: true };
      }
      return { ...option, selected: false };
    });

    setDropdownOptions(updatedDropdownOptions);
    setIsDropdownOpen(false);
  };

  // istanbul ignore next
  const dropdownHeading =
    dropdownOptions.find((option) => option.selected) || dropdownOptions[0];

  return (
    dropdownHeading && (
      <DropdownWrapper isDropdownOpen={isDropdownOpen}>
        <DropdownButton
          isDropdownOpen={isDropdownOpen}
          onClick={handleOnClick}
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
          data-testid="button to open facet values sort dropdown"
        >
          <DropdownHeading>{dropdownHeading.label}</DropdownHeading>
          <ArrowContainer>
            <Arrow isDropdownOpen={isDropdownOpen} />
          </ArrowContainer>
        </DropdownButton>

        <DropdownContainer isDropdownOpen={isDropdownOpen}>
          {dropdownOptions.map(
            (option) =>
              option.label && (
                <DropdownOption
                  key={option.label}
                  hoverColour="#f4faed"
                  onClick={() => handleSelectedOption(option.index)}
                >
                  {option.label}
                </DropdownOption>
              )
          )}
        </DropdownContainer>
      </DropdownWrapper>
    )
  );
};
