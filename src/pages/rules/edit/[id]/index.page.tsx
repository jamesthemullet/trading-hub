import { Heading } from '@/libs/components';
import type { GetServerSideProps, GetServerSidePropsContext } from 'next';

import type { MerchandisingRules, RuleSetFacetConfigWithId } from '@/libs/api';
import { useUpdateRuleSet, useRuleSetPreview } from '@/libs/hooks';
import { Ruleset } from '../../../../libs/modules/ruleset/ruleset';
import { useRouter } from 'next/router';

type PageProps = {
  id: string;
};

const Page = ({ id }: PageProps) => {
  const { ruleSets } = useRuleSetPreview(id);
  const { updateRuleSet } = useUpdateRuleSet();
  const router = useRouter();

  const saveRuleSet = async ({
    categoryId,
    facets,
    isEnabled,
    merchandisingRules,
    rulesetId,
  }: {
    categoryId: string;
    facets?: Array<RuleSetFacetConfigWithId>;
    isEnabled: boolean;
    merchandisingRules: MerchandisingRules;
    rulesetId: string;
  }) => {
    await updateRuleSet({
      facets,
      id: rulesetId,
      isEnabled,
      pinnedProducts: merchandisingRules.pinnedProducts,
      categoryId,
    });
  };

  return (
    <>
      <Heading breadcrumbs={['Categories', 'Ranking rules', 'Product Grid']} />

      {ruleSets.categoryName && (
        <Ruleset
          isEnabled={ruleSets.isEnabled}
          onSave={saveRuleSet}
          onCancel={() => router.push('/rules')}
          rulesetCategory={{
            identifier: ruleSets.categoryId,
            name: ruleSets.categoryName,
            path: 'path/to/plp',
          }}
          rulesetId={ruleSets.id}
          rulesetMerchandisingRules={ruleSets.rules}
        />
      )}
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
