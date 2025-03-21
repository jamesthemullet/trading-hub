import { useRouter } from 'next/router';

import type { CountryCode, ExcludedFacets, ReturnedFacet } from '@/libs/api';
import { ErrorMessage, Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { useRuleSetDetail, useUpdateRuleSet } from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';
import CategoryFacetsPanel from '@/libs/modules/facets-panel/category-facets-panel';
import { FacetsPanelSkeleton } from '@/libs/modules/facets-panel/facets-panel-skeleton';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Head from 'next/head';

export const getServerSideProps: GetServerSideProps = (
  context: GetServerSidePropsContext
) => {
  return Promise.resolve({
    props: { id: context.query.id },
  });
};

const Page = ({ id }: { id: string }) => {
  const router = useRouter();

  const { updateCategoryRuleSet, error: updateRulesetError } =
    useUpdateRuleSet();

  const handleSave = async ({
    categoryIds,
    includedFacets,
    excludedFacets,
    countryCode,
    dateTime,
  }: {
    categoryIds: string[];
    includedFacets: ReturnedFacet[];
    excludedFacets: ExcludedFacets;
    countryCode: CountryCode;
    dateTime?: [Date | null, Date | null];
  }) => {
    const response = await updateCategoryRuleSet({
      categoryIds,
      rules: ruleSetDetail.rules,
      facets: includedFacets,
      isEnabled: ruleSetDetail.isEnabled,
      ...(dateTime?.[0] && { startDate: new Date(dateTime[0]).toISOString() }),
      ...(dateTime?.[1] && {
        endDate: new Date(dateTime[1]).toISOString(),
      }),
      ruleSetId: id,
      excludedFacets,
      countryCode,
    });
    if (response && response.status !== 'error') {
      return router.push('/category/facets/');
    }
  };

  const handleCancel = () => {
    router.push('/category/facets');
  };

  const {
    ruleSetDetail,
    isLoading,
    refreshRuleset,
    error: getRulesetDetailError,
  } = useRuleSetDetail(id);

  const { hasReadAccess, hasWriteAccess, requiredReadRole } = useAccess('Cat');

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
      {updateRulesetError && (
        <ErrorMessage>
          Error whilst updating ruleset: {updateRulesetError}
        </ErrorMessage>
      )}

      {isLoading ? (
        <FacetsPanelSkeleton title="Facet Rule Editor" aria-busy="true" />
      ) : (
        <CategoryFacetsPanel
          ruleSetIncludedFacets={ruleSetDetail.facets}
          ruleSetExcludedFacets={ruleSetDetail.excludedFacets}
          ruleSetRules={ruleSetDetail.rules}
          startDate={ruleSetDetail.startDate}
          endDate={ruleSetDetail.endDate}
          isLoading={isLoading}
          countryCode={ruleSetDetail.countryCode || 'UK_IE'}
          categoryIds={ruleSetDetail.categoriesInfo.map(
            (category) => category.id
          )}
          onSave={handleSave}
          onCancel={handleCancel}
          refreshData={refreshRuleset}
          writeEnabled={hasWriteAccess}
        />
      )}
    </>
  );
};

export default Page;
