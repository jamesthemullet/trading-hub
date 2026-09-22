import type { ReactElement, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { MerchandisingCountryCode } from '@/libs/api';
import type { RuleTypeFilter } from '@/libs/components/types';
import { useOnOutsideClick } from '@/libs/hooks';
import { track } from '@/libs/hooks/utils/analytics';
import type { FacetDisplayType } from '@/types/facets';

import Image from 'next/image';

import { Button } from '../button/button';
import { Typography } from '../typography/typography';
import {
  COUNTRY_FILTER_OPTIONS,
  COUNTRY_SELECTOR_OPTIONS,
  DropdownVariant,
  RULE_TYPE_FILTER_OPTIONS,
  VARIANT_HEIGHTS,
  VARIANT_TEST_IDS,
  VARIANT_WIDTHS,
} from './dropdown.constants';
import styles from './dropdown.module.css';

export {
  DropdownVariant,
  getSelectedRuleTypeFilterOption,
} from './dropdown.constants';

type ClosingType = 'icon' | 'button' | 'esc' | 'outsideClick' | 'tab';

type GenericDropdownProps = {
  label?: string;
  icon?: string;
  children?: ReactNode;
  ariaLabel?: string;
  onOpen?: () => void;
  onClose?: (closingType?: ClosingType) => void;
  shouldCloseFromChild?: boolean;
};

type CountryDropdownProps = {
  onChange?: (country?: MerchandisingCountryCode) => void;
  selectedCountryCode?: MerchandisingCountryCode;
  countrySelectorOptions?: typeof COUNTRY_SELECTOR_OPTIONS;
};

type FacetOrderProps = {
  status?: FacetDisplayType;
  attribute?: string;
  hasAlgoControl?: boolean;
  onChange?: (status: FacetDisplayType) => void;
};

type PageSizeProps = {
  pageSizes?: number[];
  currentPage?: number;
  currentPageSize?: number;
  totalItems?: number;
  onPageSizeChange?: (page: number, pageSize: number) => void;
};

type RuleTypeFilterProps = {
  onRuleTypeChange?: (ruleType?: RuleTypeFilter) => void;
};

type CombinedDropdownProps = {
  variant: DropdownVariant;
  width?: number;
  isWriteEnabled?: boolean;
} & GenericDropdownProps &
  CountryDropdownProps &
  FacetOrderProps &
  PageSizeProps &
  RuleTypeFilterProps;

type DropdownOptionButtonProps = {
  ariaLabel?: string;
  onClick: () => void;
  role?: string;
  isAriaChecked?: boolean;
  isAriaSelected?: boolean;
  children: ReactNode;
};

const DropdownOptionButton = ({
  ariaLabel,
  onClick,
  role = 'menuitemradio',
  isAriaChecked,
  isAriaSelected,
  children,
}: DropdownOptionButtonProps) => (
  <Button
    type="button"
    className={styles.dropdownOption}
    data-hover-grey
    aria-label={ariaLabel}
    onClick={onClick}
    role={role}
    aria-checked={isAriaChecked}
    aria-selected={isAriaSelected}
  >
    {children}
  </Button>
);

export const CombinedDropdown = ({
  variant,
  width,
  isWriteEnabled = true,
  label = 'Select',
  icon,
  children,
  ariaLabel,
  onOpen,
  onClose,
  onChange,
  shouldCloseFromChild,
  selectedCountryCode,
  countrySelectorOptions = COUNTRY_SELECTOR_OPTIONS,
  status,
  attribute,
  hasAlgoControl = false,
  pageSizes,
  currentPage,
  currentPageSize,
  totalItems,
  onPageSizeChange,
  onRuleTypeChange,
}: CombinedDropdownProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);

  const closeDropdown = useCallback(
    (closingType?: ClosingType) => {
      setIsOpen(false);
      onClose?.(closingType);
    },
    [onClose]
  );

  useEffect(() => {
    if (shouldCloseFromChild) {
      closeDropdown();
    }
  }, [shouldCloseFromChild, closeDropdown]);

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

  const [selectedCountryFilterIndex, setSelectedCountryFilterIndex] =
    useState(0);

  const handleCountryFilterSelect = (index: number) => {
    setSelectedCountryFilterIndex(index);
    onChange?.(COUNTRY_FILTER_OPTIONS[index].countryCode);
    track({
      event: `Change datatable filter to ${COUNTRY_FILTER_OPTIONS[index].label}`,
    });
    closeDropdown();
  };

  const [selectedRuleTypeIndex, setSelectedRuleTypeIndex] = useState(0);

  const handleRuleTypeFilterSelect = (index: number) => {
    setSelectedRuleTypeIndex(index);
    onRuleTypeChange?.(RULE_TYPE_FILTER_OPTIONS[index].value);
    track({
      event: `Change rule type filter to ${RULE_TYPE_FILTER_OPTIONS[index].label}`,
    });
    closeDropdown();
  };

  const handleCountrySelectorSelect = (index: number) => {
    onChange?.(countrySelectorOptions[index].countryCode);
    closeDropdown();
  };

  const facetOptions = useMemo<
    {
      index: number;
      label: string;
      name: FacetDisplayType | 'select';
      src: string | null;
      ariaLabel: string;
    }[]
  >(
    () => [
      {
        index: 0,
        label: 'Select an action',
        name: 'select',
        src: null,
        ariaLabel: `select${attribute ? ` ${attribute}` : ''}`,
      },
      {
        index: 1,
        label: 'Include only',
        name: 'included',
        src: '/trading-hub/asset/icon-include.svg',
        ariaLabel: `include${attribute ? ` ${attribute}` : ''}`,
      },
      {
        index: 2,
        label: 'Algo control',
        name: 'algoControl',
        src: hasAlgoControl ? '/trading-hub/asset/icon-attribute.svg' : null,
        ariaLabel: `algoControl${attribute ? ` ${attribute}` : ''}`,
      },
      {
        index: 3,
        label: 'Exclude only',
        name: 'excluded',
        src: '/trading-hub/asset/icon-exclude.svg',
        ariaLabel: `exclude${attribute ? ` ${attribute}` : ''}`,
      },
    ],
    [hasAlgoControl, attribute]
  );

  const [selectedFacetName, setSelectedFacetName] = useState<
    FacetDisplayType | 'select'
  >('select');

  const handleFacetOrderSelect = (index: number) => {
    const option = facetOptions[index];
    // istanbul ignore next - 'select' options have no src and are filtered out before being rendered as buttons
    if (option.name === 'select') return;
    onChange?.(option.name);
    setSelectedFacetName(option.name);
    closeDropdown();
  };

  const { dropdownHeading, headingText } = useMemo(() => {
    switch (variant) {
      case DropdownVariant.Generic:
        return {
          headingText: label,
          dropdownHeading: (
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
          ),
        };
      case DropdownVariant.PageSize:
        return { headingText: label, dropdownHeading: label };
      case DropdownVariant.CountryFilter: {
        const current = COUNTRY_FILTER_OPTIONS[selectedCountryFilterIndex];
        // istanbul ignore next - there won't be a case where label is undefined but since we get current from find it has undefined type
        const text = current?.label || 'Select country filter';
        return {
          headingText: text,
          dropdownHeading: <Typography variant="bodySmall">{text}</Typography>,
        };
      }
      case DropdownVariant.CountrySelector: {
        const current =
          countrySelectorOptions.find(
            (o) => o.countryCode === selectedCountryCode
          ) || countrySelectorOptions[0];
        return {
          headingText: current.label,
          dropdownHeading: (
            <>
              <span className={styles.flagContainer}>
                {current.flagsToShow.map((flag) => (
                  <Image
                    key={flag}
                    src={`/trading-hub/asset/icon-${flag.toLowerCase()}-flag.svg`}
                    width={24}
                    height={24}
                    alt=""
                  />
                ))}
              </span>
              <Typography variant="bodySmall">{current.label}</Typography>
            </>
          ),
        };
      }
      case DropdownVariant.FacetOrder: {
        const current =
          facetOptions.find((o) => o.name === status) ||
          facetOptions.find((o) => o.name === selectedFacetName);
        return {
          headingText: current?.label,
          dropdownHeading: (
            <>
              {current?.src && (
                <Image src={current.src} alt="" width={24} height={24} />
              )}
              <Typography variant="bodySmall">{current?.label}</Typography>
            </>
          ),
        };
      }
      case DropdownVariant.RuleTypeFilter: {
        const current = RULE_TYPE_FILTER_OPTIONS[selectedRuleTypeIndex];
        return {
          headingText: current.label,
          dropdownHeading: (
            <Typography variant="bodySmall">{current.label}</Typography>
          ),
        };
      }
    }
  }, [
    variant,
    selectedCountryFilterIndex,
    selectedCountryCode,
    countrySelectorOptions,
    facetOptions,
    status,
    selectedFacetName,
    selectedRuleTypeIndex,
    label,
    icon,
  ]);

  const renderDropdownContent = () => {
    switch (variant) {
      case DropdownVariant.CountryFilter:
        return COUNTRY_FILTER_OPTIONS.map((option) => (
          <DropdownOptionButton
            key={option.label}
            onClick={() => handleCountryFilterSelect(option.index)}
            isAriaChecked={option.index === selectedCountryFilterIndex}
          >
            <Typography as="span" variant="bodySmall">
              {option.label}
            </Typography>
          </DropdownOptionButton>
        ));

      case DropdownVariant.CountrySelector:
        return countrySelectorOptions.map((option) => (
          <DropdownOptionButton
            key={option.label}
            onClick={() => handleCountrySelectorSelect(option.index)}
            isAriaChecked={option.countryCode === selectedCountryCode}
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
          </DropdownOptionButton>
        ));

      case DropdownVariant.FacetOrder:
        return facetOptions
          .filter((o) => o.src)
          .map((option) => (
            <DropdownOptionButton
              key={option.label}
              onClick={() => handleFacetOrderSelect(option.index)}
              isAriaChecked={option.name === selectedFacetName}
            >
              <Image src={option.src as string} alt="" width={24} height={24} />
              <Typography as="span" variant="bodySmall">
                {option.label}
              </Typography>
            </DropdownOptionButton>
          ));

      case DropdownVariant.PageSize:
        return pageSizes?.map((size) => (
          <DropdownOptionButton
            key={size}
            onClick={() => {
              if (
                currentPage &&
                currentPage * size > Math.ceil(totalItems ?? 0 / size)
              ) {
                onPageSizeChange?.(1, size);
              } else if (currentPage !== undefined) {
                onPageSizeChange?.(currentPage, size);
              }
              closeDropdown();
            }}
            isAriaChecked={currentPageSize === size}
          >
            <Typography as="span" variant="bodySmall">
              {size}
            </Typography>
          </DropdownOptionButton>
        ));

      case DropdownVariant.RuleTypeFilter:
        return RULE_TYPE_FILTER_OPTIONS.map((option) => (
          <DropdownOptionButton
            key={option.label}
            onClick={() => handleRuleTypeFilterSelect(option.index)}
            isAriaChecked={option.index === selectedRuleTypeIndex}
          >
            <Typography as="span" variant="bodySmall">
              {option.label}
            </Typography>
          </DropdownOptionButton>
        ));

      default:
        return children;
    }
  };

  const dropdownWidth = VARIANT_WIDTHS[variant] ?? width;

  const testId =
    variant === DropdownVariant.FacetOrder
      ? `button to open facet order dropdown${attribute ? ` for ${attribute}` : ''}`
      : (VARIANT_TEST_IDS[variant] ?? 'generic-dropdown');

  const buttonId =
    `dropdown-button-${variant}${attribute ? `-${attribute}` : ''}`.replace(
      /[^a-zA-Z0-9-_]/g,
      '-'
    );

  if (!isWriteEnabled && variant === DropdownVariant.FacetOrder) {
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

  const dataHeight = VARIANT_HEIGHTS[variant] ?? 'large';

  const buttonAriaLabel = (() => {
    if (!ariaLabel) return `select ${headingText || variant}`;
    if (!headingText || ariaLabel.includes(headingText)) return ariaLabel;
    return `${ariaLabel} - currently ${headingText}`;
  })();

  return (
    <div
      className={styles.dropdownWrapper}
      ref={wrapperRef}
      data-is-dropdown-open={isOpen}
      data-width={dropdownWidth}
      data-variant={
        variant === DropdownVariant.PageSize ? 'page-size' : undefined
      }
      data-has-border={variant === DropdownVariant.FacetOrder}
      data-has-border-bottom={
        variant !== DropdownVariant.FacetOrder &&
        variant !== DropdownVariant.PageSize
      }
      data-height={dataHeight}
    >
      <Button
        className={styles.dropdownButton}
        type="button"
        onKeyDown={handleOnKeyDown}
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={buttonAriaLabel}
        data-testid={testId}
        id={buttonId}
      >
        <div className={styles.dropdownHeading}>{dropdownHeading}</div>

        <div
          className={styles.arrowContainer}
          data-border-left={variant === DropdownVariant.FacetOrder}
        >
          <span className={styles.arrow} data-is-dropdown-open={isOpen} />
        </div>
      </Button>

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
