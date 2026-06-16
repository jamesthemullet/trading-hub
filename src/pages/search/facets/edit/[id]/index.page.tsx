import type { ReactElement } from 'react';
import { useRouter } from 'next/router';

import type { MerchandisingRuleSet } from '@/libs/api';
import { ErrorMessage, Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { ROUTES } from '@/libs/constants/routes';
import { FacetType } from '@/libs/constants/rule-types';
import { FacetsPanelSkeleton } from '@/libs/containers';
import { FacetsList } from '@/libs/features';
import { useSearchRuleSetPreview, useSearchRuleSetUpdate } from '@/libs/hooks';
import { useSearchHistory } from '@/libs/hooks/search/history/use-search-history';
import { useAccess } from '@/libs/hooks/use-access';
import { useHistoricalOrCurrentRuleset } from '@/libs/hooks/use-historical-or-current-ruleset';
import { useTrackRecentlyViewed } from '@/libs/hooks/use-track-recently-viewed';

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

  const { updateRuleSet, error: updateRuleSetError } = useSearchRuleSetUpdate();

  const handleSave = async ({
    facets,
    excludedFacets,
    countryCode,
    searchTerms,
    startDate,
    endDate,
  }: MerchandisingRuleSet & { searchTerms?: string[] }) => {
    // istanbul ignore next
    if (!searchTerms) {
      return;
    }

    const response = await updateRuleSet({
      searchTerms,
      rules: ruleSet.rules,
      facets,
      isEnabled: ruleSet.isEnabled,
      ...(startDate && { startDate: new Date(startDate).toISOString() }),
      ...(endDate && {
        endDate: new Date(endDate).toISOString(),
      }),
      ruleSetId: id,
      excludedFacets,
      countryCode,
    });

    // istanbul ignore else
    if (response) {
      return router.push('/search');
    }
  };

  const handleCancel = () => {
    router.push('/search');
  };

  const {
    ruleSet,
    error,
    isLoading: isCurrentLoading,
  } = useSearchRuleSetPreview(isHistoryView ? '' : id);

  const historyData = useSearchHistory(
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
    currentData: { data: ruleSet, isLoading: isCurrentLoading },
  });

  const { hasReadAccess, requiredReadRole, hasWriteAccess } =
    useAccess('Search');

  useTrackRecentlyViewed({
    id,
    label: rulesetData?.searchTerms?.join(' | '),
    url: ROUTES.SEARCH.RULESETS.EDIT(id),
    type: 'search',
  });

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Edit Search Facets</title>
      </Head>
      <Heading breadcrumbs={['Search', 'Facet Management', 'Editor']} />

      {error && (
        <ErrorMessage>Error whilst retrieving ruleset: {error}</ErrorMessage>
      )}
      {historyError && (
        <ErrorMessage>
          Error whilst retrieving history: {historyError}
        </ErrorMessage>
      )}
      {updateRuleSetError && (
        <ErrorMessage>
          Error whilst updating ruleset: {updateRuleSetError}
        </ErrorMessage>
      )}

      {isLoading ? (
        <FacetsPanelSkeleton title="Facet Rule Editor" aria-busy="true" />
      ) : (
        <FacetsList
          facetType={FacetType.Search}
          currentRuleset={rulesetData}
          searchTerms={rulesetData?.searchTerms}
          isNewRuleset={false}
          onCancel={handleCancel}
          onSave={handleSave}
          isWriteEnabled={hasWriteAccess && !isHistoryView}
        />
      )}
    </>
  );
};

export default Page;
