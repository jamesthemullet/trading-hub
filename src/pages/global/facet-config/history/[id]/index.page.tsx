import type { ReactElement } from 'react';
import { useRouter } from 'next/router';

import type { MerchandisingReturnedGlobalFacet } from '@/libs/api';
import { RuleType } from '@/libs/constants/rule-types';
import { HistoryPage } from '@/libs/features';
import { useFacetHistory } from '@/libs/hooks/global/facets/use-facet-history';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';

type MergeGroup = NonNullable<
  MerchandisingReturnedGlobalFacet['merged']
>[number];

type FacetConfigDiffSnapshot = {
  displayValue?: MerchandisingReturnedGlobalFacet['displayValue'];
  merged?: MerchandisingReturnedGlobalFacet['merged'];
  boosted?: MerchandisingReturnedGlobalFacet['boosted'];
  excludedValues?: MerchandisingReturnedGlobalFacet['excludedValues'];
};

const serialise = (value: unknown): string => JSON.stringify(value ?? null);

const mergeGroupKey = (mergeGroup: MergeGroup): string =>
  mergeGroup.displayValue ?? '';

const mergeGroupOccurrenceKey = (
  mergeGroup: MergeGroup,
  index: number,
  mergeGroups: MergeGroup[]
): string => {
  const displayValue = mergeGroupKey(mergeGroup);
  const occurrence = mergeGroups
    .slice(0, index)
    .filter(
      (previousMergeGroup) => mergeGroupKey(previousMergeGroup) === displayValue
    ).length;

  return JSON.stringify([displayValue, occurrence]);
};

const mergeGroupsByOccurrence = (
  mergeGroups: MergeGroup[]
): Map<string, MergeGroup> => {
  return new Map(
    mergeGroups.map((mergeGroup, index) => [
      mergeGroupOccurrenceKey(mergeGroup, index, mergeGroups),
      mergeGroup,
    ])
  );
};

const mergeGroupLabel = (mergeGroup: MergeGroup): string =>
  mergeGroup.displayValue ?? 'Unnamed merge group';

const mergeGroupValues = (mergeGroup: MergeGroup): string =>
  mergeGroup.mergedValues?.join(', ') ?? '';

const diffMergeGroups = (
  current: MergeGroup[] = [],
  previous: MergeGroup[] = []
): string[] => {
  const currentByOccurrence = mergeGroupsByOccurrence(current);
  const previousByOccurrence = mergeGroupsByOccurrence(previous);

  return [
    ...[...currentByOccurrence]
      .filter(([key]) => !previousByOccurrence.has(key))
      .map(
        ([, mergeGroup]) => `Merge group added: ${mergeGroupLabel(mergeGroup)}`
      ),
    ...[...previousByOccurrence]
      .filter(([key]) => !currentByOccurrence.has(key))
      .map(
        ([, mergeGroup]) =>
          `Merge group removed: ${mergeGroupLabel(mergeGroup)}`
      ),
    ...[...currentByOccurrence].flatMap(([key, mergeGroup]) => {
      const previousItem = previousByOccurrence.get(key);
      if (
        previousItem === undefined ||
        serialise(mergeGroup.mergedValues) ===
          serialise(previousItem.mergedValues)
      ) {
        return [];
      }
      return [
        `Merge group changed: ${mergeGroupLabel(mergeGroup)} (${mergeGroupValues(
          previousItem
        )} → ${mergeGroupValues(mergeGroup)})`,
      ];
    }),
  ];
};

const diffValues = (
  current: string[] = [],
  previous: string[] = [],
  addedLabel: (value: string) => string,
  removedLabel: (value: string) => string
): string[] => [
  ...current.filter((value) => !previous.includes(value)).map(addedLabel),
  ...previous.filter((value) => !current.includes(value)).map(removedLabel),
];

const getFacetConfigDiff = (
  current: FacetConfigDiffSnapshot,
  previous: FacetConfigDiffSnapshot
): string[] => {
  return [
    ...(current.displayValue !== previous.displayValue
      ? [
          `Display name changed: ${previous.displayValue} → ${current.displayValue}`,
        ]
      : []),
    ...diffMergeGroups(current.merged, previous.merged),
    ...diffValues(
      current.boosted,
      previous.boosted,
      (value) => `Value included: ${value}`,
      (value) => `Value include removed: ${value}`
    ),
    ...diffValues(
      current.excludedValues,
      previous.excludedValues,
      (value) => `Value excluded: ${value}`,
      (value) => `Value exclusion removed: ${value}`
    ),
  ];
};

const FacetConfigHistory = ({ id }: { id: string }): ReactElement => {
  const router = useRouter();
  const currentPage = Number(router.query.currentPage) || 1;
  const currentPageSize = Number(router.query.currentPageSize) || 20;
  const displayName = String(router.query.displayName ?? '');

  const { history, isLoading, error } = useFacetHistory(
    id,
    currentPage,
    currentPageSize
  );

  return (
    <HistoryPage
      title="Facet Config History"
      breadcrumbs={['Setup', 'Global Facet Config', 'History']}
      accessType="Glob"
      ruleType={RuleType.Global}
      history={history}
      isLoading={isLoading}
      error={error}
      identifier={displayName}
      diffHistoryItem={getFacetConfigDiff}
      hasTabs={false}
      linkTarget="facetConfigValues"
    />
  );
};

export const getServerSideProps: GetServerSideProps = (
  context: GetServerSidePropsContext
) => {
  return Promise.resolve({
    props: { id: String(context.query.id ?? '') },
  });
};

export default FacetConfigHistory;
