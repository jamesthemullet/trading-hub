import { useRouter } from 'next/router';

import type { MerchandisingRules, RuleSetFacetConfigWithId } from '@/libs/api';
import { Heading } from '@/libs/components';
import { useRuleSetCreate } from '@/libs/hooks';

import { Ruleset } from '../../../../libs/modules/ruleset/ruleset';

const NewRuleSetPage = () => {
  const { handlePost } = useRuleSetCreate();
  const router = useRouter();

  const createNewCategoryRuleSet = async ({
    facets,
    merchandisingRules,
    categoryId,
  }: {
    facets?: Array<RuleSetFacetConfigWithId>;
    merchandisingRules: MerchandisingRules;
    categoryId: string;
  }) => {
    const resp = await handlePost({
      facets,
      categoryId,
      merchandisingRules,
    });

    if (resp) {
      return router.push(`/category/rulesets/edit/${resp.id}`);
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
