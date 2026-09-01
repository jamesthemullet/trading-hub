import type { MerchandisingCountryCode } from '@/libs/api';
import type { RuleTypeFilter } from '@/libs/components/types';

export enum DropdownVariant {
  Generic = 'generic',
  CountryFilter = 'countryFilter',
  CountrySelector = 'countrySelector',
  FacetOrder = 'facetOrder',
  PageSize = 'pageSize',
  RuleTypeFilter = 'ruleTypeFilter',
}

type RuleTypeFilterOption = {
  index: number;
  label: string;
  selected: boolean;
  value: RuleTypeFilter | undefined;
  ariaLabel: string;
};

export const COUNTRY_FILTER_OPTIONS = [
  {
    index: 0,
    label: 'All marksandspencer.com',
    countryCode: undefined as MerchandisingCountryCode | undefined,
    ariaLabel: 'select all marksandspencer.com',
  },
  {
    index: 1,
    label: 'UK only marksandspencer',
    countryCode: 'UK' as MerchandisingCountryCode,
    ariaLabel: 'select UK marksandspencer.com',
  },
  {
    index: 2,
    label: 'IE only marksandspencer',
    countryCode: 'IE' as MerchandisingCountryCode,
    ariaLabel: 'select IE marksandspencer.com',
  },
];

export const COUNTRY_SELECTOR_OPTIONS = [
  {
    index: 0,
    label: 'UK/IE Market',
    countryCode: 'UK_IE' as MerchandisingCountryCode,
    flagsToShow: ['UK', 'IE'],
  },
  {
    index: 1,
    label: 'UK market only',
    countryCode: 'UK' as MerchandisingCountryCode,
    flagsToShow: ['UK'],
  },
  {
    index: 2,
    label: 'IE market only',
    countryCode: 'IE' as MerchandisingCountryCode,
    flagsToShow: ['IE'],
  },
];

export const RULE_TYPE_FILTER_OPTIONS: RuleTypeFilterOption[] = [
  {
    index: 0,
    label: 'All rule types',
    selected: true,
    value: undefined,
    ariaLabel: 'show all rule types',
  },
  {
    index: 1,
    label: 'Ranking rules',
    selected: false,
    value: 'RANKING',
    ariaLabel: 'show rule types with ranking rules',
  },
  {
    index: 2,
    label: 'Facet rules',
    selected: false,
    value: 'FACET',
    ariaLabel: 'show rule types with facet rules',
  },
];

export const VARIANT_WIDTHS: Partial<Record<DropdownVariant, number>> = {
  [DropdownVariant.CountryFilter]: 250,
  [DropdownVariant.CountrySelector]: 220,
  [DropdownVariant.FacetOrder]: 237,
  [DropdownVariant.RuleTypeFilter]: 170,
};

export const VARIANT_HEIGHTS: Partial<Record<DropdownVariant, string>> = {
  [DropdownVariant.FacetOrder]: 'default',
  [DropdownVariant.PageSize]: 'page-size',
};

export const VARIANT_TEST_IDS: Partial<Record<DropdownVariant, string>> = {
  [DropdownVariant.CountryFilter]: 'button to open country filter dropdown',
  [DropdownVariant.CountrySelector]: 'button to open country selector dropdown',
  [DropdownVariant.RuleTypeFilter]: 'button to open rule type filter dropdown',
};

export const getSelectedRuleTypeFilterOption = (
  options: RuleTypeFilterOption[]
): RuleTypeFilterOption | undefined =>
  options.find((option) => option.selected) ?? options[0];
