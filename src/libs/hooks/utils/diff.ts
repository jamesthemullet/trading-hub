import { format, isValid, parseISO } from 'date-fns';

export type DiffItem = {
  type: 'added' | 'removed' | 'changed';
  label: string;
  description: string;
};

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
