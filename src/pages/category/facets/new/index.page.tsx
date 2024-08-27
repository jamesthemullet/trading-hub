import { useRouter } from 'next/router';

import { ErrorMessage, Heading } from '@/libs/components';
import { useRuleSetCreate } from '@/libs/hooks';
import { FacetsPanel } from '@/libs/modules/facets-panel/facets-panel';

const Page = () => {
  const { handlePost, error } = useRuleSetCreate();
  const router = useRouter();

  const createNewCategoryRuleSet = async (categoryId: string) => {
    const resp = await handlePost({
      facets: [],
      categoryId,
      merchandisingRules: {
        pinnedProducts: [],
        blockedProducts: [],
        boosts: {
          alphanumeric: [],
          numeric: [],
          product: [],
        },
        buries: {
          alphanumeric: [],
          numeric: [],
          product: [],
        },
        includes: {
          alphanumeric: [],
        },
        excludes: {
          alphanumeric: [],
        },
      },
    });

    if (resp) {
      return router.push('/category/facets');
    }
  };

  const handleCancel = () => {
    router.push('/category/facets');
  };

  const defaultMerchandisingRules = {
    pinnedProducts: [],
    blockedProducts: [],
    boosts: { alphanumeric: [], numeric: [], product: [] },
    buries: {
      alphanumeric: [],
      numeric: [],
      product: [],
    },
    includes: {
      alphanumeric: [],
    },
    excludes: {
      alphanumeric: [],
    },
  };

  return (
    <>
      <Heading breadcrumbs={['Categories', 'Facet Management', 'New']} />

      <ErrorMessage>{error}</ErrorMessage>

      <FacetsPanel
        onSave={createNewCategoryRuleSet}
        onCancel={handleCancel}
        isNewRuleset={true}
        title="Facet Rule Editor"
        facetsData={[]}
        includedFacets={[]}
        facetType="category"
        rulesetMerchandisingRules={defaultMerchandisingRules}
      />
    </>
  );
};

export default Page;
