import dayjs from 'dayjs';

import {
  formatDateMonthYearTimeRange,
  formatMonthDayDateRange,
  formatMonthDayDateTimeRange,
  formatMonthYearDateRange,
} from './format-date-range';

describe('format-date-range', () => {
  describe('formatMonthYearDateRange', () => {
    it('should return formatted date range', () => {
      const range: [Date, Date] = [
        dayjs('2021-01-01').toDate(),
        dayjs('2021-01-31').toDate(),
      ];
      expect(formatMonthYearDateRange(range)).toEqual('Jan 2021 - Jan 2021');
    });

    it('should return formatted date range with null value', () => {
      const range: [Date, null] = [dayjs('2021-01-01').toDate(), null];
      expect(formatMonthYearDateRange(range)).toEqual('Jan 2021 - ');
    });
  });

  describe('formatMonthDayDateRange', () => {
    it('should return formatted date range', () => {
      const range: [Date, Date] = [
        dayjs('2021-01-01').toDate(),
        dayjs('2021-01-31').toDate(),
      ];
      expect(formatMonthDayDateRange(range)).toEqual('Jan 01 - Jan 31');
    });

    it('should return formatted date range with null value', () => {
      const range: [Date, null] = [dayjs('2021-01-01').toDate(), null];
      expect(formatMonthDayDateRange(range)).toEqual('Jan 01 - ');
    });
  });

  describe('formatMonthDayDateTimeRange', () => {
    it('should return formatted date and time range', () => {
      const range: [Date, Date] = [
        dayjs('2021-01-01').toDate(),
        dayjs('2021-01-31').toDate(),
      ];
      expect(formatMonthDayDateTimeRange(range, '12:00', '14:00')).toEqual(
        'Jan 01 2021 12:00 - Jan 31 2021 14:00'
      );
    });

    it('should return formatted date and time range without end time', () => {
      const range: [Date, Date] = [
        dayjs('2021-01-01').toDate(),
        dayjs('2021-01-31').toDate(),
      ];
      expect(formatMonthDayDateTimeRange(range, '12:00')).toEqual(
        'Jan 01 2021 12:00 - Jan 31 2021'
      );
    });

    it('should return formatted date and time range without start time', () => {
      const range: [Date, Date] = [
        dayjs('2021-01-01').toDate(),
        dayjs('2021-01-31').toDate(),
      ];
      expect(formatMonthDayDateTimeRange(range, undefined, '12:00')).toEqual(
        'Jan 01 2021 - Jan 31 2021 12:00'
      );
    });

    it('should return formatted date range with null value', () => {
      const range: [Date, null] = [dayjs('2021-01-01').toDate(), null];
      expect(formatMonthDayDateTimeRange(range)).toEqual('Jan 01 2021 ');
    });

    it('should return formatted date time range with null value', () => {
      const range: [Date, null] = [dayjs('2021-01-01').toDate(), null];
      expect(formatMonthDayDateTimeRange(range, '12:00')).toEqual(
        'Jan 01 2021 12:00'
      );
    });

    it('should return empty string with null value', () => {
      const range: [null, null] = [null, null];
      expect(formatMonthDayDateTimeRange(range)).toEqual('');
    });
  });

  describe('formatDateMonthYearTimeRange', () => {
    it('should return formatted date and time range for date picker dropdown', () => {
      const range: [Date, Date] = [
        dayjs('2021-01-01').toDate(),
        dayjs('2021-01-31').toDate(),
      ];
      expect(formatDateMonthYearTimeRange(range, '12:00', '14:00')).toEqual(
        '01/01/21 12:00 - 31/01/21 14:00'
      );
    });

    it('should return formatted date range with null value', () => {
      const range: [Date, null] = [dayjs('2021-01-01').toDate(), null];
      expect(formatDateMonthYearTimeRange(range, '12:00', '14:00')).toEqual(
        '01/01/21 12:00'
      );
    });

    it('should return formatted date time range with null value', () => {
      const range: [Date, null] = [dayjs('2021-01-01').toDate(), null];
      expect(formatDateMonthYearTimeRange(range, '12:00', '14:00')).toEqual(
        '01/01/21 12:00'
      );
    });

    it('should return empty string with null value', () => {
      const range: [null, null] = [null, null];
      expect(formatDateMonthYearTimeRange(range, '12:00', '14:00')).toEqual('');
    });
  });
});
