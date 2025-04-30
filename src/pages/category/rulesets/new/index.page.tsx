import { useRouter } from 'next/router';

import type { MerchandisingCategoryRuleSet } from '@/libs/api';
import { Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { useRuleSetCreate } from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';
import { Ruleset } from '@/libs/modules/ruleset/ruleset';

import Head from 'next/head';

const NewRuleSetPage = () => {
  const { createRuleset } = useRuleSetCreate();
  const router = useRouter();

  const createNewCategoryRuleSet = async ({
    rules,
    facets,
    categoryIds,
    startDate,
    endDate,
    countryCode,
  }: Required<Pick<MerchandisingCategoryRuleSet, 'facets'>> &
    MerchandisingCategoryRuleSet) => {
    const resp = await createRuleset({
      facets,
      isEnabled: true,
      categoryIds,
      rules,
      startDate,
      endDate,
      countryCode,
    });

    if (resp) {
      return router.push('/category/rulesets');
    }
  };

  const { hasReadAccess, hasWriteAccess, requiredReadRole } = useAccess('Cat');

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Create Category Ruleset</title>
      </Head>
      <>
        <Heading
          breadcrumbs={['Categories', 'Ranking rules', 'Product Grid']}
        />

        <Ruleset
          isEnabled={true}
          onCreate={createNewCategoryRuleSet}
          onCancel={() => router.push('/category/rulesets')}
          rulesetType="category"
          writeEnabled={hasWriteAccess}
        />
      </>
    </>
  );
};

export default NewRuleSetPage;
