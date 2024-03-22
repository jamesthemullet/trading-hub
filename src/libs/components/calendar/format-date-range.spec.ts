import dayjs from 'dayjs';
import {
  formatMonthDayDateRange,
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
});
