import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { Category, ReturnedFacet } from '@/libs/api';
import { ErrorMessage, Heading } from '@/libs/components';
import { useFacetsFilter, useFacetsList, useRuleSetCreate } from '@/libs/hooks';
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
    setExcludedFacets([]);
    setIncludedFacets([]);
    setUserSelectedCategory(category);
  };

  const { facets, error: getFacetListError } = useFacetsList({
    categoryId: userSelectedCategory?.identifier,
    emptyListWhenCategoryNotSelected: true,
  });

  const [includedFacets, setIncludedFacets] = useState<ReturnedFacet[]>([]);
  const [excludedFacets, setExcludedFacets] = useState<ReturnedFacet[]>([]);
  const [orderedFacetList, setOrderedFacetList] = useState<ReturnedFacet[]>([]);

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
      setOrderedFacetList(facets);
    }
  }, [facets]);
  const { search, setSearch, filteredFacets } =
    useFacetsFilter(orderedFacetList);

  const onHandleStatusChange = async (
    value: 'included' | 'excluded' | 'algoControl',
    id?: string
  ) => {
    const facetToChange = orderedFacetList.find((facet) => facet.id === id);
    // istanbul ignore next
    if (!facetToChange) {
      return;
    }

    const currentlyIncludedFacets = orderedFacetList.filter((facet) =>
      includedFacets.includes(facet)
    );
    const currentlyExcludedFacets = orderedFacetList.filter((facet) =>
      excludedFacets.includes(facet)
    );
    const restOfFacets = orderedFacetList.filter(
      (facet) =>
        !includedFacets.includes(facet) &&
        !excludedFacets.includes(facet) &&
        facet.id !== facetToChange.id
    );

    switch (value) {
      case 'included':
        setOrderedFacetList([
          ...currentlyIncludedFacets.filter((facet) => facet !== facetToChange),
          facetToChange,
          ...restOfFacets,
          ...currentlyExcludedFacets.filter((facet) => facet !== facetToChange),
        ]);
        setIncludedFacets([...includedFacets, facetToChange]);
        setExcludedFacets(
          excludedFacets.filter((facet) => facet.id !== facetToChange.id)
        );
        break;
      case 'excluded':
        setOrderedFacetList([
          ...currentlyIncludedFacets.filter((facet) => facet !== facetToChange),
          ...restOfFacets,
          facetToChange,
          ...currentlyExcludedFacets,
        ]);
        setIncludedFacets(
          includedFacets.filter((facet) => facet.id !== facetToChange.id)
        );
        setExcludedFacets([...excludedFacets, facetToChange]);
        break;
      case 'algoControl':
        setOrderedFacetList([
          ...currentlyIncludedFacets.filter((facet) => facet !== facetToChange),
          facetToChange,
          ...restOfFacets,
          ...currentlyExcludedFacets.filter((facet) => facet !== facetToChange),
        ]);
        setIncludedFacets(
          includedFacets.filter((facet) => facet.id !== facetToChange.id)
        );
        setExcludedFacets(
          excludedFacets.filter((facet) => facet.id !== facetToChange.id)
        );
        break;
    }
  };

  const handleRowOrderChange = (index: number, direction: -1 | 1) => {
    const item = orderedFacetList[index];
    const firstPart = orderedFacetList.slice(0, index);
    const secondPart = orderedFacetList.slice(index + 1);
    const updatedFacets =
      direction === -1
        ? [
            ...firstPart.slice(0, -1),
            item,
            firstPart[firstPart.length - 1],
            ...secondPart,
          ]
        : [...firstPart, secondPart[0], item, ...secondPart.slice(1)];
    setOrderedFacetList(updatedFacets);
  };

  const createNewCategoryRuleSet = async (categoryId: string) => {
    const resp = await createRuleset({
      facets: orderedFacetList.filter((facet) =>
        includedFacets.some((includedFacet) => includedFacet.id === facet.id)
      ),
      excludedFacets: {
        facets: excludedFacets.map((excludedFacet) => ({
          id: excludedFacet.id,
        })),
      },
      categoryId,
      merchandisingRules: defaultMerchandisingRules,
      isEnabled: true,
      startDate: dateTime[0] ? new Date(dateTime[0]).toISOString() : undefined,
      endDate: dateTime[1] ? new Date(dateTime[1]).toISOString() : undefined,
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
        searchTerm={search}
        isNewRuleset={true}
        facetsData={filteredFacets}
        includedFacets={includedFacets}
        excludedFacets={{
          facets: excludedFacets?.map((facet) => ({ id: facet.id })),
        }}
        rulesetMerchandisingRules={defaultMerchandisingRules}
        displayRowOrderControls={true}
        onFacetsDataRowOrderChange={handleRowOrderChange}
        onHandleStatusChange={onHandleStatusChange}
        onSelectedCategoryChange={handleUserSelectedCategoryChange}
        onSave={createNewCategoryRuleSet}
        onCancel={handleCancel}
        onScheduleDateChange={(updatedDateTime: [Date | null, Date | null]) => {
          setDateTime(updatedDateTime);
        }}
        setSearch={setSearch}
      />
    </>
  );
};

export default Page;
