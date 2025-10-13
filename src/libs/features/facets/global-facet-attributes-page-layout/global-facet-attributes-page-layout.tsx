import { useRouter } from 'next/router';

import type {
  MerchandisingAttributeValuesResponse,
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';

import { FacetAttributesPageLayoutHeader } from '../facet-attributes-page-layout-header/facet-attributes-page-layout-header';

type PageLayout = {
  attributeValues: MerchandisingAttributeValuesResponse['values'];
  facets: MerchandisingReturnedGlobalFacet[];
  facetId: string;
  displayName: string;
  ruleSetId: string;
};

export const GlobalFacetAttributesPageLayout = ({
  attributeValues,
  facets,
  facetId,
  displayName,
  ruleSetId,
}: PageLayout) => {
  const router = useRouter();
  // state management needs to go here?

  // probably need to take merge groups into account here, awaiting confirmation from design/product
  const includedValues =
    facets?.find((facet) => facet.id === facetId)?.boosted || [];

  const excludedValues =
    facets?.find((facet) => facet.id === facetId)?.excludedValues || [];

  return (
    <>
      <FacetAttributesPageLayoutHeader
        algoControlValues={
          attributeValues.length - includedValues.length - excludedValues.length
        }
        includedValues={includedValues.length}
        excludedValues={excludedValues.length}
        displayName={displayName}
        facetType="global"
        onClose={() => {
          router.push(`/global/facets/edit/${ruleSetId}`);
        }}
      />
      <p>hello global</p>
    </>
  );
};
