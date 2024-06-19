import { useRouter } from 'next/router';

import { Heading } from '@/libs/components';
import { useGlobalRuleSetDetail } from '@/libs/hooks';
import { Ruleset } from '@/libs/modules/ruleset/ruleset';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';

type PageProps = {
  id: string;
};

const Page = ({ id }: PageProps) => {
  const { globalRuleSet } = useGlobalRuleSetDetail(id);
  const router = useRouter();

  // istanbul ignore next
  const saveRuleSet = async () => {
    console.log('TODO');
  };

  return (
    <>
      <Heading
        breadcrumbs={['Setup', 'Global Ranking Rules', 'Product Grid']}
      />

      <Ruleset
        isEnabled={globalRuleSet.isEnabled}
        onSave={saveRuleSet}
        onCancel={() => router.push('/global/rulesets')}
        rulesetMerchandisingRules={globalRuleSet.rules}
        rulesetType="global"
      />
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
