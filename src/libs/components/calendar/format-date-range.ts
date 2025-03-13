import type { DatesRangeValue } from '@mantine/dates';

import dayjs from 'dayjs';

export const formatMonthYearDateRange = (range: DatesRangeValue) => {
  return range
    .map((date) => (date ? dayjs(date).format('MMM YYYY') : ''))
    .join(' - ');
};

export const formatMonthDayDateRange = (range: DatesRangeValue) => {
  return range
    .map((date) => (date ? dayjs(date).format('MMM DD') : ''))
    .join(' - ');
};

export const formatDateMonthYearTimeRange = (
  range: DatesRangeValue,
  startTime: string,
  endTime: string,
  hasNoEndDateMessage: boolean
) => {
  const dateFormat = 'DD/MM/YY';

  const startDate = range[0] ? dayjs(range[0]) : null;
  const endDate = range[1] ? dayjs(range[1]) : null;

  if (!startDate) {
    return '';
  }
  if (endDate) {
    return `${startDate?.format(dateFormat)} ${startTime} - ${endDate?.format(dateFormat)} ${endTime}`;
  }

  return `${startDate?.format(dateFormat)} ${startTime}${hasNoEndDateMessage ? ' - No end date' : ''}`;
};

export const formatMonthDayDateTimeRange = (
  range: DatesRangeValue,
  startTime?: string,
  endTime?: string
) => {
  const dateFormat = 'MMM DD YYYY';

  const startDate = range[0] ? dayjs(range[0]) : null;
  const endDate = range[1] ? dayjs(range[1]) : null;

  if (!startDate) {
    return '';
  }
  if (endDate) {
    return `${startDate.format(dateFormat)}${startTime ? ` ${startTime}` : ''} - ${endDate?.format(dateFormat)}${endTime ? ` ${endTime}` : ''}`;
  }

  return `${startDate.format(dateFormat)} ${startTime || ''}`;
};
