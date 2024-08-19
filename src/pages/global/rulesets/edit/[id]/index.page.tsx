import { useRouter } from 'next/router';

import { RuleSet } from '@/libs/api';
import { Heading, Loader } from '@/libs/components';
import { useGlobalRuleSetDetail, useGlobalRuleSetUpdate } from '@/libs/hooks';
import { Ruleset } from '@/libs/modules/ruleset/ruleset';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';

type PageProps = {
  id: string;
};

const Page = ({ id }: PageProps) => {
  const { globalRuleSet, isLoading } = useGlobalRuleSetDetail(id);

  const { saveGlobalRuleset } = useGlobalRuleSetUpdate();
  const router = useRouter();

  const saveRuleSet = async ({
    ruleSetId,
    ruleSet,
  }: {
    ruleSetId: string;
    ruleSet: RuleSet;
  }) => {
    await saveGlobalRuleset({
      ruleSetId,
      ruleSet,
    }).then(() => {
      router.push('/global/rulesets');
    });
  };

  return (
    <>
      <Heading
        breadcrumbs={['Setup', 'Global Ranking Rules', 'Product Grid']}
      />

      {isLoading ? (
        <Loader />
      ) : (
        <Ruleset
          isEnabled={globalRuleSet.isEnabled}
          onSave={saveRuleSet}
          onCancel={() => router.push('/global/rulesets')}
          rulesetMerchandisingRules={globalRuleSet.rules}
          rulesetFacets={globalRuleSet.facets}
          rulesetType="global"
          rulesetId={id}
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
