import {
  createDiffItem,
  diffDate,
  diffStringList,
  formatDateForDiff,
} from './diff';

describe('diff utils', () => {
  describe('createDiffItem', () => {
    it('creates a diff item', () => {
      expect(createDiffItem('added', 'Keyword', 'jeans')).toEqual({
        type: 'added',
        label: 'Keyword',
        description: 'jeans',
      });
    });
  });

  describe('diffStringList', () => {
    it('returns added and removed values', () => {
      expect(diffStringList(['a', 'b'], ['b', 'c'], 'Keyword')).toEqual([
        { type: 'added', label: 'Keyword', description: 'c' },
        { type: 'removed', label: 'Keyword', description: 'a' },
      ]);
    });

    it('returns an empty list when unchanged', () => {
      expect(diffStringList(['a', 'b'], ['a', 'b'], 'Keyword')).toEqual([]);
    });
  });

  describe('formatDateForDiff', () => {
    it('returns none when date is undefined', () => {
      expect(formatDateForDiff(undefined)).toBe('none');
    });

    it('returns none when date is invalid', () => {
      expect(formatDateForDiff('not-a-date')).toBe('none');
    });

    it('formats a valid date', () => {
      expect(formatDateForDiff('2024-06-01T00:00:00.000Z')).toBe(
        '01/06/2024 00:00'
      );
    });
  });

  describe('diffDate', () => {
    it('returns empty list when unchanged', () => {
      expect(
        diffDate(
          '2024-06-01T00:00:00.000Z',
          '2024-06-01T00:00:00.000Z',
          'Start date'
        )
      ).toEqual([]);
    });

    it('returns a changed diff item when changed', () => {
      expect(
        diffDate(undefined, '2024-06-01T00:00:00.000Z', 'Start date')
      ).toEqual([
        {
          type: 'changed',
          label: 'Start date',
          description: 'none → 01/06/2024 00:00',
        },
      ]);
    });
  });
});
