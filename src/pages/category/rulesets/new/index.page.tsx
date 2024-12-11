import { useRouter } from 'next/router';

import type { CategoryRuleSet } from '@/libs/api';
import { Heading } from '@/libs/components';
import { useRuleSetCreate } from '@/libs/hooks';
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
  }: Required<Pick<CategoryRuleSet, 'facets'>> & CategoryRuleSet) => {
    const resp = await createRuleset({
      facets: facets,
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

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Create Category Ruleset</title>
      </Head>
      <Heading breadcrumbs={['Categories', 'Ranking rules', 'Product Grid']} />

      <Ruleset
        isEnabled={true}
        onCreate={createNewCategoryRuleSet}
        onCancel={() => router.push('/category/rulesets')}
        rulesetType="category"
      />
    </>
  );
};

export default NewRuleSetPage;
