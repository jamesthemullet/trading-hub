import { useRouter } from 'next/router';

import type { RuleSet } from '@/libs/api';
import { ErrorMessage, Heading, Loader } from '@/libs/components';
import { useRuleSetDetail, useUpdateRuleSet } from '@/libs/hooks';
import { Ruleset } from '@/libs/modules/ruleset/ruleset';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';

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
    categoryId?: string;
    categoryIds?: Array<string>;
    ruleSetId: string;
    ruleSet: RuleSet;
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
    });
    if (response.status === 'success') {
      router.push('/category/rulesets');
    }
  };

  return (
    <>
      <Heading breadcrumbs={['Categories', 'Ranking rules', 'Product Grid']} />

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {isLoading ? (
        <Loader />
      ) : (
        <Ruleset
          isEnabled={ruleSetDetail.isEnabled}
          onSave={saveRuleSet}
          onCancel={() => router.push('/category/rulesets')}
          categoryIds={ruleSetDetail.categoriesInfo.map(
            (category) => category.id
          )}
          rulesetFacets={ruleSetDetail.facets}
          rulesetExcludedFacets={ruleSetDetail.excludedFacets}
          rulesetId={ruleSetDetail.id}
          rulesetMerchandisingRules={ruleSetDetail.rules}
          rulesetType="category"
          startDate={ruleSetDetail.startDate}
          endDate={ruleSetDetail.endDate}
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
