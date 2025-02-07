import { useRouter } from 'next/router';

import { RuleSet } from '@/libs/api';
import { ErrorMessage, Heading, Loader } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { useGlobalRuleSetDetail, useGlobalRuleSetUpdate } from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';
import { Ruleset } from '@/libs/modules/ruleset/ruleset';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Head from 'next/head';

type PageProps = {
  id: string;
};

const Page = ({ id }: PageProps) => {
  const { globalRuleSet, isLoading } = useGlobalRuleSetDetail(id);

  const { saveGlobalRuleset, error } = useGlobalRuleSetUpdate();
  const router = useRouter();

  const saveRuleSet = async ({
    ruleSetId,
    ruleSet,
  }: {
    ruleSetId: string;
    ruleSet: RuleSet;
  }) => {
    const response = await saveGlobalRuleset({
      ruleSetId,
      ruleSet,
    });

    if (response.status === 'success') {
      router.push('/global/rulesets');
    }
  };

  const { hasReadAccess, hasWriteAccess, requiredReadRole } = useAccess('Glob');

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Edit global ruleset</title>
      </Head>
      <main>
        <Heading
          breadcrumbs={['Setup', 'Global Ranking Rules', 'Product Grid']}
        />

        {error && <ErrorMessage>{error}</ErrorMessage>}

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
      </main>
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
