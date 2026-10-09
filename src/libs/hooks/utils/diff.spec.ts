import {
  createDiffItem,
  diffDate,
  diffFacetValues,
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

  describe('diffFacetValues', () => {
    it('preserves first positions for duplicate values without changing inputs', () => {
      const original = ['red', 'blue', 'red'];
      const current = ['blue', 'red', 'blue'];

      expect(diffFacetValues(original, current, [], [])).toEqual([
        {
          type: 'changed',
          label: 'Value order down',
          description: 'red: position 1 → 2',
        },
        {
          type: 'changed',
          label: 'Value order up',
          description: 'blue: position 2 → 1',
        },
      ]);
      expect(original).toEqual(['red', 'blue', 'red']);
      expect(current).toEqual(['blue', 'red', 'blue']);
    });

    it('prioritises included values and reports status changes before moves', () => {
      expect(
        diffFacetValues(
          ['red', 'blue'],
          ['blue', 'red', 'green'],
          ['red', 'green'],
          ['blue']
        )
      ).toEqual([
        {
          type: 'changed',
          label: 'Include only',
          description: 'green (Exclude only → Include only)',
        },
        {
          type: 'changed',
          label: 'Value order down',
          description: 'red: position 1 → 2',
        },
        {
          type: 'changed',
          label: 'Value order up',
          description: 'blue: position 2 → 1',
        },
      ]);
    });

    it('handles large reordered lists without per-value array scans', () => {
      const original = Array.from(
        { length: 5000 },
        (_, index) => `value-${index}`
      );
      const current = [...original].reverse();
      const originalExcluded = ['excluded'];
      const currentExcluded = ['excluded'];
      const scanSpies = [
        original,
        current,
        originalExcluded,
        currentExcluded,
      ].flatMap((values) => [
        jest.spyOn(values, 'includes'),
        jest.spyOn(values, 'indexOf'),
      ]);

      try {
        const changes = diffFacetValues(
          original,
          current,
          originalExcluded,
          currentExcluded
        );

        expect(changes).toHaveLength(5000);
        expect(changes[0]).toEqual({
          type: 'changed',
          label: 'Value order down',
          description: 'value-0: position 1 → 5000',
        });
        expect(changes[4999]).toEqual({
          type: 'changed',
          label: 'Value order up',
          description: 'value-4999: position 5000 → 1',
        });
        scanSpies.forEach((spy) => expect(spy).not.toHaveBeenCalled());
      } finally {
        scanSpies.forEach((spy) => spy.mockRestore());
      }
    });

    it('returns empty list when nothing changes', () => {
      expect(
        diffFacetValues(['red', 'blue'], ['red', 'blue'], ['green'], ['green'])
      ).toEqual([]);
    });

    it('detects Algo control → Include only transition', () => {
      expect(diffFacetValues([], ['red'], [], [])).toEqual([
        {
          type: 'changed',
          label: 'Include only',
          description: 'red (Algo control → Include only)',
        },
      ]);
    });

    it('detects Include only → Algo control transition', () => {
      expect(diffFacetValues(['red'], [], [], [])).toEqual([
        {
          type: 'changed',
          label: 'Algo control',
          description: 'red (Include only → Algo control)',
        },
      ]);
    });

    it('detects Algo control → Exclude only transition', () => {
      expect(diffFacetValues([], [], [], ['red'])).toEqual([
        {
          type: 'changed',
          label: 'Exclude only',
          description: 'red (Algo control → Exclude only)',
        },
      ]);
    });

    it('detects Include only → Exclude only transition', () => {
      expect(diffFacetValues(['red'], [], [], ['red'])).toEqual([
        {
          type: 'changed',
          label: 'Exclude only',
          description: 'red (Include only → Exclude only)',
        },
      ]);
    });

    it('detects Exclude only → Include only transition', () => {
      expect(diffFacetValues([], ['red'], ['red'], [])).toEqual([
        {
          type: 'changed',
          label: 'Include only',
          description: 'red (Exclude only → Include only)',
        },
      ]);
    });

    it('handles multiple values with mixed transitions', () => {
      // red: Include only → Exclude only; blue: Algo control → Include only
      const result = diffFacetValues(
        ['red'],
        ['blue'],
        ['green'],
        ['green', 'red']
      );
      expect(result).toEqual(
        expect.arrayContaining([
          {
            type: 'changed',
            label: 'Exclude only',
            description: 'red (Include only → Exclude only)',
          },
          {
            type: 'changed',
            label: 'Include only',
            description: 'blue (Algo control → Include only)',
          },
        ])
      );
    });

    it('detects order change within Include only values', () => {
      expect(diffFacetValues(['red', 'blue'], ['blue', 'red'], [], [])).toEqual(
        [
          {
            type: 'changed',
            label: 'Value order down',
            description: 'red: position 1 → 2',
          },
          {
            type: 'changed',
            label: 'Value order up',
            description: 'blue: position 2 → 1',
          },
        ]
      );
    });

    it('reports order changes for all affected Include only values when one value is moved', () => {
      expect(
        diffFacetValues(
          ['red', 'blue', 'green'],
          ['blue', 'green', 'red'],
          [],
          []
        )
      ).toEqual([
        {
          type: 'changed',
          label: 'Value order down',
          description: 'red: position 1 → 3',
        },
        {
          type: 'changed',
          label: 'Value order up',
          description: 'blue: position 2 → 1',
        },
        {
          type: 'changed',
          label: 'Value order up',
          description: 'green: position 3 → 2',
        },
      ]);
    });

    it('does not report order change for Exclude only values', () => {
      expect(diffFacetValues([], [], ['red', 'blue'], ['blue', 'red'])).toEqual(
        []
      );
    });
  });
});
