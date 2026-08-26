import type { ReactElement } from 'react';
import { useRouter } from 'next/router';

import type {
  MerchandisingReturnedCategoryRuleSet,
  MerchandisingRuleSet,
} from '@/libs/api';
import { ErrorMessage, Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { ConflictModal } from '@/libs/components/conflict-modal/conflict-modal';
import { useOptimisticLockingFlag } from '@/libs/components/feature-flag/feature-flag';
import { ROUTES } from '@/libs/constants/routes';
import { FacetType } from '@/libs/constants/rule-types';
import { FacetsPanelSkeleton } from '@/libs/containers';
import { FacetsList } from '@/libs/features';
import {
  useFacetsList,
  useRuleSetDetail,
  useUpdateRuleSet,
} from '@/libs/hooks';
import { useCategoryHistory } from '@/libs/hooks/category/history/use-category-history';
import { useAccess } from '@/libs/hooks/use-access';
import { useHistoricalOrCurrentRuleset } from '@/libs/hooks/use-historical-or-current-ruleset';
import { useRulesetDiff } from '@/libs/hooks/use-ruleset-diff';
import { useSaveConflict } from '@/libs/hooks/use-save-conflict';
import { useTrackRecentlyViewed } from '@/libs/hooks/use-track-recently-viewed';
import { formatCategoriesInfo } from '@/libs/utils/format-categories-info';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Head from 'next/head';

export const getServerSideProps: GetServerSideProps = (
  context: GetServerSidePropsContext
) => {
  return Promise.resolve({
    props: { id: context.query.id },
  });
};

const Page = ({ id }: { id: string }): ReactElement => {
  const router = useRouter();
  const isHistoryView = router.query.history === 'true';
  const currentPage = Number(router.query.currentPage) || 1;
  const currentPageSize = Number(router.query.currentPageSize) || 20;

  const { updateCategoryRuleSet, error: updateRulesetError } =
    useUpdateRuleSet();
  const shouldUseV1 = useOptimisticLockingFlag();

  const {
    ruleSetDetail,
    isLoading: isCurrentLoading,
    error: getRulesetDetailError,
  } = useRuleSetDetail(isHistoryView ? '' : id);

  const {
    conflict,
    isOverwriting,
    runSave,
    handleOverwrite,
    handleDiscard,
    closeConflict,
  } = useSaveConflict<
    MerchandisingReturnedCategoryRuleSet,
    MerchandisingRuleSet & { categoryIds?: string[] }
  >({
    save: (
      { facets, excludedFacets, countryCode, categoryIds, startDate, endDate },
      versionOverride
    ) => {
      // istanbul ignore next
      if (!categoryIds) return Promise.resolve({ status: 'error' });

      return updateCategoryRuleSet({
        categoryIds,
        rules: ruleSetDetail.rules,
        facets,
        isEnabled: ruleSetDetail.isEnabled,
        ...(startDate && { startDate: new Date(startDate).toISOString() }),
        ...(endDate && {
          endDate: new Date(endDate).toISOString(),
        }),
        ruleSetId: id,
        excludedFacets,
        countryCode,
        version: versionOverride ?? ruleSetDetail.version,
        shouldUseV1,
      });
    },
    onSuccess: () => router.push('/category'),
  });

  const handleCancel = () => {
    router.push('/category');
  };

  const historyData = useCategoryHistory(
    isHistoryView ? id : '',
    currentPage,
    currentPageSize
  );

  const {
    rulesetData,
    isLoading,
    error: historyError,
  } = useHistoricalOrCurrentRuleset({
    id,
    historyData: {
      history: historyData.history,
      isLoading: historyData.isLoading,
      error: historyData.error,
    },
    currentData: { data: ruleSetDetail, isLoading: isCurrentLoading },
  });

  const { facets: catalogueFacets } = useFacetsList({
    query: ruleSetDetail.categoriesInfo.map(({ id }) => id),
    queryBy: 'categoryIds',
    enabled: true,
    countryCode: ruleSetDetail.countryCode ?? 'UK_IE',
  });

  const conflictDiffItems = useRulesetDiff(
    ruleSetDetail,
    conflict?.currentEntity ?? ruleSetDetail,
    {
      originalCategoryIds: ruleSetDetail.categoriesInfo?.map(({ id }) => id),
      currentCategoryIds: (
        conflict?.currentEntity ?? ruleSetDetail
      ).categoriesInfo?.map(({ id }) => id),
      facetNames: Object.fromEntries(
        catalogueFacets.map((f) => [f.id, f.displayValue])
      ),
    }
  );

  const { hasReadAccess, requiredReadRole, hasWriteAccess } = useAccess('Cat');

  useTrackRecentlyViewed({
    id,
    label: rulesetData?.categoriesInfo
      ? formatCategoriesInfo(rulesetData.categoriesInfo)
      : undefined,
    url: ROUTES.CATEGORY.RULESETS.EDIT(id),
    type: 'category',
  });

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Edit Category Ruleset Facets</title>
      </Head>
      <Heading breadcrumbs={['Categories', 'Facet Management', 'Editor']} />

      {getRulesetDetailError && (
        <ErrorMessage>
          Error whilst retrieving ruleset: {getRulesetDetailError}
        </ErrorMessage>
      )}
      {historyError && (
        <ErrorMessage>
          Error whilst retrieving history: {historyError}
        </ErrorMessage>
      )}
      {updateRulesetError && (
        <ErrorMessage>
          Error whilst updating ruleset: {updateRulesetError}
        </ErrorMessage>
      )}

      {isLoading ? (
        <FacetsPanelSkeleton title="Facet Rule Editor" aria-busy="true" />
      ) : (
        <>
          <FacetsList
            facetType={FacetType.Category}
            categoriesInfo={rulesetData?.categoriesInfo}
            isNewRuleset={false}
            currentRuleset={rulesetData}
            onCancel={handleCancel}
            onSave={runSave}
            isWriteEnabled={hasWriteAccess && !isHistoryView}
            lastChanged={rulesetData?.lastChanged}
          />
          <ConflictModal
            opened={conflict !== null}
            entityLabel="category ruleset"
            diffItems={conflictDiffItems}
            changedBy={conflict?.currentEntity.lastChanged.user}
            isSaving={isOverwriting}
            onOverwrite={handleOverwrite}
            onDiscard={handleDiscard}
            onClose={closeConflict}
          />
        </>
      )}
    </>
  );
};

export default Page;
