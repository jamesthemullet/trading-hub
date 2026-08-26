import type { ReactElement } from 'react';
import { useRouter } from 'next/router';

import type {
  MerchandisingReturnedKeywordRuleSet,
  MerchandisingRuleSet,
} from '@/libs/api';
import { ErrorMessage, Heading, Loader } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { ConflictModal } from '@/libs/components/conflict-modal/conflict-modal';
import { useOptimisticLockingFlag } from '@/libs/components/feature-flag/feature-flag';
import { ROUTES } from '@/libs/constants/routes';
import { useSearchRuleSetPreview, useSearchRuleSetUpdate } from '@/libs/hooks';
import { useSearchHistory } from '@/libs/hooks/search/history/use-search-history';
import { useAccess } from '@/libs/hooks/use-access';
import { useHistoricalOrCurrentRuleset } from '@/libs/hooks/use-historical-or-current-ruleset';
import { useRulesetDiff } from '@/libs/hooks/use-ruleset-diff';
import { useSaveConflict } from '@/libs/hooks/use-save-conflict';
import { useTrackRecentlyViewed } from '@/libs/hooks/use-track-recently-viewed';
import { Ruleset } from '@/libs/modules/ruleset/ruleset';

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

  const historyData = useSearchHistory(
    isHistoryView ? id : '',
    currentPage,
    currentPageSize
  );
  const {
    ruleSet,
    error,
    isLoading: isRuleSetLoading,
  } = useSearchRuleSetPreview(isHistoryView ? '' : id);

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
    currentData: { data: ruleSet, isLoading: isRuleSetLoading },
  });

  const {
    updateRuleSet,
    isSaving,
    error: updateError,
  } = useSearchRuleSetUpdate();
  const shouldUseV1 = useOptimisticLockingFlag();

  const {
    conflict,
    isOverwriting,
    runSave,
    handleOverwrite,
    handleDiscard,
    closeConflict,
  } = useSaveConflict<
    MerchandisingReturnedKeywordRuleSet,
    {
      searchTerms?: Array<string>;
      ruleSetId: string;
      ruleSet: MerchandisingRuleSet;
    }
  >({
    save: (
      { searchTerms, ruleSetId, ruleSet: ruleSetBody },
      versionOverride
    ) => {
      // istanbul ignore next
      if (!searchTerms?.[0]) return Promise.resolve({ status: 'error' });

      return updateRuleSet({
        searchTerms,
        isEnabled: ruleSetBody.isEnabled,
        ruleSetId,
        rules: ruleSetBody.rules,
        ...(ruleSetBody.excludedFacets && {
          excludedFacets: ruleSetBody.excludedFacets,
        }),
        ...(ruleSetBody.facets && { facets: ruleSetBody.facets }),
        ...(ruleSetBody.endDate && { endDate: ruleSetBody.endDate }),
        ...(ruleSetBody.startDate && { startDate: ruleSetBody.startDate }),
        ...(ruleSetBody.countryCode && {
          countryCode: ruleSetBody.countryCode,
        }),
        version: versionOverride ?? ruleSet.version,
        shouldUseV1,
      });
    },
    onSuccess: () => router.push('/search'),
  });

  const conflictDiffItems = useRulesetDiff(
    ruleSet,
    conflict?.currentEntity ?? ruleSet,
    {
      originalSearchTerms: ruleSet.searchTerms,
      currentSearchTerms: (conflict?.currentEntity ?? ruleSet).searchTerms,
    }
  );

  useTrackRecentlyViewed({
    id: rulesetData?.id,
    label: rulesetData?.searchTerms?.join(' | '),
    url: ROUTES.SEARCH.RULESETS.EDIT(id),
    type: 'search',
  });

  const { hasReadAccess, hasWriteAccess, requiredReadRole } =
    useAccess('Search');

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Edit search ranking rule</title>
      </Head>
      <Heading
        breadcrumbs={['Search & Merchandising', 'Site search', 'Ranking rules']}
      />

      {(error || updateError || historyError) && (
        <ErrorMessage centred>
          {error || updateError || historyError}
        </ErrorMessage>
      )}

      {!isLoading && rulesetData && (
        <>
          <Ruleset
            isEnabled={rulesetData.isEnabled}
            lastChanged={rulesetData.lastChanged}
            onCancel={() => router.push('/search')}
            onSave={runSave}
            originalRuleset={isHistoryView ? undefined : ruleSet}
            rulesetId={rulesetData.id}
            rulesetMerchandisingRules={rulesetData.rules}
            rulesetType="search"
            searchTerms={rulesetData.searchTerms}
            rulesetFacets={rulesetData.facets}
            rulesetExcludedFacets={rulesetData.excludedFacets}
            startDate={rulesetData.startDate}
            endDate={rulesetData.endDate}
            countryCode={rulesetData.countryCode}
            isWriteEnabled={hasWriteAccess && !isHistoryView}
          />
          <ConflictModal
            opened={conflict !== null}
            entityLabel="keyword ruleset"
            diffItems={conflictDiffItems}
            changedBy={conflict?.currentEntity.lastChanged.user}
            isSaving={isOverwriting}
            onOverwrite={handleOverwrite}
            onDiscard={handleDiscard}
            onClose={closeConflict}
          />
        </>
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
