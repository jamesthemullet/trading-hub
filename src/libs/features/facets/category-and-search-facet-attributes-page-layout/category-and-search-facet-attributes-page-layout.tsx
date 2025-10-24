import type { ChangeEvent } from 'react';
import { useMemo, useReducer, useState } from 'react';
import { useRouter } from 'next/router';

import type {
  MerchandisingAttributeValuesResponse,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';
import { FacetAttributesListActions } from '@/libs/containers';
import { facetAttributesPageReducer } from '@/libs/stores/search-and-category/facet-attributes-page-reducer';
import { FACET_ATTRIBUTE_VIEW_MODE } from '@/libs/utils/facet-attribute-types';

import { intersection, without } from 'lodash';

import { FacetAttributesActions } from '../..';
import { FacetAttributesPageLayoutHeader } from '../facet-attributes-page-layout-header/facet-attributes-page-layout-header';
import { SearchAndCategoryFacetAttributesList } from '../search-and-category-facet-attributes-list/search-and-category-facet-attibutes-list';

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
  const [currentMode, setCurrentMode] = useState<FACET_ATTRIBUTE_VIEW_MODE>(
    FACET_ATTRIBUTE_VIEW_MODE.LIST
  );

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
  const includedValues = facetLocalState.boosted!.map((value) => ({
    displayValue: value,
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
            router.push(`/${facetType}/facets/edit/${ruleSetId}`);
          }
        }
        onSave={handleSave}
        // this is just set to false in the original component too
        // istanbul ignore next
        isSaveDisabled={false}
      />

      <FacetAttributesActions
        currentMode={currentMode}
        setCurrentMode={setCurrentMode}
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
