import type { GlobalAttributesPageState } from '@/libs/stores/global-attributes-page/global-attributes-page-reducer';

import { createDiffItem, type DiffItem } from './utils/diff';

type ValueStatus = 'included' | 'excluded' | 'algoControl';

type FlatValueRow = {
  key: string;
  displayName: string;
  status: ValueStatus;
};

const STATUS_LABEL: Record<ValueStatus, string> = {
  included: 'Include only',
  excluded: 'Exclude only',
  algoControl: 'Algo control',
};

type GlobalAttributesRows = Pick<
  GlobalAttributesPageState,
  'boostedRows' | 'excludedRows' | 'nonBoostedExcludedRows'
>;

type MergeGroupRow = {
  displayName: string;
  attributes: string[];
  status: ValueStatus;
};

type BoostedEntity =
  | { kind: 'value'; key: string; displayName: string }
  | { kind: 'merge'; attributes: string[]; displayName: string };

const flattenValueRows = (
  state: GlobalAttributesRows
): Map<string, FlatValueRow> => {
  const entries: [string, FlatValueRow][] = [
    ...state.boostedRows
      .filter((row) => row.attributes.length === 1)
      .map<[string, FlatValueRow]>((row) => [
        row.attributes[0],
        {
          key: row.attributes[0],
          displayName: row.displayName,
          status: 'included',
        },
      ]),
    ...state.excludedRows
      .filter((row) => row.attributes.length === 1)
      .map<[string, FlatValueRow]>((row) => [
        row.attributes[0],
        {
          key: row.attributes[0],
          displayName: row.displayName,
          status: 'excluded',
        },
      ]),
    ...state.nonBoostedExcludedRows
      .filter((row) => row.attributes.length === 1)
      .map<[string, FlatValueRow]>((row) => [
        row.attributes[0],
        {
          key: row.attributes[0],
          displayName: row.displayName,
          status: 'algoControl',
        },
      ]),
  ];

  return new Map(entries);
};

const flattenMergeGroupRows = (
  state: GlobalAttributesRows
): MergeGroupRow[] => [
  ...state.boostedRows
    .filter((row) => row.attributes.length > 1)
    .map((row) => ({
      displayName: row.displayName,
      attributes: row.attributes,
      status: 'included' as const,
    })),
  ...state.excludedRows
    .filter((row) => row.attributes.length > 1)
    .map((row) => ({
      displayName: row.displayName,
      attributes: row.attributes,
      status: 'excluded' as const,
    })),
  ...state.nonBoostedExcludedRows
    .filter((row) => row.attributes.length > 1)
    .map((row) => ({
      displayName: row.displayName,
      attributes: row.attributes,
      status: 'algoControl' as const,
    })),
];

const findOverlappingGroupIndex = (
  group: MergeGroupRow,
  candidates: MergeGroupRow[],
  matchedIndices: Set<number>
): number =>
  candidates.findIndex(
    (candidate, index) =>
      !matchedIndices.has(index) &&
      candidate.attributes.some((attribute) =>
        group.attributes.includes(attribute)
      )
  );

const describeMergeGroupMemberChange = (
  displayName: string,
  addedMembers: string[],
  removedMembers: string[]
): DiffItem[] => {
  if (addedMembers.length === 0 && removedMembers.length === 0) {
    return [];
  }

  if (addedMembers.length > 0 && removedMembers.length > 0) {
    return [
      createDiffItem(
        'changed',
        'Amended merge group',
        `${addedMembers.join(', ')} added, ${removedMembers.join(', ')} removed from '${displayName}' merge group`
      ),
    ];
  }

  return addedMembers.length > 0
    ? [
        createDiffItem(
          'added',
          'Amended merge group',
          `${addedMembers.join(', ')} added to '${displayName}' merge group`
        ),
      ]
    : [
        createDiffItem(
          'removed',
          'Amended merge group',
          `${removedMembers.join(', ')} removed from '${displayName}' merge group`
        ),
      ];
};

const buildMergeGroupDiffs = (
  originalState: GlobalAttributesRows,
  currentState: GlobalAttributesRows
): DiffItem[] => {
  const originalGroups = flattenMergeGroupRows(originalState);
  const currentGroups = flattenMergeGroupRows(currentState);

  const { diffs: memberChangeDiffs, matchedIndices: matchedOriginalIndices } =
    currentGroups.reduce<{
      diffs: DiffItem[];
      matchedIndices: Set<number>;
    }>(
      (acc, currentGroup) => {
        const originalIndex = findOverlappingGroupIndex(
          currentGroup,
          originalGroups,
          acc.matchedIndices
        );

        if (originalIndex === -1) {
          const statusSuffix =
            currentGroup.status === 'included'
              ? ''
              : ` (${STATUS_LABEL[currentGroup.status]})`;

          return {
            diffs: [
              ...acc.diffs,
              createDiffItem(
                'added',
                'Merged group',
                `${currentGroup.displayName}: ${currentGroup.attributes.join(', ')}${statusSuffix}`
              ),
            ],
            matchedIndices: acc.matchedIndices,
          };
        }

        const originalGroup = originalGroups[originalIndex];
        const addedMembers = currentGroup.attributes.filter(
          (attribute) => !originalGroup.attributes.includes(attribute)
        );
        const removedMembers = originalGroup.attributes.filter(
          (attribute) => !currentGroup.attributes.includes(attribute)
        );

        const memberChangeDiff = describeMergeGroupMemberChange(
          currentGroup.displayName,
          addedMembers,
          removedMembers
        );

        const renameDiff: DiffItem[] =
          originalGroup.displayName !== currentGroup.displayName
            ? [
                createDiffItem(
                  'changed',
                  'Changed value',
                  `${originalGroup.displayName} → ${currentGroup.displayName}`
                ),
              ]
            : [];

        const statusDiff: DiffItem[] =
          originalGroup.status !== currentGroup.status
            ? [
                createDiffItem(
                  'changed',
                  STATUS_LABEL[currentGroup.status],
                  `${currentGroup.displayName} (${STATUS_LABEL[originalGroup.status]} → ${STATUS_LABEL[currentGroup.status]})`
                ),
              ]
            : [];

        return {
          diffs: [
            ...acc.diffs,
            ...renameDiff,
            ...memberChangeDiff,
            ...statusDiff,
          ],
          matchedIndices: new Set([...acc.matchedIndices, originalIndex]),
        };
      },
      { diffs: [], matchedIndices: new Set<number>() }
    );

  const disbandedDiffs = originalGroups
    .filter((_, index) => !matchedOriginalIndices.has(index))
    .map((group) =>
      createDiffItem(
        'removed',
        'Merged group',
        `${group.displayName}: ${group.attributes.join(', ')}`
      )
    );

  return [...memberChangeDiffs, ...disbandedDiffs];
};

const toBoostedEntities = (
  boostedRows: GlobalAttributesRows['boostedRows'],
  excludeKeys: Set<string>
): BoostedEntity[] =>
  boostedRows
    .filter(
      (row) => row.attributes.length > 1 || !excludeKeys.has(row.attributes[0])
    )
    .map((row) =>
      row.attributes.length > 1
        ? {
            kind: 'merge',
            attributes: row.attributes,
            displayName: row.displayName,
          }
        : {
            kind: 'value',
            key: row.attributes[0],
            displayName: row.displayName,
          }
    );

const isMatchingEntity = (a: BoostedEntity, b: BoostedEntity): boolean => {
  if (a.kind === 'value' && b.kind === 'value') {
    return a.key === b.key;
  }
  if (a.kind === 'merge' && b.kind === 'merge') {
    return a.attributes.some((attribute) => b.attributes.includes(attribute));
  }
  // A value that has just become a merge member still anchors the merge
  // group to its prior position (e.g. a newly created merge group).
  if (a.kind === 'value' && b.kind === 'merge') {
    return b.attributes.includes(a.key);
  }
  return false;
};

// Matches entities present in both snapshots (by key for values, by member
// overlap for merge groups) so unmatched entities don't distort ranking.
const matchBoostedEntities = (
  originalEntities: BoostedEntity[],
  currentEntities: BoostedEntity[]
): { originalIndex: number; currentIndex: number }[] =>
  currentEntities.reduce<{
    pairs: { originalIndex: number; currentIndex: number }[];
    matchedIndices: Set<number>;
  }>(
    (acc, currentEntity, currentIndex) => {
      const originalIndex = originalEntities.findIndex(
        (originalEntity, index) =>
          !acc.matchedIndices.has(index) &&
          isMatchingEntity(originalEntity, currentEntity)
      );

      if (originalIndex === -1) {
        return acc;
      }

      return {
        pairs: [...acc.pairs, { originalIndex, currentIndex }],
        matchedIndices: new Set([...acc.matchedIndices, originalIndex]),
      };
    },
    { pairs: [], matchedIndices: new Set<number>() }
  ).pairs;

const buildBoostedOrderDiffs = (
  originalState: GlobalAttributesRows,
  currentState: GlobalAttributesRows,
  currentExcludeKeys: Set<string>
): DiffItem[] => {
  // The original side keeps standalone values that later join a new merge
  // group, so that merge group can still be anchored to its prior position.
  const originalEntities = toBoostedEntities(
    originalState.boostedRows,
    new Set()
  );
  const currentEntities = toBoostedEntities(
    currentState.boostedRows,
    currentExcludeKeys
  );

  const pairs = matchBoostedEntities(originalEntities, currentEntities).map(
    (pair, id) => ({ ...pair, id })
  );

  const originalRankById = new Map(
    [...pairs]
      .sort((a, b) => a.originalIndex - b.originalIndex)
      .map((pair, index) => [pair.id, index + 1])
  );
  const currentRankById = new Map(
    [...pairs]
      .sort((a, b) => a.currentIndex - b.currentIndex)
      .map((pair, index) => [pair.id, index + 1])
  );

  return pairs.flatMap((pair) => {
    const originalRank = originalRankById.get(pair.id) as number;
    const currentRank = currentRankById.get(pair.id) as number;

    if (originalRank === currentRank) {
      return [];
    }

    const entity = currentEntities[pair.currentIndex];
    const direction = currentRank < originalRank ? 'up' : 'down';

    return [
      createDiffItem(
        'changed',
        `Value order ${direction}`,
        `${entity.displayName}: position ${originalRank} → ${currentRank}`
      ),
    ];
  });
};

export const useGlobalFacetAttributesDiff = (
  originalState: GlobalAttributesRows,
  currentState: GlobalAttributesRows
): DiffItem[] => {
  const originalRows = flattenValueRows(originalState);
  const currentRows = flattenValueRows(currentState);

  const mergedKeysUnion = new Set(
    [
      ...flattenMergeGroupRows(originalState),
      ...flattenMergeGroupRows(currentState),
    ].flatMap((group) => group.attributes)
  );

  const valueDiffs = [...currentRows.values()]
    // Merged values are diffed via the merge group diff instead.
    .filter((current) => !mergedKeysUnion.has(current.key))
    .flatMap<DiffItem>((current) => {
      const original = originalRows.get(current.key) ?? {
        key: current.key,
        displayName: current.key,
        status: 'algoControl' as const,
      };

      const renameDiff: DiffItem[] =
        original.displayName !== current.displayName
          ? [
              createDiffItem(
                'changed',
                'Changed value',
                `${original.displayName} → ${current.displayName}`
              ),
            ]
          : [];

      const statusDiff: DiffItem[] =
        original.status !== current.status
          ? [
              createDiffItem(
                'changed',
                STATUS_LABEL[current.status],
                `${current.displayName} (${STATUS_LABEL[original.status]} → ${STATUS_LABEL[current.status]})`
              ),
            ]
          : [];

      return [...renameDiff, ...statusDiff];
    });

  // Only hide values that were part of an original merge group and have
  // reverted to standalone (already described by the merge group diff);
  // new merge members stay visible on the original side so the merge
  // group can be anchored to their prior position.
  const originalMergeKeys = new Set(
    flattenMergeGroupRows(originalState).flatMap((group) => group.attributes)
  );

  const orderDiffs = buildBoostedOrderDiffs(
    originalState,
    currentState,
    originalMergeKeys
  );

  return [
    ...valueDiffs,
    ...orderDiffs,
    ...buildMergeGroupDiffs(originalState, currentState),
  ];
};
