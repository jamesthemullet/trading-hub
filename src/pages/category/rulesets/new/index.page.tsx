import { useRouter } from 'next/router';

import type { CategoryRuleSet } from '@/libs/api';
import { Heading } from '@/libs/components';
import { useRuleSetCreate } from '@/libs/hooks';
import { Ruleset } from '@/libs/modules/ruleset/ruleset';

const NewRuleSetPage = () => {
  const { handlePost } = useRuleSetCreate();
  const router = useRouter();

  const createNewCategoryRuleSet = async ({
    rules,
    facets,
    categoryId,
  }: CategoryRuleSet) => {
    const resp = await handlePost({
      facets,
      categoryId,
      merchandisingRules: rules,
    });

    if (resp) {
      return router.push('/category/rulesets');
    }
  };

  return (
    <>
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
