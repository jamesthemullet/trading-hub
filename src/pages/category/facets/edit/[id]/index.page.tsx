import { useRouter } from 'next/router';

import type { MerchandisingRuleSet } from '@/libs/api';
import { ErrorMessage, Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { FacetType } from '@/libs/constants/rule-types';
import { FacetsPanelSkeleton } from '@/libs/containers';
import { FacetsList } from '@/libs/features';
import { useRuleSetDetail, useUpdateRuleSet } from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';

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
    isLoading,
    error: getRulesetDetailError,
  } = useRuleSetDetail(id);

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
          categoriesInfo={ruleSetDetail.categoriesInfo}
          isNewRuleset={false}
          currentRuleset={ruleSetDetail}
          onCancel={handleCancel}
          onSave={handleSave}
          writeEnabled={hasWriteAccess}
        />
      )}
    </>
  );
};

export default Page;
