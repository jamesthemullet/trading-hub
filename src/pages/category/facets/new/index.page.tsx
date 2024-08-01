import { useRouter } from 'next/router';

import { Heading } from '@/libs/components';
import { FacetsPanel } from '@/libs/modules/facets-panel/facets-panel';

const Page = () => {
  const router = useRouter();

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('save');
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
  };

  return (
    <>
      <Heading breadcrumbs={['Categories', 'Facet Management', 'New']} />

      <FacetsPanel
        onSave={handleSave}
        onCancel={handleCancel}
        isNewRuleset
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
