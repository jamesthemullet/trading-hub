import type { MerchandisingRules } from '@/libs/api';
import { useRouter } from 'next/router';
import { Heading } from '@/libs/components';
import { useRuleSetCreate } from '@/libs/hooks';
import { Ruleset } from '../../../libs/modules/ruleset/ruleset';

const NewRuleSetPage = () => {
  const { handlePost } = useRuleSetCreate();
  const router = useRouter();

  const createNewCategory = async ({
    merchandisingRules,
    categoryId,
  }: {
    merchandisingRules: MerchandisingRules;
    categoryId: string;
  }) => {
    const resp = await handlePost({
      categoryId,
      merchandisingRules,
    });

    if (resp) {
      return router.push(`/rules/edit/${resp.id}`);
    }
  };

  return (
    <>
      <Heading breadcrumbs={['Categories', 'Ranking rules', 'Product Grid']} />

      <Ruleset
        isEnabled={true}
        onCreate={createNewCategory}
        onCancel={() => router.push('/rules')}
      />
    </>
  );
};

export default NewRuleSetPage;
