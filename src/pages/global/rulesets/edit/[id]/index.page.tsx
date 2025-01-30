import { useRouter } from 'next/router';

import { RuleSet } from '@/libs/api';
import { Heading, Loader } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { useGlobalRuleSetDetail, useGlobalRuleSetUpdate } from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';
import { Ruleset } from '@/libs/modules/ruleset/ruleset';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Head from 'next/head';

import { GLOB_READ_ROLE, GLOB_WRITE_ROLE } from '../../../global-config';

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

  const { hasReadAccess, hasWriteAccess } = useAccess({
    readRole: GLOB_READ_ROLE,
    writeRole: GLOB_WRITE_ROLE,
  });

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={GLOB_READ_ROLE} />;
  }

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Edit global ruleset</title>
      </Head>
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
          rulesetExcludedFacets={globalRuleSet.excludedFacets}
          rulesetType="global"
          rulesetId={id}
          countryCode={globalRuleSet.countryCode}
          writeEnabled={hasWriteAccess}
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
