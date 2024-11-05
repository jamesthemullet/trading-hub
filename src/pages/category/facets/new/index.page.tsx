import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { Category, ExcludedFacets, ReturnedFacet } from '@/libs/api';
import { ErrorMessage, Heading } from '@/libs/components';
import { useFacetsList, useRuleSetCreate } from '@/libs/hooks';
import { FacetsPanel } from '@/libs/modules/facets-panel/facets-panel';

const Page = () => {
  const [dateTime, setDateTime] = useState<Array<Date | null>>([null, null]);
  const { createRuleset, error: crateRuleSetError } = useRuleSetCreate();
  const router = useRouter();

  const [userSelectedCategory, setUserSelectedCategory] = useState<
    Required<Category> | undefined
  >();

  const handleUserSelectedCategoryChange = (
    category: Required<Category> | undefined
  ) => {
    setUserSelectedCategory(category);
  };

  const { facets, error: getFacetListError } = useFacetsList({
    categoryId: userSelectedCategory?.identifier,
    emptyListWhenCategoryNotSelected: true,
  });

  const [facetsData, setFacetsData] = useState<ReturnedFacet[]>([]);

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

  useEffect(() => {
    if (facets) {
      setFacetsData(facets);
    }
  }, [facets]);

  const createNewCategoryRuleSet = async ({
    categoryIds,
    includedFacets,
    excludedFacets,
  }: {
    categoryIds: string[];
    includedFacets: ReturnedFacet[];
    excludedFacets: ExcludedFacets;
  }) => {
    const resp = await createRuleset({
      excludedFacets,
      categoryIds,
      facets: includedFacets,
      countryCode: 'UK',
      rules: defaultMerchandisingRules,
      isEnabled: true,
      ...(dateTime[0] && { startDate: new Date(dateTime[0]).toISOString() }),
      ...(dateTime[1] && { endDate: new Date(dateTime[1]).toISOString() }),
    });

    if (resp) {
      return router.push('/category/facets');
    }
  };

  return (
    <>
      <Heading breadcrumbs={['Categories', 'Facet Management', 'New']} />

      {crateRuleSetError && (
        <ErrorMessage>
          Error whilst creating new category rule set: {crateRuleSetError}
        </ErrorMessage>
      )}
      {getFacetListError && (
        <ErrorMessage>
          Error whilst retrieving facet list: {getFacetListError}
        </ErrorMessage>
      )}

      <FacetsPanel
        title="Facet Rule Editor"
        facetType="category"
        isNewRuleset={true}
        facetsData={facetsData}
        initialIncludedFacets={[]}
        initialExcludedFacets={[]}
        rulesetMerchandisingRules={defaultMerchandisingRules}
        displayRowOrderControls={true}
        onSelectedCategoryChange={handleUserSelectedCategoryChange}
        onSave={createNewCategoryRuleSet}
        onCancel={handleCancel}
        onScheduleDateChange={(updatedDateTime: [Date | null, Date | null]) => {
          setDateTime(updatedDateTime);
        }}
      />
    </>
  );
};

export default Page;
