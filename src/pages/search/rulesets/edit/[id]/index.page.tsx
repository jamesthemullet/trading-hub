import { useRouter } from 'next/router';

import type { MerchandisingRuleSet } from '@/libs/api';
import { ErrorMessage, Heading, Loader } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { useSearchRuleSetPreview, useSearchRuleSetUpdate } from '@/libs/hooks';
import { useSearchHistory } from '@/libs/hooks/search/history/use-search-history';
import { useAccess } from '@/libs/hooks/use-access';
import { useHistoricalOrCurrentRuleset } from '@/libs/hooks/use-historical-or-current-ruleset';
import { Ruleset } from '@/libs/modules/ruleset/ruleset';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Head from 'next/head';

type PageProps = {
  id: string;
};

const Page = ({ id }: PageProps) => {
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

  const { updateRuleSet, isSaving } = useSearchRuleSetUpdate();

  const saveRuleSet = async ({
    searchTerms,
    ruleSetId,
    ruleSet,
  }: {
    searchTerms?: Array<string>;
    ruleSetId: string;
    ruleSet: MerchandisingRuleSet;
  }) => {
    // istanbul ignore next
    if (!searchTerms?.[0]) return;
    await updateRuleSet({
      searchTerms,
      isEnabled: ruleSet.isEnabled,
      ruleSetId,
      rules: ruleSet.rules,
      ...(ruleSet.excludedFacets && { excludedFacets: ruleSet.excludedFacets }),
      ...(ruleSet.facets && { facets: ruleSet.facets }),
      ...(ruleSet.endDate && { endDate: ruleSet.endDate }),
      ...(ruleSet.startDate && { startDate: ruleSet.startDate }),
      ...(ruleSet.countryCode && { countryCode: ruleSet.countryCode }),
    }).then(() => {
      router.push('/search');
    });
  };

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

      {(error || historyError) && (
        <ErrorMessage centred>{error || historyError}</ErrorMessage>
      )}

      {!isLoading && rulesetData && (
        <Ruleset
          isEnabled={rulesetData.isEnabled}
          onCancel={() => router.push('/search')}
          onSave={saveRuleSet}
          rulesetId={rulesetData.id}
          rulesetMerchandisingRules={rulesetData.rules}
          rulesetType="search"
          searchTerms={rulesetData.searchTerms}
          rulesetFacets={rulesetData.facets}
          rulesetExcludedFacets={rulesetData.excludedFacets}
          startDate={rulesetData.startDate}
          endDate={rulesetData.endDate}
          countryCode={rulesetData.countryCode}
          writeEnabled={hasWriteAccess && !isHistoryView}
        />
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
