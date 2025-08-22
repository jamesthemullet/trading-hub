import type { ReactElement, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { MerchandisingCountryCode } from '@/libs/api';
import { useOnOutsideClick } from '@/libs/hooks';
import { track } from '@/libs/hooks/utils/analytics';
import type { FacetDisplayType } from '@/libs/modules/facets-panel/facets-panel-reducer';

import Image from 'next/image';

import {
  Arrow,
  ArrowContainer,
  DropdownButton,
  DropdownContainer,
  DropdownHeading,
  DropdownOption,
  DropdownWrapper,
  FlagWrapper,
  HeadingIcon,
  ImageWrapper,
} from './dropdown.styles';

type ClosingType = 'icon' | 'button' | 'esc' | 'outsideClick' | 'tab';

export type DropdownVariant =
  | 'generic'
  | 'countryFilter'
  | 'countrySelector'
  | 'facetOrder';

type GenericDropdownProps = {
  label?: string;
  icon?: string;
  children?: ReactNode;
  alignContentTowards?: 'left' | 'center' | 'right';
  ariaLabel?: string;
  onOpen?: () => void;
  onClose?: (closingType?: ClosingType) => void;
  closeFromChild?: boolean;
};

type CountryDropdownProps = {
  onChange?: (country?: MerchandisingCountryCode) => void;
  selectedCountryCode?: MerchandisingCountryCode;
};

type FacetOrderProps = {
  status?: FacetDisplayType;
  attribute?: string;
  hasAlgoControl?: boolean;
  onChange?: (status: FacetDisplayType) => void;
};

export type CombinedDropdownProps = {
  variant: DropdownVariant;
  width?: number;
  writeEnabled?: boolean;
} & GenericDropdownProps &
  CountryDropdownProps &
  FacetOrderProps;

export const CombinedDropdown = ({
  variant,
  width,
  writeEnabled = true,
  label = 'Select',
  alignContentTowards = 'left',
  icon,
  children,
  ariaLabel,
  onOpen,
  onClose,
  onChange,
  closeFromChild,
  selectedCountryCode,
  status,
  attribute,
  hasAlgoControl = false,
}: CombinedDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const closeDropdown = useCallback(
    (closingType?: ClosingType) => {
      setIsOpen(false);
      onClose?.(closingType);
    },
    [onClose]
  );

  useEffect(() => {
    if (closeFromChild) {
      closeDropdown();
    }
  }, [closeFromChild, closeDropdown]);

  const openDropdown = useCallback(() => {
    setIsOpen(true);
    onOpen?.();
  }, [onOpen]);

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && isOpen) {
      closeDropdown('esc');
    }
  };
  const handleButtonOnKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (isOpen && e.key === 'Tab' && e.shiftKey) {
      closeDropdown('esc');
    }
  };

  const wrapperRef = useOnOutsideClick<HTMLDivElement>({
    handler: () => closeDropdown('outsideClick'),
    shouldEnableOutsideClick: isOpen,
  });

  const [countryFilterOptions, setCountryFilterOptions] = useState([
    {
      index: 0,
      label: 'All marksandspencer.com',
      selected: true,
      countryCodeSelected: undefined,
      ariaLabel: 'select all marksandspencer.com',
    },
    {
      index: 1,
      label: 'UK only marksandspencer',
      selected: false,
      countryCodeSelected: 'UK' as MerchandisingCountryCode,
      ariaLabel: 'select UK marksandspencer.com',
    },
    {
      index: 2,
      label: 'IE only marksandspencer',
      selected: false,
      countryCodeSelected: 'IE' as MerchandisingCountryCode,
      ariaLabel: 'select IE marksandspencer.com',
    },
  ]);
  const handleCountryFilterSelect = (index: number) => {
    const updated = countryFilterOptions.map((option) => {
      if (option.index === index) {
        onChange?.(option.countryCodeSelected);
        return { ...option, selected: true };
      }
      return { ...option, selected: false };
    });
    track({
      event: `Change datatable filter to ${countryFilterOptions[index].label}`,
    });
    setCountryFilterOptions(updated);
    closeDropdown();
  };

  const createCountrySelectDropdownOptions = (
    index: number,
    label: string,
    selected: boolean,
    countryCode: MerchandisingCountryCode
  ) => ({
    index,
    label,
    selected,
    countryCode,
    ariaLabel: `select ${label}`,
    flagsToShow: countryCode === 'UK_IE' ? ['UK', 'IE'] : [countryCode],
  });

  const [countrySelectorOptions, setCountrySelectorOptions] = useState([
    createCountrySelectDropdownOptions(0, 'UK/IE Market', true, 'UK_IE'),
    createCountrySelectDropdownOptions(1, 'UK market only', false, 'UK'),
    createCountrySelectDropdownOptions(2, 'IE market only', false, 'IE'),
  ]);

  useEffect(() => {
    setCountrySelectorOptions((val) =>
      val.map((option) => ({
        ...option,
        selected: option.countryCode === selectedCountryCode,
      }))
    );
  }, [selectedCountryCode]);

  const handleCountrySelectorSelect = (index: number) => {
    const updated = countrySelectorOptions.map((option) => {
      if (option.index === index) {
        onChange?.(option.countryCode);
        return { ...option, selected: true };
      }
      return { ...option, selected: false };
    });
    setCountrySelectorOptions(updated);
    closeDropdown();
  };

  const [facetOptions, setFacetOptions] = useState([
    {
      index: 0,
      label: 'Select an action',
      name: 'select' as FacetDisplayType | 'select',
      src: null,
      selected: true,
      ariaLabel: `select${attribute ? ` ${attribute}` : ''}`,
    },
    {
      index: 1,
      label: 'Include only',
      name: 'included' as FacetDisplayType,
      src: '/trading-hub/asset/icon-include.svg',
      selected: false,
      ariaLabel: `include${attribute ? ` ${attribute}` : ''}`,
    },
    {
      index: 2,
      label: 'Algo control',
      name: 'algoControl' as FacetDisplayType,
      src: hasAlgoControl ? '/trading-hub/asset/icon-attribute.svg' : null,
      selected: false,
      ariaLabel: `algoControl${attribute ? ` ${attribute}` : ''}`,
    },
    {
      index: 3,
      label: 'Exclude only',
      name: 'excluded' as FacetDisplayType,
      src: '/trading-hub/asset/icon-exclude.svg',
      selected: false,
      ariaLabel: `exclude${attribute ? ` ${attribute}` : ''}`,
    },
  ]);

  const handleFacetOrderSelect = (index: number) => {
    const updated = facetOptions.map((option) => {
      if (option.index === index && option.name !== 'select') {
        onChange?.(option.name);
        return { ...option, selected: true };
      }
      return { ...option, selected: false };
    });
    setFacetOptions(updated);
    closeDropdown();
  };

  const dropdownHeading = useMemo<ReactElement | string>(() => {
    switch (variant) {
      case 'generic':
        return (
          <>
            {icon && (
              <ImageWrapper>
                <HeadingIcon src={`/trading-hub/asset/${icon}.svg`} alt="" />
              </ImageWrapper>
            )}
            {label}
          </>
        );
      case 'countryFilter': {
        const current = countryFilterOptions.find((o) => o.selected);
        // istanbul ignore next - there won't be a case where label is undefined but since we get current from find it has undefined type
        return current?.label || 'Select country filter';
      }
      case 'countrySelector': {
        const current = countrySelectorOptions.find((o) => o.selected);
        const label = current?.label || 'Select country';
        return (
          <>
            {current?.flagsToShow && (
              <FlagWrapper>
                {current.flagsToShow.map((flag) => (
                  <Image
                    key={flag}
                    src={`/trading-hub/asset/icon-${flag.toLowerCase()}-flag.svg`}
                    width={24}
                    height={24}
                    alt={flag}
                  />
                ))}
              </FlagWrapper>
            )}
            {label}
          </>
        );
      }
      case 'facetOrder': {
        const selectedByStatus = facetOptions.find((o) => o.name === status);
        const current =
          selectedByStatus || facetOptions.find((o) => o.selected);
        return (
          <>
            {current?.src && (
              <Image src={current.src} alt="" width={24} height={24} />
            )}
            {current?.label}
          </>
        );
      }
    }
  }, [
    variant,
    countryFilterOptions,
    countrySelectorOptions,
    facetOptions,
    status,
    label,
    icon,
  ]);

  const renderDropdownContent = () => {
    switch (variant) {
      case 'countryFilter':
        return countryFilterOptions.map((option) => (
          <DropdownOption
            key={option.label}
            hoverColour="#f5f5f5"
            aria-label={option.ariaLabel}
            onClick={() => handleCountryFilterSelect(option.index)}
          >
            {option.label}
          </DropdownOption>
        ));

      case 'countrySelector':
        return countrySelectorOptions.map((option) => (
          <DropdownOption
            key={option.label}
            hoverColour="#f5f5f5"
            aria-label={option.ariaLabel}
            onClick={() => handleCountrySelectorSelect(option.index)}
          >
            <ImageWrapper>
              {option.flagsToShow.map((flag) => (
                <Image
                  key={flag}
                  src={`/trading-hub/asset/icon-${flag.toLowerCase()}-flag.svg`}
                  width={24}
                  height={24}
                  alt={flag}
                />
              ))}
            </ImageWrapper>
            {option.label}
          </DropdownOption>
        ));

      case 'facetOrder':
        return facetOptions
          .filter((o) => o.src)
          .map((option) => (
            <DropdownOption
              key={option.label}
              hoverColour="#f5f5f5"
              aria-label={option.ariaLabel}
              onClick={() => handleFacetOrderSelect(option.index)}
            >
              <Image src={option.src as string} alt="" width={24} height={24} />
              {option.label}
            </DropdownOption>
          ));

      default:
        return children;
    }
  };

  const dropdownWidth = useMemo(() => {
    switch (variant) {
      case 'countryFilter':
        return 250;
      case 'countrySelector':
        return 220;
      case 'facetOrder':
        return 237;
      default:
        return width;
    }
  }, [variant, width]);

  const testId = useMemo(() => {
    switch (variant) {
      case 'countryFilter':
        return 'button to open country filter dropdown';
      case 'countrySelector':
        return 'button to open country selector dropdown';
      case 'facetOrder':
        return `button to open facet order dropdown${
          attribute ? ` for ${attribute}` : ''
        }`;
      default:
        return 'generic-dropdown';
    }
  }, [variant, attribute]);

  if (!writeEnabled) {
    const current =
      facetOptions.find((o) => o.name === status) ||
      // facetOptions.find makes it possible to have undefined type so added a fallback which would not happen
      // istanbul ignore next
      facetOptions[0];
    return (
      <DropdownWrapper
        isDropdownOpen={false}
        hasBorder={false}
        hasBorderBottom={false}
      >
        <DropdownHeading>
          {current?.src && (
            <Image src={current.src} alt="" width={24} height={24} />
          )}
          {current?.label}
        </DropdownHeading>
      </DropdownWrapper>
    );
  }

  return (
    <DropdownWrapper
      ref={wrapperRef}
      isDropdownOpen={isOpen}
      onKeyDown={handleOnKeyDown}
      hasBorder={variant === 'facetOrder'}
      width={dropdownWidth}
      alignContentTowards={variant === 'generic' ? 'center' : 'left'}
      height={variant === 'facetOrder' ? 'default' : 'large'}
    >
      <DropdownButton
        isDropdownOpen={isOpen}
        onKeyDown={handleButtonOnKeyDown}
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel ? ariaLabel : `${variant} dropdown`}
        disabled={!writeEnabled}
        data-testid={testId}
      >
        <DropdownHeading>{dropdownHeading}</DropdownHeading>

        {writeEnabled && (
          <ArrowContainer borderLeft={variant === 'facetOrder'}>
            <Arrow isDropdownOpen={isOpen} />
          </ArrowContainer>
        )}
      </DropdownButton>

      <DropdownContainer
        isDropdownOpen={isOpen}
        alignContentTowards={alignContentTowards}
      >
        {renderDropdownContent()}
      </DropdownContainer>
    </DropdownWrapper>
  );
};
