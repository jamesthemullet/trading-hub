import { DatesRangeValue } from '@mantine/dates';

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
