import { useGlobalFacetAttributesDiff } from './use-global-facet-attributes-diff';

const buildState = (overrides: {
  boostedRows?: {
    displayName: string;
    attributes: string[];
    order?: number;
  }[];
  excludedRows?: { displayName: string; attributes: string[] }[];
  nonBoostedExcludedRows?: { displayName: string; attributes: string[] }[];
}) => ({
  boostedRows: (overrides.boostedRows ?? []).map((row, index) => ({
    displayName: row.displayName,
    attributes: row.attributes,
    isMergeGroup: row.attributes.length > 1,
    isChecked: false,
    order: row.order ?? index + 1,
  })),
  excludedRows: (overrides.excludedRows ?? []).map((row) => ({
    displayName: row.displayName,
    attributes: row.attributes,
    isMergeGroup: row.attributes.length > 1,
    isChecked: false,
  })),
  nonBoostedExcludedRows: (overrides.nonBoostedExcludedRows ?? []).map(
    (row) => ({
      displayName: row.displayName,
      attributes: row.attributes,
      isMergeGroup: row.attributes.length > 1,
      isChecked: false,
    })
  ),
});

describe('useGlobalFacetAttributesDiff', () => {
  it('returns no diff items when nothing has changed', () => {
    const original = buildState({
      boostedRows: [{ displayName: 'Red', attributes: ['Red'] }],
      excludedRows: [{ displayName: 'Blue', attributes: ['Blue'] }],
      nonBoostedExcludedRows: [{ displayName: 'Green', attributes: ['Green'] }],
    });

    const result = useGlobalFacetAttributesDiff(original, original);

    expect(result).toEqual([]);
  });

  it('detects a renamed value', () => {
    const original = buildState({
      nonBoostedExcludedRows: [{ displayName: 'Green', attributes: ['Green'] }],
    });
    const current = buildState({
      nonBoostedExcludedRows: [
        { displayName: 'Forest Green', attributes: ['Green'] },
      ],
    });

    const result = useGlobalFacetAttributesDiff(original, current);

    expect(result).toEqual([
      {
        type: 'changed',
        label: 'Changed value',
        description: 'Green → Forest Green',
      },
    ]);
  });

  it('detects a value changing from algo control to included', () => {
    const original = buildState({
      nonBoostedExcludedRows: [{ displayName: 'Green', attributes: ['Green'] }],
    });
    const current = buildState({
      boostedRows: [{ displayName: 'Green', attributes: ['Green'], order: 1 }],
    });

    const result = useGlobalFacetAttributesDiff(original, current);

    expect(result).toEqual([
      {
        type: 'changed',
        label: 'Include only',
        description: 'Green (Algo control → Include only)',
      },
    ]);
  });

  it('detects a value changing from included to excluded', () => {
    const original = buildState({
      boostedRows: [{ displayName: 'Red', attributes: ['Red'], order: 1 }],
    });
    const current = buildState({
      excludedRows: [{ displayName: 'Red', attributes: ['Red'] }],
    });

    const result = useGlobalFacetAttributesDiff(original, current);

    expect(result).toEqual([
      {
        type: 'changed',
        label: 'Exclude only',
        description: 'Red (Include only → Exclude only)',
      },
    ]);
  });

  it('detects an included value moving up in position', () => {
    const original = buildState({
      boostedRows: [
        { displayName: 'Red', attributes: ['Red'], order: 1 },
        { displayName: 'Blue', attributes: ['Blue'], order: 2 },
      ],
    });
    const current = buildState({
      boostedRows: [
        { displayName: 'Blue', attributes: ['Blue'], order: 1 },
        { displayName: 'Red', attributes: ['Red'], order: 2 },
      ],
    });

    const result = useGlobalFacetAttributesDiff(original, current);

    expect(result).toEqual(
      expect.arrayContaining([
        {
          type: 'changed',
          label: 'Value order up',
          description: 'Blue: position 2 → 1',
        },
        {
          type: 'changed',
          label: 'Value order down',
          description: 'Red: position 1 → 2',
        },
      ])
    );
    expect(result).toHaveLength(2);
  });

  it('treats a newly searched value with no original entry as algo control', () => {
    const original = buildState({});
    const current = buildState({
      nonBoostedExcludedRows: [
        { displayName: 'Yellow', attributes: ['Yellow'] },
      ],
    });

    const result = useGlobalFacetAttributesDiff(original, current);

    expect(result).toEqual([]);
  });

  it('ignores merge group rows (more than one attribute) when membership and name are unchanged', () => {
    const original = buildState({
      nonBoostedExcludedRows: [
        { displayName: 'Merged', attributes: ['A', 'B'] },
      ],
      excludedRows: [{ displayName: 'Excluded Merge', attributes: ['C', 'D'] }],
      boostedRows: [
        { displayName: 'Boosted Merge', attributes: ['E', 'F'], order: 1 },
      ],
    });
    const current = buildState({
      nonBoostedExcludedRows: [
        { displayName: 'Merged', attributes: ['B', 'A'] },
      ],
      excludedRows: [{ displayName: 'Excluded Merge', attributes: ['D', 'C'] }],
      boostedRows: [
        { displayName: 'Boosted Merge', attributes: ['E', 'F'], order: 1 },
      ],
    });

    const result = useGlobalFacetAttributesDiff(original, current);

    expect(result).toEqual([]);
  });

  it('detects a renamed merge group', () => {
    const original = buildState({
      nonBoostedExcludedRows: [
        { displayName: 'Merged', attributes: ['A', 'B'] },
      ],
    });
    const current = buildState({
      nonBoostedExcludedRows: [
        { displayName: 'Merged Renamed', attributes: ['A', 'B'] },
      ],
    });

    const result = useGlobalFacetAttributesDiff(original, current);

    expect(result).toEqual([
      {
        type: 'changed',
        label: 'Changed value',
        description: 'Merged → Merged Renamed',
      },
    ]);
  });

  it('detects a newly created merge group', () => {
    const original = buildState({
      nonBoostedExcludedRows: [
        { displayName: 'Red', attributes: ['Red'] },
        { displayName: 'Blue', attributes: ['Blue'] },
      ],
    });
    const current = buildState({
      boostedRows: [
        {
          displayName: 'Primary Colours',
          attributes: ['Red', 'Blue'],
          order: 1,
        },
      ],
    });

    const result = useGlobalFacetAttributesDiff(original, current);

    expect(result).toEqual([
      {
        type: 'added',
        label: 'Merged group',
        description: 'Primary Colours: Red, Blue',
      },
    ]);
  });

  it('shows the resulting status when a newly created merge group is not included', () => {
    const original = buildState({
      nonBoostedExcludedRows: [
        { displayName: 'Red', attributes: ['Red'] },
        { displayName: 'Blue', attributes: ['Blue'] },
      ],
    });
    const current = buildState({
      nonBoostedExcludedRows: [
        { displayName: 'Primary Colours', attributes: ['Red', 'Blue'] },
      ],
    });

    const result = useGlobalFacetAttributesDiff(original, current);

    expect(result).toEqual([
      {
        type: 'added',
        label: 'Merged group',
        description: 'Primary Colours: Red, Blue (Algo control)',
      },
    ]);
  });

  it('does not diff an existing merge group whose membership and status are unchanged', () => {
    const original = buildState({
      boostedRows: [
        {
          displayName: 'Primary Colours',
          attributes: ['Red', 'Blue'],
          order: 1,
        },
      ],
    });
    const current = buildState({
      boostedRows: [
        {
          displayName: 'Primary Colours',
          attributes: ['Blue', 'Red'],
          order: 1,
        },
      ],
    });

    const result = useGlobalFacetAttributesDiff(original, current);

    expect(result).toEqual([]);
  });

  it('detects a merge group changing status', () => {
    const original = buildState({
      boostedRows: [
        {
          displayName: 'Primary Colours',
          attributes: ['Red', 'Blue'],
          order: 1,
        },
      ],
    });
    const current = buildState({
      excludedRows: [
        { displayName: 'Primary Colours', attributes: ['Blue', 'Red'] },
      ],
    });

    const result = useGlobalFacetAttributesDiff(original, current);

    expect(result).toEqual([
      {
        type: 'changed',
        label: 'Exclude only',
        description: 'Primary Colours (Include only → Exclude only)',
      },
    ]);
  });

  it('detects multiple newly created merge groups across different status lists', () => {
    const original = buildState({
      nonBoostedExcludedRows: [
        { displayName: 'Red', attributes: ['Red'] },
        { displayName: 'Blue', attributes: ['Blue'] },
        { displayName: 'Small', attributes: ['Small'] },
        { displayName: 'Medium', attributes: ['Medium'] },
      ],
    });
    const current = buildState({
      boostedRows: [
        {
          displayName: 'Primary Colours',
          attributes: ['Red', 'Blue'],
          order: 1,
        },
      ],
      excludedRows: [{ displayName: 'Sizes', attributes: ['Small', 'Medium'] }],
    });

    const result = useGlobalFacetAttributesDiff(original, current);

    expect(result).toEqual(
      expect.arrayContaining([
        {
          type: 'added',
          label: 'Merged group',
          description: 'Primary Colours: Red, Blue',
        },
        {
          type: 'added',
          label: 'Merged group',
          description: 'Sizes: Small, Medium (Exclude only)',
        },
      ])
    );
    expect(result).toHaveLength(2);
  });

  it('does not report a position change for other boosted values shifted only by a new merge', () => {
    const original = buildState({
      boostedRows: [
        { displayName: 'Red', attributes: ['Red'], order: 1 },
        { displayName: 'Blue', attributes: ['Blue'], order: 2 },
        { displayName: 'Green', attributes: ['Green'], order: 3 },
        { displayName: 'Yellow', attributes: ['Yellow'], order: 4 },
      ],
    });
    const current = buildState({
      boostedRows: [
        {
          displayName: 'Primary Colours',
          attributes: ['Red', 'Blue'],
          order: 1,
        },
        { displayName: 'Green', attributes: ['Green'], order: 2 },
        { displayName: 'Yellow', attributes: ['Yellow'], order: 3 },
      ],
    });

    const result = useGlobalFacetAttributesDiff(original, current);

    expect(result).toEqual([
      {
        type: 'added',
        label: 'Merged group',
        description: 'Primary Colours: Red, Blue',
      },
    ]);
  });

  it('still detects a genuine reorder of remaining values alongside a new merge', () => {
    const original = buildState({
      boostedRows: [
        { displayName: 'Red', attributes: ['Red'], order: 1 },
        { displayName: 'Blue', attributes: ['Blue'], order: 2 },
        { displayName: 'Green', attributes: ['Green'], order: 3 },
        { displayName: 'Yellow', attributes: ['Yellow'], order: 4 },
      ],
    });
    const current = buildState({
      boostedRows: [
        {
          displayName: 'Primary Colours',
          attributes: ['Red', 'Blue'],
          order: 1,
        },
        { displayName: 'Yellow', attributes: ['Yellow'], order: 2 },
        { displayName: 'Green', attributes: ['Green'], order: 3 },
      ],
    });

    const result = useGlobalFacetAttributesDiff(original, current);

    expect(result).toEqual(
      expect.arrayContaining([
        {
          type: 'added',
          label: 'Merged group',
          description: 'Primary Colours: Red, Blue',
        },
        {
          type: 'changed',
          label: 'Value order up',
          description: 'Yellow: position 3 → 2',
        },
        {
          type: 'changed',
          label: 'Value order down',
          description: 'Green: position 2 → 3',
        },
      ])
    );
    expect(result).toHaveLength(3);
  });

  it('detects a newly created merge group being repositioned amongst boosted values', () => {
    const original = buildState({
      boostedRows: [
        { displayName: 'Red', attributes: ['Red'], order: 1 },
        { displayName: 'Blue', attributes: ['Blue'], order: 2 },
        { displayName: 'Green', attributes: ['Green'], order: 3 },
      ],
    });
    const current = buildState({
      boostedRows: [
        { displayName: 'Green', attributes: ['Green'], order: 1 },
        {
          displayName: 'Primary Colours',
          attributes: ['Red', 'Blue'],
          order: 2,
        },
      ],
    });

    const result = useGlobalFacetAttributesDiff(original, current);

    expect(result).toEqual(
      expect.arrayContaining([
        {
          type: 'added',
          label: 'Merged group',
          description: 'Primary Colours: Red, Blue',
        },
        {
          type: 'changed',
          label: 'Value order up',
          description: 'Green: position 2 → 1',
        },
        {
          type: 'changed',
          label: 'Value order down',
          description: 'Primary Colours: position 1 → 2',
        },
      ])
    );
    expect(result).toHaveLength(3);
  });

  it('detects a fully disbanded merge group', () => {
    const original = buildState({
      boostedRows: [
        {
          displayName: 'Primary Colours',
          attributes: ['Red', 'Blue'],
          order: 1,
        },
      ],
    });
    const current = buildState({
      boostedRows: [
        { displayName: 'Red', attributes: ['Red'], order: 1 },
        { displayName: 'Blue', attributes: ['Blue'], order: 2 },
      ],
    });

    const result = useGlobalFacetAttributesDiff(original, current);

    expect(result).toEqual([
      {
        type: 'removed',
        label: 'Merged group',
        description: 'Primary Colours: Red, Blue',
      },
    ]);
  });

  it('does not report spurious status or rename diffs for values reverting to individual after a disband', () => {
    const original = buildState({
      excludedRows: [
        {
          displayName: 'Primary Colours',
          attributes: ['Red', 'Blue'],
        },
      ],
    });
    const current = buildState({
      boostedRows: [
        { displayName: 'Red', attributes: ['Red'], order: 1 },
        { displayName: 'Blue', attributes: ['Blue'], order: 2 },
      ],
    });

    const result = useGlobalFacetAttributesDiff(original, current);

    expect(result).toEqual([
      {
        type: 'removed',
        label: 'Merged group',
        description: 'Primary Colours: Red, Blue',
      },
    ]);
  });

  it('does not report a position change for other boosted values shifted only by a disband', () => {
    const original = buildState({
      boostedRows: [
        {
          displayName: 'Primary Colours',
          attributes: ['Red', 'Blue'],
          order: 1,
        },
        { displayName: 'Green', attributes: ['Green'], order: 2 },
        { displayName: 'Yellow', attributes: ['Yellow'], order: 3 },
      ],
    });
    const current = buildState({
      boostedRows: [
        { displayName: 'Red', attributes: ['Red'], order: 1 },
        { displayName: 'Blue', attributes: ['Blue'], order: 2 },
        { displayName: 'Green', attributes: ['Green'], order: 3 },
        { displayName: 'Yellow', attributes: ['Yellow'], order: 4 },
      ],
    });

    const result = useGlobalFacetAttributesDiff(original, current);

    expect(result).toEqual([
      {
        type: 'removed',
        label: 'Merged group',
        description: 'Primary Colours: Red, Blue',
      },
    ]);
  });

  it('detects a partial demerge as an item removed from the merge group', () => {
    const original = buildState({
      boostedRows: [
        {
          displayName: 'Colours',
          attributes: ['Red', 'Blue', 'Green'],
          order: 1,
        },
      ],
    });
    const current = buildState({
      boostedRows: [
        { displayName: 'Colours', attributes: ['Red', 'Blue'], order: 1 },
      ],
      nonBoostedExcludedRows: [{ displayName: 'Green', attributes: ['Green'] }],
    });

    const result = useGlobalFacetAttributesDiff(original, current);

    expect(result).toEqual([
      {
        type: 'removed',
        label: 'Amended merge group',
        description: "Green removed from 'Colours' merge group",
      },
    ]);
  });

  it('detects an item added to an existing merge group', () => {
    const original = buildState({
      boostedRows: [
        { displayName: 'Colours', attributes: ['Red', 'Blue'], order: 1 },
      ],
      nonBoostedExcludedRows: [{ displayName: 'Green', attributes: ['Green'] }],
    });
    const current = buildState({
      boostedRows: [
        {
          displayName: 'Colours',
          attributes: ['Red', 'Blue', 'Green'],
          order: 1,
        },
      ],
    });

    const result = useGlobalFacetAttributesDiff(original, current);

    expect(result).toEqual([
      {
        type: 'added',
        label: 'Amended merge group',
        description: "Green added to 'Colours' merge group",
      },
    ]);
  });

  it('combines a simultaneous add and remove into a single merge group diff', () => {
    const original = buildState({
      boostedRows: [
        {
          displayName: '10 months +',
          attributes: ['10 months +', '2-4 years'],
          order: 1,
        },
      ],
    });
    const current = buildState({
      boostedRows: [
        {
          displayName: '10 months +',
          attributes: ['10 months +', '10+ years'],
          order: 1,
        },
      ],
      nonBoostedExcludedRows: [
        { displayName: '2-4 years', attributes: ['2-4 years'] },
      ],
    });

    const result = useGlobalFacetAttributesDiff(original, current);

    expect(result).toEqual([
      {
        type: 'changed',
        label: 'Amended merge group',
        description:
          "10+ years added, 2-4 years removed from '10 months +' merge group",
      },
    ]);
  });

  it('detects a boosted merge group moving position relative to other boosted groups', () => {
    const original = buildState({
      boostedRows: [
        { displayName: 'Colours', attributes: ['Red', 'Blue'], order: 1 },
        { displayName: 'Sizes', attributes: ['Small', 'Medium'], order: 2 },
      ],
    });
    const current = buildState({
      boostedRows: [
        { displayName: 'Sizes', attributes: ['Small', 'Medium'], order: 1 },
        { displayName: 'Colours', attributes: ['Red', 'Blue'], order: 2 },
      ],
    });

    const result = useGlobalFacetAttributesDiff(original, current);

    expect(result).toEqual(
      expect.arrayContaining([
        {
          type: 'changed',
          label: 'Value order up',
          description: 'Sizes: position 2 → 1',
        },
        {
          type: 'changed',
          label: 'Value order down',
          description: 'Colours: position 1 → 2',
        },
      ])
    );
    expect(result).toHaveLength(2);
  });

  it('does not report a position change for merge groups keeping the same relative order', () => {
    const original = buildState({
      boostedRows: [
        { displayName: 'Colours', attributes: ['Red', 'Blue'], order: 1 },
        { displayName: 'Sizes', attributes: ['Small', 'Medium'], order: 2 },
      ],
    });
    const current = buildState({
      boostedRows: [
        { displayName: 'Colours', attributes: ['Red', 'Blue'], order: 1 },
        { displayName: 'Sizes', attributes: ['Small', 'Medium'], order: 2 },
      ],
    });

    const result = useGlobalFacetAttributesDiff(original, current);

    expect(result).toEqual([]);
  });

  it('detects a single merge group moving position relative to individual boosted values', () => {
    const original = buildState({
      boostedRows: [
        { displayName: 'Colours', attributes: ['Red', 'Blue'], order: 1 },
        { displayName: 'Small', attributes: ['Small'], order: 2 },
        { displayName: 'Medium', attributes: ['Medium'], order: 3 },
      ],
    });
    const current = buildState({
      boostedRows: [
        { displayName: 'Small', attributes: ['Small'], order: 1 },
        { displayName: 'Medium', attributes: ['Medium'], order: 2 },
        { displayName: 'Colours', attributes: ['Red', 'Blue'], order: 3 },
      ],
    });

    const result = useGlobalFacetAttributesDiff(original, current);

    expect(result).toEqual(
      expect.arrayContaining([
        {
          type: 'changed',
          label: 'Value order up',
          description: 'Small: position 2 → 1',
        },
        {
          type: 'changed',
          label: 'Value order up',
          description: 'Medium: position 3 → 2',
        },
        {
          type: 'changed',
          label: 'Value order down',
          description: 'Colours: position 1 → 3',
        },
      ])
    );
    expect(result).toHaveLength(3);
  });
});
