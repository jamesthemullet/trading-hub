import type { ReactElement, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { MerchandisingCountryCode } from '@/libs/api';
import { useOnOutsideClick } from '@/libs/hooks';
import { track } from '@/libs/hooks/utils/analytics';
import type { FacetDisplayType } from '@/libs/stores/facets-panel/facets-panel-reducer';

import Image from 'next/image';

import { Typography } from '../typography/typography';
import styles from './dropdown.module.css';

type ClosingType = 'icon' | 'button' | 'esc' | 'outsideClick' | 'tab';

type DropdownVariant =
  | 'generic'
  | 'countryFilter'
  | 'countrySelector'
  | 'facetOrder'
  | 'pageSize';

type GenericDropdownProps = {
  label?: string;
  icon?: string;
  children?: ReactNode;
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

type CombinedDropdownProps = {
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

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (isOpen && e.key === 'Escape') {
      closeDropdown('esc');
    }
    if (isOpen && e.key === 'Tab' && e.shiftKey) {
      closeDropdown('tab');
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
              <Image
                className={styles.headingIcon}
                src={`/trading-hub/asset/${icon}.svg`}
                alt=""
                width={20}
                height={20}
              />
            )}
            <Typography variant="bodySmall">{label}</Typography>
          </>
        );
      case 'pageSize':
        return label;
      case 'countryFilter': {
        const current = countryFilterOptions.find((o) => o.selected);
        // istanbul ignore next - there won't be a case where label is undefined but since we get current from find it has undefined type
        return (
          <Typography variant="bodySmall">
            {current?.label || 'Select country filter'}
          </Typography>
        );
      }
      case 'countrySelector': {
        const current = countrySelectorOptions.find((o) => o.selected);
        const label = current?.label || 'Select country';
        return (
          <>
            <span className={styles.flagContainer}>
              {current?.flagsToShow?.map((flag) => (
                <Image
                  key={flag}
                  src={`/trading-hub/asset/icon-${flag.toLowerCase()}-flag.svg`}
                  width={24}
                  height={24}
                  alt=""
                />
              ))}
            </span>
            <Typography variant="bodySmall">{label}</Typography>
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
            <Typography variant="bodySmall">{current?.label}</Typography>
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
          <button
            type="button"
            className={styles.dropdownOption}
            key={option.label}
            data-hover-grey
            aria-label={option.ariaLabel}
            onClick={() => handleCountryFilterSelect(option.index)}
            role="menuitemradio"
            aria-checked={option.selected}
          >
            <Typography as="span" variant="bodySmall">
              {option.label}
            </Typography>
          </button>
        ));

      case 'countrySelector':
        return countrySelectorOptions.map((option) => (
          <button
            type="button"
            className={styles.dropdownOption}
            key={option.label}
            data-hover-grey
            onClick={() => handleCountrySelectorSelect(option.index)}
            role="menuitemradio"
            aria-checked={option.selected}
          >
            {option.flagsToShow.map((flag) => (
              <Image
                key={flag}
                src={`/trading-hub/asset/icon-${flag.toLowerCase()}-flag.svg`}
                width={24}
                height={24}
                alt=""
              />
            ))}
            <Typography as="span" variant="bodySmall">
              {option.label}
            </Typography>
          </button>
        ));

      case 'facetOrder':
        return facetOptions
          .filter((o) => o.src)
          .map((option) => (
            <button
              type="button"
              className={styles.dropdownOption}
              key={option.label}
              data-hover-grey
              onClick={() => handleFacetOrderSelect(option.index)}
              role="menuitemradio"
              aria-checked={option.selected}
            >
              <Image src={option.src as string} alt="" width={24} height={24} />
              <Typography as="span" variant="bodySmall">
                {option.label}
              </Typography>
            </button>
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

  const buttonId = useMemo(() => {
    const raw = `dropdown-button-${variant}${attribute ? `-${attribute}` : ''}`;
    return raw.replace(/[^a-zA-Z0-9-_]/g, '-');
  }, [variant, attribute]);

  if (!writeEnabled && variant === 'facetOrder') {
    const current =
      facetOptions.find((o) => o.name === status) ||
      // facetOptions.find makes it possible to have undefined type so added a fallback which would not happen
      // istanbul ignore next
      facetOptions[0];
    return (
      <div
        className={styles.dropdownWrapper}
        data-is-dropdown-open={false}
        data-has-border={false}
        data-has-border-bottom={false}
      >
        <div className={styles.dropdownHeading}>
          {current?.src && (
            <Image src={current.src} alt="" width={24} height={24} />
          )}
          {current?.label}
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.dropdownWrapper}
      ref={wrapperRef}
      data-is-dropdown-open={isOpen}
      data-width={dropdownWidth}
      data-has-border={variant === 'facetOrder'}
      data-has-border-bottom={
        variant !== 'facetOrder' && variant !== 'pageSize'
      }
      data-height={
        variant === 'facetOrder' || variant === 'pageSize' ? 'default' : 'large'
      }
    >
      <button
        className={styles.dropdownButton}
        type="button"
        onKeyDown={handleOnKeyDown}
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={ariaLabel ? ariaLabel : `${variant} dropdown`}
        data-testid={testId}
        id={buttonId}
      >
        {dropdownHeading}

        <div
          className={styles.arrowContainer}
          data-border-left={variant === 'facetOrder'}
        >
          <span className={styles.arrow} data-is-dropdown-open={isOpen} />
        </div>
      </button>

      <div
        className={styles.dropdownContentContainer}
        data-is-dropdown-open={isOpen}
        role="menu"
        aria-labelledby={buttonId}
      >
        {renderDropdownContent()}
      </div>
    </div>
  );
};
