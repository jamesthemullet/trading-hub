import { useRouter } from 'next/router';

import type { RuleSet } from '@/libs/api';
import { ErrorMessage, Heading, Loader } from '@/libs/components';
import { useRuleSetPreview, useUpdateRuleSet } from '@/libs/hooks';
import { Ruleset } from '@/libs/modules/ruleset/ruleset';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';

type PageProps = {
  id: string;
};

const Page = ({ id }: PageProps) => {
  const { ruleSetDetail } = useRuleSetPreview(id);
  const { updateRuleSet, isSaving, error } = useUpdateRuleSet();
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
    const response = await updateRuleSet({
      ruleSetId,
      rules: ruleSet,
      categoryId: categoryIds[0],
    });
    if (response.status === 'success') {
      router.push('/category/rulesets');
    }
  };

  return (
    <>
      <Heading breadcrumbs={['Categories', 'Ranking rules', 'Product Grid']} />

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {ruleSetDetail.categoryName && (
        <Ruleset
          isEnabled={ruleSetDetail.isEnabled}
          onSave={saveRuleSet}
          onCancel={() => router.push('/category/rulesets')}
          rulesetCategory={{
            identifier: ruleSetDetail.categoryId,
            name: ruleSetDetail.categoryName,
            path: 'path/to/plp',
          }}
          rulesetId={ruleSetDetail.id}
          rulesetMerchandisingRules={ruleSetDetail.rules}
          rulesetType="category"
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
