import type { ReactElement } from 'react';
import { useRouter } from 'next/router';

import type { MerchandisingRuleSet } from '@/libs/api';
import { ErrorMessage, Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { FacetType } from '@/libs/constants/rule-types';
import { FacetsPanelSkeleton } from '@/libs/containers';
import { FacetsList } from '@/libs/features';
import { useRuleSetDetail, useUpdateRuleSet } from '@/libs/hooks';
import { useCategoryHistory } from '@/libs/hooks/category/history/use-category-history';
import { useAccess } from '@/libs/hooks/use-access';
import { useHistoricalOrCurrentRuleset } from '@/libs/hooks/use-historical-or-current-ruleset';

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

  const handleSave = async ({
    facets,
    excludedFacets,
    countryCode,
    categoryIds,
    startDate,
    endDate,
  }: MerchandisingRuleSet & { categoryIds?: string[] }) => {
    // istanbul ignore next
    if (!categoryIds) {
      return;
    }

    const response = await updateCategoryRuleSet({
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
    });
    // istanbul ignore else
    if (response && response.status !== 'error') {
      return router.push('/category');
    }
  };

  const handleCancel = () => {
    router.push('/category');
  };

  const {
    ruleSetDetail,
    isLoading: isCurrentLoading,
    error: getRulesetDetailError,
  } = useRuleSetDetail(isHistoryView ? '' : id);

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

  const { hasReadAccess, requiredReadRole, hasWriteAccess } = useAccess('Cat');

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
        <FacetsList
          facetType={FacetType.Category}
          categoriesInfo={rulesetData?.categoriesInfo}
          isNewRuleset={false}
          currentRuleset={rulesetData}
          onCancel={handleCancel}
          onSave={handleSave}
          isWriteEnabled={hasWriteAccess && !isHistoryView}
        />
      )}
    </>
  );
};

export default Page;
