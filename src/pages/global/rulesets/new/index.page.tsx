import type { ReactElement } from 'react';
import { useRouter } from 'next/router';

import type { MerchandisingRuleSet } from '@/libs/api/generated/open-api';
import { ErrorMessage, Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { useGlobalRuleSetCreate } from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';
import { Ruleset } from '@/libs/modules/ruleset/ruleset';

import Head from 'next/head';

const NewRuleSetPage = (): ReactElement => {
  const { createGlobalRuleSet, error } = useGlobalRuleSetCreate();
  const router = useRouter();
  const catalogue =
    router.query.catalogue?.toString() === 'CFTO'
      ? 'CFTO'
      : 'CLOTHING_AND_HOME';

  const createNewGlobalRuleSet = async (args: MerchandisingRuleSet) => {
    const resp = await createGlobalRuleSet(args, catalogue);

    // istanbul ignore else
    if (resp) {
      return router.push(`/global?catalogue=${catalogue}`);
    }
  };

  const { hasReadAccess, hasWriteAccess, requiredReadRole } = useAccess('Glob');

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Create Global Ruleset</title>
      </Head>

      <Heading breadcrumbs={['Global', 'Ranking rules', 'Product Grid']} />

      {error && (
        <ErrorMessage>
          Error whilst creating new global rule set: {error}
        </ErrorMessage>
      )}

      <Ruleset
        isEnabled
        onCreateGlobalRuleset={createNewGlobalRuleSet}
        onCancel={() => router.push(`/global?catalogue=${catalogue}`)}
        rulesetType="global"
        isWriteEnabled={hasWriteAccess}
      />
    </>
  );
};

export default NewRuleSetPage;
