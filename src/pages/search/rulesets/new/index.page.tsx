import { useRouter } from 'next/router';

import type { KeywordRuleSet } from '@/libs/api';
import { Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { useSearchRuleSetCreate } from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';
import { Ruleset } from '@/libs/modules/ruleset/ruleset';

import Head from 'next/head';

import { SEARCH_READ_ROLE, SEARCH_WRITE_ROLE } from '../../search-config';

const NewRuleSetPage = () => {
  const { createRuleset } = useSearchRuleSetCreate();
  const router = useRouter();

  const createNewKeywordRuleset = async ({
    rules,
    searchTerms,
    startDate,
    endDate,
    countryCode,
  }: KeywordRuleSet) => {
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

  const { hasReadAccess, hasWriteAccess } = useAccess({
    readRole: SEARCH_READ_ROLE,
    writeRole: SEARCH_WRITE_ROLE,
  });

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={SEARCH_READ_ROLE} />;
  }

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Create search ranking rule</title>
      </Head>
      <Heading
        breadcrumbs={['Search & Merchandising', 'Site search', 'Ranking rules']}
      />

      <Ruleset
        isEnabled={true}
        onCreateKeywordSearchRuleset={createNewKeywordRuleset}
        onCancel={() => router.push('/search/rulesets')}
        rulesetType="search"
        writeEnabled={hasWriteAccess}
      />
    </>
  );
};

export default NewRuleSetPage;
