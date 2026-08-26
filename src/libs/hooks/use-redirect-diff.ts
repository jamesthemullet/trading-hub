import type { MerchandisingKeywordRedirect } from '@/libs/api';
import {
  createDiffItem,
  diffDate,
  type DiffItem,
  diffStringList,
} from '@/libs/hooks/utils/diff';

const diffTextField = (
  original: string | undefined,
  current: string | undefined,
  label: string
): DiffItem[] =>
  original === current
    ? []
    : [
        createDiffItem(
          'changed',
          label,
          `${original ?? 'none'} → ${current ?? 'none'}`
        ),
      ];

export const useRedirectDiff = (
  original: MerchandisingKeywordRedirect | undefined,
  current: MerchandisingKeywordRedirect
): DiffItem[] => {
  if (!original) return [];

  return [
    ...diffTextField(original.ruleTitle, current.ruleTitle, 'Title'),
    ...diffStringList(original.keywords, current.keywords, 'Keyword'),
    ...diffTextField(
      original.destinationUrl,
      current.destinationUrl,
      'Destination URL'
    ),
    ...diffTextField(original.type, current.type, 'Match type'),
    ...(original.isEnabled === current.isEnabled
      ? []
      : [
          createDiffItem(
            'changed',
            'Status',
            `${original.isEnabled ? 'Enabled' : 'Disabled'} → ${
              current.isEnabled ? 'Enabled' : 'Disabled'
            }`
          ),
        ]),
    ...diffTextField(original.countryCode, current.countryCode, 'Country'),
    ...diffDate(original.startDate, current.startDate, 'Start date'),
    ...diffDate(original.endDate, current.endDate, 'End date'),
  ];
};
