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
  boosted: Map<string, number>,
  excluded: Set<string>
): FacetValueStatus => {
  if (boosted.has(value)) return 'Include only';
  if (excluded.has(value)) return 'Exclude only';
  return 'Algo control';
};

const firstIndexByValue = (values: string[]): Map<string, number> =>
  // Reversing entries preserves indexOf's first-match behavior for duplicates.
  new Map(
    values.map((value, index): [string, number] => [value, index]).reverse()
  );

export const diffFacetValues = (
  originalBoosted: string[],
  currentBoosted: string[],
  originalExcluded: string[],
  currentExcluded: string[]
): DiffItem[] => {
  const originalBoostedIndex = firstIndexByValue(originalBoosted);
  const currentBoostedIndex = firstIndexByValue(currentBoosted);
  const originalExcludedSet = new Set(originalExcluded);
  const currentExcludedSet = new Set(currentExcluded);
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
      originalBoostedIndex,
      originalExcludedSet
    );
    const currStatus = getFacetValueStatus(
      value,
      currentBoostedIndex,
      currentExcludedSet
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
    const origIndex = originalBoostedIndex.get(value);
    const currIndex = currentBoostedIndex.get(value);

    if (origIndex === undefined || currIndex === undefined) {
      return [];
    }

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
