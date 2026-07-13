import { useFacetListDiff } from './use-facet-list-diff';

const allFacets = [
  { id: 'f1', displayValue: 'Colour' },
  { id: 'f2', displayValue: 'Size' },
  { id: 'f3', displayValue: 'Brand' },
];

describe('useFacetListDiff', () => {
  it('returns empty diff when nothing changed', () => {
    const result = useFacetListDiff(
      [{ id: 'f1' }],
      [{ id: 'f1' }],
      [],
      [],
      allFacets
    );
    expect(result).toEqual([]);
  });

  it('returns empty diff when all arrays are empty', () => {
    const result = useFacetListDiff([], [], [], [], allFacets);
    expect(result).toEqual([]);
  });

  describe('category changes', () => {
    it('detects an added category with id and name', () => {
      const result = useFacetListDiff([], [], [], [], allFacets, {
        originalCategories: [],
        currentCategories: [{ id: 'cat_1', name: 'Jersey Jeans' }],
      });
      expect(result).toContainEqual({
        type: 'added',
        label: 'Category',
        description: 'cat_1 | Jersey Jeans',
      });
    });

    it('detects an added category with id only when name is absent', () => {
      const result = useFacetListDiff([], [], [], [], allFacets, {
        originalCategories: [],
        currentCategories: [{ id: 'cat_1' }],
      });
      expect(result).toContainEqual({
        type: 'added',
        label: 'Category',
        description: 'cat_1',
      });
    });

    it('detects a removed category', () => {
      const result = useFacetListDiff([], [], [], [], allFacets, {
        originalCategories: [{ id: 'cat_1', name: 'Jersey Jeans' }],
        currentCategories: [],
      });
      expect(result).toContainEqual({
        type: 'removed',
        label: 'Category',
        description: 'cat_1 | Jersey Jeans',
      });
    });
  });

  describe('date changes', () => {
    it('detects a changed start date', () => {
      const result = useFacetListDiff([], [], [], [], allFacets, {
        originalStartDate: '2024-04-17T00:00:00.000Z',
        currentStartDate: '2024-05-01T10:00:00.000Z',
      });
      expect(result).toContainEqual({
        type: 'changed',
        label: 'Start date',
        description: '17/04/2024 00:00 → 01/05/2024 10:00',
      });
    });
  });

  describe('search term changes', () => {
    it('detects an added search term', () => {
      const result = useFacetListDiff([], [], [], [], allFacets, {
        originalSearchTerms: [],
        currentSearchTerms: ['jeans'],
      });
      expect(result).toContainEqual({
        type: 'added',
        label: 'Keyword',
        description: 'jeans',
      });
    });

    it('detects a removed search term', () => {
      const result = useFacetListDiff([], [], [], [], allFacets, {
        originalSearchTerms: ['jeans'],
        currentSearchTerms: [],
      });
      expect(result).toContainEqual({
        type: 'removed',
        label: 'Keyword',
        description: 'jeans',
      });
    });
  });

  describe('status changes', () => {
    it('detects Algo control → Included', () => {
      const result = useFacetListDiff([], [{ id: 'f1' }], [], [], allFacets);
      expect(result).toContainEqual({
        type: 'changed',
        label: 'Included',
        description: 'Colour (Algo control → Included)',
      });
    });

    it('detects Included → Algo control', () => {
      const result = useFacetListDiff([{ id: 'f1' }], [], [], [], allFacets);
      expect(result).toContainEqual({
        type: 'changed',
        label: 'Algo control',
        description: 'Colour (Included → Algo control)',
      });
    });

    it('detects Algo control → Excluded', () => {
      const result = useFacetListDiff([], [], [], [{ id: 'f2' }], allFacets);
      expect(result).toContainEqual({
        type: 'changed',
        label: 'Excluded',
        description: 'Size (Algo control → Excluded)',
      });
    });

    it('detects Excluded → Algo control', () => {
      const result = useFacetListDiff([], [], [{ id: 'f2' }], [], allFacets);
      expect(result).toContainEqual({
        type: 'changed',
        label: 'Algo control',
        description: 'Size (Excluded → Algo control)',
      });
    });

    it('detects Included → Excluded', () => {
      const result = useFacetListDiff(
        [{ id: 'f1' }],
        [],
        [],
        [{ id: 'f1' }],
        allFacets
      );
      expect(result).toContainEqual({
        type: 'changed',
        label: 'Excluded',
        description: 'Colour (Included → Excluded)',
      });
    });

    it('detects Excluded → Included', () => {
      const result = useFacetListDiff(
        [],
        [{ id: 'f1' }],
        [{ id: 'f1' }],
        [],
        allFacets
      );
      expect(result).toContainEqual({
        type: 'changed',
        label: 'Included',
        description: 'Colour (Excluded → Included)',
      });
    });
  });

  describe('position changes within Included', () => {
    it('detects a position change moving up', () => {
      const result = useFacetListDiff(
        [{ id: 'f1' }, { id: 'f2' }],
        [{ id: 'f2' }, { id: 'f1' }],
        [],
        [],
        allFacets
      );
      expect(result).toContainEqual({
        type: 'changed',
        label: 'Facet order up',
        description: 'Size: position 2 → 1',
      });
    });

    it('detects a position change moving down', () => {
      const result = useFacetListDiff(
        [{ id: 'f2' }, { id: 'f1' }],
        [{ id: 'f1' }, { id: 'f2' }],
        [],
        [],
        allFacets
      );
      expect(result).toContainEqual({
        type: 'changed',
        label: 'Facet order down',
        description: 'Size: position 1 → 2',
      });
    });

    it('does not report a change when order is unchanged', () => {
      const facets = [{ id: 'f1' }, { id: 'f2' }];
      const result = useFacetListDiff(facets, facets, [], [], allFacets);
      expect(result).toEqual([]);
    });
  });

  it('falls back to id when no display name is found', () => {
    const result = useFacetListDiff(
      [],
      [{ id: 'unknown-id' }],
      [],
      [],
      allFacets
    );
    expect(result).toContainEqual({
      type: 'changed',
      label: 'Included',
      description: 'unknown-id (Algo control → Included)',
    });
  });

  it('returns combined diffs for multiple changes including categories', () => {
    const result = useFacetListDiff(
      [{ id: 'f1' }],
      [{ id: 'f2' }],
      [],
      [{ id: 'f3' }],
      allFacets,
      {
        originalCategories: [],
        currentCategories: [{ id: 'cat_1', name: 'Jeans' }],
      }
    );
    expect(result).toHaveLength(4);
    expect(result).toContainEqual({
      type: 'added',
      label: 'Category',
      description: 'cat_1 | Jeans',
    });
  });
});
