import { format, isValid, parseISO } from 'date-fns';

export type DiffItem = {
  type: 'added' | 'removed' | 'changed';
  label: string;
  description: string;
};

type FacetValueStatus = 'Include only' | 'Exclude only' | 'Algo control';

export const createDiffItem = (
  type: DiffItem['type'],
  label: string,
  description: string
): DiffItem => ({ type, label, description });

export const diffStringList = (
  original: string[],
  current: string[],
  label: string
): DiffItem[] => [
  ...current
    .filter((value) => !original.includes(value))
    .map((value) => createDiffItem('added', label, value)),
  ...original
    .filter((value) => !current.includes(value))
    .map((value) => createDiffItem('removed', label, value)),
];

export const formatDateForDiff = (date: string | undefined): string => {
  if (!date) return 'none';
  const parsedDate = parseISO(date);
  if (!isValid(parsedDate)) return 'none';

  return format(parsedDate, 'dd/MM/yyyy HH:mm');
};

const getFacetValueStatus = (
  value: string,
  boosted: string[],
  excluded: string[]
): FacetValueStatus => {
  if (boosted.includes(value)) return 'Include only';
  if (excluded.includes(value)) return 'Exclude only';
  return 'Algo control';
};

export const diffFacetValues = (
  originalBoosted: string[],
  currentBoosted: string[],
  originalExcluded: string[],
  currentExcluded: string[]
): DiffItem[] => {
  const allValues = [
    ...new Set([
      ...originalBoosted,
      ...currentBoosted,
      ...originalExcluded,
      ...currentExcluded,
    ]),
  ];

  const statusDiffItems = allValues.flatMap<DiffItem>((value) => {
    const origStatus = getFacetValueStatus(
      value,
      originalBoosted,
      originalExcluded
    );
    const currStatus = getFacetValueStatus(
      value,
      currentBoosted,
      currentExcluded
    );

    if (origStatus !== currStatus) {
      return [
        createDiffItem(
          'changed',
          currStatus,
          `${value} (${origStatus} → ${currStatus})`
        ),
      ];
    }

    return [];
  });

  const orderChanges = allValues.flatMap<{
    value: string;
    origIndex: number;
    currIndex: number;
  }>((value) => {
    const origStatus = getFacetValueStatus(
      value,
      originalBoosted,
      originalExcluded
    );
    const currStatus = getFacetValueStatus(
      value,
      currentBoosted,
      currentExcluded
    );

    if (origStatus !== 'Include only' || currStatus !== 'Include only') {
      return [];
    }

    const origIndex = originalBoosted.indexOf(value);
    const currIndex = currentBoosted.indexOf(value);

    if (origIndex === currIndex) return [];

    return [{ value, origIndex, currIndex }];
  });

  const orderDiffItems = orderChanges.map(({ value, origIndex, currIndex }) => {
    const direction = currIndex < origIndex ? 'up' : 'down';
    return createDiffItem(
      'changed',
      `Value order ${direction}`,
      `${value}: position ${origIndex + 1} → ${currIndex + 1}`
    );
  });

  return [...statusDiffItems, ...orderDiffItems];
};

export const diffDate = (
  original: string | undefined,
  current: string | undefined,
  label: string
): DiffItem[] => {
  if (original === current) return [];

  return [
    createDiffItem(
      'changed',
      label,
      `${formatDateForDiff(original)} → ${formatDateForDiff(current)}`
    ),
  ];
};
