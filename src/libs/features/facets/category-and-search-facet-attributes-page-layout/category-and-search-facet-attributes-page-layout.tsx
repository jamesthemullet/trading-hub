import type { ChangeEvent } from 'react';
import { useMemo, useReducer } from 'react';
import { useRouter } from 'next/router';

import type {
  MerchandisingAttributeValuesResponse,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';
import { getFacetRoute } from '@/libs/constants';
import { FacetAttributesListActions } from '@/libs/containers';
import { facetAttributesPageReducer } from '@/libs/stores/search-and-category/facet-attributes-page-reducer';

import { intersection, without } from 'lodash';

import { FacetAttributesPageLayoutHeader } from '../facet-attributes-page-layout-header/facet-attributes-page-layout-header';
import { SearchAndCategoryFacetAttributesList } from '../search-and-category-facet-attributes-list/search-and-category-facet-attributes-list';

type PageLayout = {
  attributeValues: MerchandisingAttributeValuesResponse['values'];
  facet: MerchandisingRuleSetFacetConfigWithId;
  displayName: string;
  facetType: 'category' | 'search';
  ruleSetId: string;
  searchQuery: string;
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSave: (newFacet: MerchandisingRuleSetFacetConfigWithId) => void;
};

export const CategoryAndSearchFacetsPanelPageLayout = ({
  attributeValues,
  facet,
  displayName,
  facetType,
  ruleSetId,
  searchQuery,
  onSearchChange,
  onSave,
}: PageLayout) => {
  const router = useRouter();

  const processedFacet = useMemo(() => {
    const intersectedValues = intersection(facet.boosted, facet.excludedValues);

    const boosted = without(facet.boosted, ...intersectedValues);

    return {
      ...facet,
      ...(boosted.length > 0 && { boosted }),
    };
  }, [facet]);

  const [facetLocalState, dispatch] = useReducer(
    facetAttributesPageReducer,
    processedFacet
  );

  const algoControlValues = attributeValues
    .filter((value) => !facetLocalState.boosted!.includes(value.displayValue))
    .filter(
      (value) => !facetLocalState.excludedValues?.includes(value.displayValue)
    );
  const includedValues = facetLocalState.boosted!.map((value, index) => ({
    displayValue: value,
    order: index + 1,
  }));

  const excludedValues = attributeValues.filter((value) =>
    facetLocalState.excludedValues?.includes(value.displayValue)
  );

  const handleSave = () => {
    onSave(facetLocalState);
  };

  return (
    <>
      <FacetAttributesPageLayoutHeader
        algoControlValues={algoControlValues.length}
        includedValues={includedValues.length}
        excludedValues={excludedValues.length}
        displayName={displayName}
        facetType={facetType}
        onClose={
          // istanbul ignore next
          () => {
            // istanbul ignore next

            router.push(getFacetRoute(facetType, 'edit', ruleSetId));
          }
        }
        onSave={handleSave}
        // this is just set to false in the original component too
        // istanbul ignore next
        isSaveDisabled={false}
      />

      <FacetAttributesListActions onSearchChange={onSearchChange} />

      <SearchAndCategoryFacetAttributesList
        boostedValues={includedValues}
        algoControlValues={algoControlValues}
        excludedValues={excludedValues}
        dispatch={dispatch}
        searchQuery={searchQuery}
        writeEnabled
      />
    </>
  );
};
