import type { ReactElement } from 'react';
import { useRouter } from 'next/router';

import type { MerchandisingRuleSet } from '@/libs/api';
import { ErrorMessage, Heading, Loader } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { useCategoryHistory } from '@/libs/hooks/category/history/use-category-history';
import { useRuleSetDetail } from '@/libs/hooks/category/rulesets/use-rule-set-detail';
import { useAccess } from '@/libs/hooks/use-access';
import { useHistoricalOrCurrentRuleset } from '@/libs/hooks/use-historical-or-current-ruleset';
import { useUpdateRuleSet } from '@/libs/hooks/use-rule-set-update';
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

  const saveRuleSet = async ({
    categoryIds,
    ruleSetId,
    ruleSet,
  }: {
    categoryIds?: Array<string>;
    ruleSetId: string;
    ruleSet: MerchandisingRuleSet;
  }) => {
    // istanbul ignore next
    if (!categoryIds?.[0]) return;

    const response = await updateCategoryRuleSet({
      categoryIds,
      isEnabled: ruleSet.isEnabled,
      ruleSetId,
      rules: ruleSet.rules,
      ...(ruleSet.excludedFacets && { excludedFacets: ruleSet.excludedFacets }),
      ...(ruleSet.facets && { facets: ruleSet.facets }),
      ...(ruleSet.endDate && { endDate: ruleSet.endDate }),
      ...(ruleSet.startDate && { startDate: ruleSet.startDate }),
      ...(ruleSet.countryCode && { countryCode: ruleSet.countryCode }),
    });

    // istanbul ignore else
    if (response.status === 'success') {
      router.push('/category');
    }
  };

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
          <Ruleset
            isEnabled={rulesetData.isEnabled}
            onSave={saveRuleSet}
            onCancel={() => router.push('/category')}
            categoriesInfo={rulesetData.categoriesInfo}
            rulesetFacets={rulesetData.facets}
            rulesetExcludedFacets={rulesetData.excludedFacets}
            rulesetId={rulesetData.id}
            rulesetMerchandisingRules={rulesetData.rules}
            rulesetType="category"
            startDate={rulesetData.startDate}
            endDate={rulesetData.endDate}
            countryCode={rulesetData.countryCode}
            writeEnabled={hasWriteAccess && !isHistoryView}
          />
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
