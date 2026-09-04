import type { ReactElement } from 'react';
import { useRouter } from 'next/router';

import type {
  MerchandisingReturnedCategoryRuleSet,
  MerchandisingRuleSet,
} from '@/libs/api';
import { ErrorMessage, Heading, Loader } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { ConflictModal } from '@/libs/components/conflict-modal/conflict-modal';
import { ROUTES } from '@/libs/constants/routes';
import { useCategoryHistory } from '@/libs/hooks/category/history/use-category-history';
import { useRuleSetDetail } from '@/libs/hooks/category/rulesets/use-rule-set-detail';
import { useAccess } from '@/libs/hooks/use-access';
import { useHistoricalOrCurrentRuleset } from '@/libs/hooks/use-historical-or-current-ruleset';
import { useUpdateRuleSet } from '@/libs/hooks/use-rule-set-update';
import { useRulesetDiff } from '@/libs/hooks/use-ruleset-diff';
import { useSaveConflict } from '@/libs/hooks/use-save-conflict';
import { useTrackRecentlyViewed } from '@/libs/hooks/use-track-recently-viewed';
import { Ruleset } from '@/libs/modules/ruleset/ruleset';
import { formatCategoriesInfo } from '@/libs/utils/format-categories-info';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Head from 'next/head';

type PageProps = {
  id: string;
};

const Page = ({ id }: PageProps): ReactElement => {
  const router = useRouter();
  const isHistoryView = router.query.history === 'true';
  const currentPage = Number(router.query.currentPage) || 1;
  const currentPageSize = Number(router.query.currentPageSize) || 20;

  const historyData = useCategoryHistory(
    isHistoryView ? id : '',
    currentPage,
    currentPageSize
  );
  const { ruleSetDetail, isLoading: isRuleSetLoading } = useRuleSetDetail(
    isHistoryView ? '' : id
  );

  const {
    rulesetData,
    isLoading,
    error: historyError,
  } = useHistoricalOrCurrentRuleset({
    id,
    historyData,
    currentData: { data: ruleSetDetail, isLoading: isRuleSetLoading },
  });

  const { updateCategoryRuleSet, isSaving, error } = useUpdateRuleSet();

  const {
    conflict,
    isOverwriting,
    runSave,
    handleOverwrite,
    handleDiscard,
    closeConflict,
  } = useSaveConflict<
    MerchandisingReturnedCategoryRuleSet,
    {
      categoryIds?: Array<string>;
      ruleSetId: string;
      ruleSet: MerchandisingRuleSet;
    }
  >({
    save: ({ categoryIds, ruleSetId, ruleSet }, versionOverride) => {
      // istanbul ignore next
      if (!categoryIds?.[0]) return Promise.resolve({ status: 'error' });

      return updateCategoryRuleSet({
        categoryIds,
        isEnabled: ruleSet.isEnabled,
        ruleSetId,
        rules: ruleSet.rules,
        ...(ruleSet.excludedFacets && {
          excludedFacets: ruleSet.excludedFacets,
        }),
        ...(ruleSet.facets && { facets: ruleSet.facets }),
        ...(ruleSet.endDate && { endDate: ruleSet.endDate }),
        ...(ruleSet.startDate && { startDate: ruleSet.startDate }),
        ...(ruleSet.countryCode && { countryCode: ruleSet.countryCode }),
        version: versionOverride ?? ruleSetDetail.version,
      });
    },
    onSuccess: () => router.push('/category'),
  });

  const conflictDiffItems = useRulesetDiff(
    ruleSetDetail,
    conflict?.currentEntity ?? ruleSetDetail,
    {
      originalCategoryIds: ruleSetDetail.categoriesInfo?.map(({ id }) => id),
      currentCategoryIds: (
        conflict?.currentEntity ?? ruleSetDetail
      ).categoriesInfo?.map(({ id }) => id),
    }
  );

  useTrackRecentlyViewed({
    id: rulesetData?.id,
    label: rulesetData?.categoriesInfo
      ? formatCategoriesInfo(rulesetData.categoriesInfo)
      : undefined,
    url: ROUTES.CATEGORY.RULESETS.EDIT(id),
    type: 'category',
  });

  const { hasReadAccess, hasWriteAccess, requiredReadRole } = useAccess('Cat');

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Edit Category Ruleset</title>
      </Head>

      <Heading breadcrumbs={['Categories', 'Ranking rules', 'Product Grid']} />

      {(error || historyError) && (
        <ErrorMessage>{error || historyError}</ErrorMessage>
      )}

      {isLoading ? (
        <Loader />
      ) : (
        rulesetData && (
          <>
            <Ruleset
              isEnabled={rulesetData.isEnabled}
              lastChanged={rulesetData.lastChanged}
              onSave={runSave}
              onCancel={() => router.push('/category')}
              originalRuleset={isHistoryView ? undefined : ruleSetDetail}
              categoriesInfo={rulesetData.categoriesInfo}
              rulesetFacets={rulesetData.facets}
              rulesetExcludedFacets={rulesetData.excludedFacets}
              rulesetId={rulesetData.id}
              rulesetMerchandisingRules={rulesetData.rules}
              rulesetType="category"
              startDate={rulesetData.startDate}
              endDate={rulesetData.endDate}
              countryCode={rulesetData.countryCode}
              isWriteEnabled={hasWriteAccess && !isHistoryView}
              isResolvingConflict={conflict !== null || isOverwriting}
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
        )
      )}

      {isSaving && <Loader />}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = (
  context: GetServerSidePropsContext
) => {
  return Promise.resolve({
    props: { id: context.query.id },
  });
};

export default Page;
