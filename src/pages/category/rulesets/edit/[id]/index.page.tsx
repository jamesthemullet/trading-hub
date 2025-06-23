import { useRouter } from 'next/router';

import type { MerchandisingRuleSet } from '@/libs/api';
import { ErrorMessage, Heading, Loader } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { useRuleSetDetail } from '@/libs/hooks/category/rulesets/use-rule-set-detail';
import { useAccess } from '@/libs/hooks/use-access';
import { useUpdateRuleSet } from '@/libs/hooks/use-rule-set-update';
import { Ruleset } from '@/libs/modules/ruleset/ruleset';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Head from 'next/head';

type PageProps = {
  id: string;
};

const Page = ({ id }: PageProps) => {
  const { ruleSetDetail, isLoading } = useRuleSetDetail(id);

  const { updateCategoryRuleSet, isSaving, error } = useUpdateRuleSet();
  const router = useRouter();

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
      router.push('/category/rulesets');
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
      <>
        <Heading
          breadcrumbs={['Categories', 'Ranking rules', 'Product Grid']}
        />

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {isLoading ? (
          <Loader />
        ) : (
          <Ruleset
            isEnabled={ruleSetDetail.isEnabled}
            onSave={saveRuleSet}
            onCancel={() => router.push('/category/rulesets')}
            categoriesInfo={ruleSetDetail.categoriesInfo}
            rulesetFacets={ruleSetDetail.facets}
            rulesetExcludedFacets={ruleSetDetail.excludedFacets}
            rulesetId={ruleSetDetail.id}
            rulesetMerchandisingRules={ruleSetDetail.rules}
            rulesetType="category"
            startDate={ruleSetDetail.startDate}
            endDate={ruleSetDetail.endDate}
            countryCode={ruleSetDetail.countryCode}
            writeEnabled={hasWriteAccess}
          />
        )}

        {isSaving && <Loader />}
      </>
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
