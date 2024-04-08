import styled from '@emotion/styled';
import Image from 'next/image';
import { spacing } from '../../utils/spacing';
import { useState } from 'react';
import { sizing } from '../../utils/sizing';
import { Text } from '../../typography/typography.styles';

const FacetOrderDropdownWrapper = styled.div`
  border: 1px solid #b1b1b1;
  border-radius: 4px;
  width: 237px;

  img {
    width: 16px;
    height: 16px;
    margin-right: ${spacing(1)};
  }
`;

const DropdownButton = styled.button<{ isDropdownOpen: boolean }>`
  align-items: center;
  border: none;
  border-radius: 4px;
  display: flex;
  height: ${sizing(5)};
  justify-content: space-between;
  align-items: center;
  padding: 0;
  width: ${sizing('100%')};
  box-sizing: content-box;

  ${({ isDropdownOpen }) =>
    isDropdownOpen &&
    'border-bottom: 1px solid #b1b1b1; border-radius: 4px 4px 0 0;'}
`;

const DropdownHeading = styled(Text)`
  display: flex;
  align-items: center;
  padding-left: ${spacing(1)};
`;

const ArrowContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border-left: 1px solid #b1b1b1;
  height: 100%;
  width: ${sizing(5)};
  box-sizing: border-box;
`;

const Arrow = styled.span<{ isDropdownOpen: boolean }>`
  transition: 0.3s;
  isolation: isolate;
  background: url('/trading-hub/asset/filled-chevron.svg');
  height: 5px;
  width: 10px;
  border: 0;
  padding: 1px;
  ${({ isDropdownOpen }) =>
    isDropdownOpen ? 'transform: rotate(180deg);' : ''}
`;

const DropdownContainer = styled.div<{ isDropdownOpen: boolean }>`
  display: none;
  ${({ isDropdownOpen }) => isDropdownOpen && 'display: block'}
`;

const DropdownOption = styled.button`
  background-color: #fff;
  width: 100%;
  height: 40px;
  border: none;
  display: flex;
  align-items: center;
  font-size: 14px;
  padding: ${spacing(1)};

  &:hover,
  &:active {
    background-color: #e3e3e3;
  }

  &:last-of-type {
    border-radius: 4px;
  }
`;

export const FacetOrderDropdown = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState([
    {
      index: 0,
      label: 'Always Show',
      src: '/trading-hub/asset/icon-tick.svg',
      selected: true,
    },
    {
      index: 1,
      label: 'Always Hide',
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
        return { ...option, selected: true };
      }
      return { ...option, selected: false };
    });

    setDropdownOptions(updatedDropdownOptions);
    setIsDropdownOpen(false);
  };

  const dropdownHeading = dropdownOptions.find((option) => option.selected);

  return (
    dropdownHeading && (
      <FacetOrderDropdownWrapper>
        <DropdownButton
          isDropdownOpen={isDropdownOpen}
          onClick={handleOnClick}
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
          data-testid="button to open facet order dropdown"
        >
          <DropdownHeading>
            <Image src={dropdownHeading.src} alt="" width={16} height={16} />
            {dropdownHeading.label}
          </DropdownHeading>
          <ArrowContainer>
            <Arrow isDropdownOpen={isDropdownOpen} />
          </ArrowContainer>
        </DropdownButton>

        <DropdownContainer isDropdownOpen={isDropdownOpen}>
          {dropdownOptions.map((option) => (
            <DropdownOption
              key={option.label}
              onClick={() => handleSelectedOption(option.index)}
            >
              <Image src={option.src} alt="" width={16} height={16} />
              {option.label}
            </DropdownOption>
          ))}
        </DropdownContainer>
      </FacetOrderDropdownWrapper>
    )
  );
};
