import { useRouter } from 'next/router';

import type { MerchandisingKeywordRuleSet } from '@/libs/api';
import { Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { useSearchRuleSetCreate } from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';
import { Ruleset } from '@/libs/modules/ruleset/ruleset';

import Head from 'next/head';

const NewRuleSetPage = () => {
  const { createRuleset } = useSearchRuleSetCreate();
  const router = useRouter();

  const createNewKeywordRuleset = async ({
    rules,
    searchTerms,
    startDate,
    endDate,
    countryCode,
  }: MerchandisingKeywordRuleSet) => {
    const resp = await createRuleset({
      searchTerms,
      merchandisingRules: rules,
      includedFacets: [],
      excludedFacets: { facets: [] },
      startDate,
      endDate,
      countryCode,
    });

    if (resp) {
      return router.push('/search/rulesets');
    }
  };

  const { hasReadAccess, hasWriteAccess, requiredReadRole } =
    useAccess('Search');

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Create search ranking rule</title>
      </Head>
      <main>
        <Heading
          breadcrumbs={[
            'Search & Merchandising',
            'Site search',
            'Ranking rules',
          ]}
        />

        <Ruleset
          isEnabled={true}
          onCreateKeywordSearchRuleset={createNewKeywordRuleset}
          onCancel={() => router.push('/search/rulesets')}
          rulesetType="search"
          writeEnabled={hasWriteAccess}
        />
      </main>
    </>
  );
};

export default NewRuleSetPage;
