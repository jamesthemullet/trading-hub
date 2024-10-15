import { useRouter } from 'next/router';

import type { KeywordRuleSet } from '@/libs/api';
import { Heading } from '@/libs/components';
import { useSearchRuleSetCreate } from '@/libs/hooks';
import { Ruleset } from '@/libs/modules/ruleset/ruleset';

const NewRuleSetPage = () => {
  const { createRuleset } = useSearchRuleSetCreate();
  const router = useRouter();

  const createNewKeywordRuleset = async ({
    rules,
    searchTerms,
    startDate,
    endDate,
  }: KeywordRuleSet) => {
    const resp = await createRuleset({
      searchTerms,
      merchandisingRules: rules,
      startDate,
      endDate,
    });

    if (resp) {
      return router.push('/search/rulesets');
    }
  };

  return (
    <>
      <Heading
        breadcrumbs={['Search & Merchandising', 'Site search', 'Ranking rules']}
      />

      <Ruleset
        isEnabled={true}
        onCreateKeywordSearchRuleset={createNewKeywordRuleset}
        onCancel={() => router.push('/search/rulesets')}
        rulesetType="search"
      />
    </>
  );
};

export default NewRuleSetPage;
