import { useRouter } from 'next/router';

import type {
  MerchandisingAttributeValuesResponse,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';

import { FacetAttributesPageLayoutHeader } from '../facet-attributes-page-layout-header/facet-attributes-page-layout-header';

type PageLayout = {
  attributeValues: MerchandisingAttributeValuesResponse['values'];
  facets?: MerchandisingRuleSetFacetConfigWithId[];
  facetId: string;
  displayName: string;
  facetType: 'category' | 'search';
  ruleSetId: string;
};

export const CategoryAndSearchFacetsPanelPageLayout = ({
  attributeValues,
  facets,
  facetId,
  displayName,
  facetType,
  ruleSetId,
}: PageLayout) => {
  const router = useRouter();
  // state management needs to go here?

  const facet = facets?.find((facet) => facet.id === facetId);
  const includedValues = facet?.boosted || [];
  const excludedValues = facet?.excludedValues || [];
  return (
    <>
      <FacetAttributesPageLayoutHeader
        algoControlValues={
          attributeValues.length - includedValues.length - excludedValues.length
        }
        includedValues={includedValues.length}
        excludedValues={excludedValues.length}
        displayName={displayName}
        facetType={facetType}
        onClose={() => {
          router.push(`/${facetType}/facets/edit/${ruleSetId}`);
        }}
        onSave={() => console.log('save')}
        isSaveDisabled={false}
      />
      <p>hello category/search values... </p>
    </>
  );
};
