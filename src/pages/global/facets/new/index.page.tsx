import { useRouter } from 'next/router';

import type { MerchandisingRuleSet } from '@/libs/api';
import { ErrorMessage, Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { useGlobalRuleSetCreate } from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';
import { FacetList } from '@/libs/modules/facet-list/facet-list';

import Head from 'next/head';

const Page = () => {
  const { createGlobalRuleSet, error } = useGlobalRuleSetCreate();
  const router = useRouter();

  const createNewGlobalRuleSet = async (args: MerchandisingRuleSet) => {
    const resp = await createGlobalRuleSet(args);

    // istanbul ignore else
    if (resp) {
      return router.push('/global');
    }
  };

  const handleCancel = () => {
    router.push('/global');
  };

  const { hasReadAccess, requiredReadRole, hasWriteAccess } = useAccess('Glob');

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Create Global Ruleset</title>
      </Head>
      <Heading breadcrumbs={['Global', 'Facet Management', 'New']} />

      {error && (
        <ErrorMessage>
          Error whilst creating new global rule set: {error}
        </ErrorMessage>
      )}

      <FacetList
        facetType="global"
        isNewRuleset
        onCancel={handleCancel}
        onSave={createNewGlobalRuleSet}
        writeEnabled={hasWriteAccess}
      />
    </>
  );
};

export default Page;
