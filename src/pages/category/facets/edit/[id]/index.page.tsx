import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { Category, ReturnedFacet, RuleSetFacetConfigWithId } from '@/libs/api';
import { ErrorMessage, Heading } from '@/libs/components';
import {
  useFacetsFilter,
  useFacetsList,
  useRuleSetDetail,
  useUpdateRuleSet,
} from '@/libs/hooks';
import { FacetsPanel } from '@/libs/modules/facets-panel/facets-panel';
import { FacetsPanelSkeleton } from '@/libs/modules/facets-panel/facets-panel-skeleton';

import { GetServerSideProps, GetServerSidePropsContext } from 'next';

export const getServerSideProps: GetServerSideProps = (
  context: GetServerSidePropsContext
) => {
  return Promise.resolve({
    props: { id: context.query.id },
  });
};

const Page = ({ id }: { id: string }) => {
  const router = useRouter();
  const {
    ruleSetDetail,
    isLoading,
    refreshRuleset,
    error: getRulesetDetailError,
  } = useRuleSetDetail(id);

  const [userSelectedCategory, setUserSelectedCategory] = useState<
    Required<Category> | undefined
  >();

  const [facetsFromCategoryRuleSet, setFacetsFromCategoryRuleSet] = useState<
    RuleSetFacetConfigWithId[] | []
  >([]);

  const [dateTime, setDateTime] = useState<Array<Date | null>>([null, null]);

  const { facets, error: getFacetListError } = useFacetsList({
    categoryId: userSelectedCategory?.identifier,
    enabled: !isLoading,
    emptyListWhenCategoryNotSelected: true,
  });

  const [facetList, setFacetList] = useState<ReturnedFacet[]>([]);
  const [includedFacets, setIncludedFacets] = useState<ReturnedFacet[]>([]);
  const [excludedFacets, setExcludedFacets] = useState<ReturnedFacet[]>([]);
  const [orderedFacetList, setOrderedFacetList] = useState<ReturnedFacet[]>([]);

  const { search, setSearch, filteredFacets } =
    useFacetsFilter(orderedFacetList);
  const { updateCategoryRuleSet, error: updateRulesetError } =
    useUpdateRuleSet();

  useEffect(() => {
    if (ruleSetDetail.facets) {
      setFacetsFromCategoryRuleSet(ruleSetDetail.facets);
    }
    // TODO this needs additional refactoring
    if (ruleSetDetail.categoriesInfo[0]) {
      setUserSelectedCategory({
        identifier: ruleSetDetail.categoriesInfo[0].id,
        name: ruleSetDetail.categoriesInfo[0].name || '',
        path: '/',
      });
    }
    if (ruleSetDetail.startDate && ruleSetDetail.endDate) {
      setDateTime([
        new Date(ruleSetDetail.startDate),
        new Date(ruleSetDetail.endDate),
      ]);
    }
  }, [ruleSetDetail]);

  useEffect(() => {
    const includedFacets = facetsFromCategoryRuleSet
      .map((facet) => {
        const localFacet = facetList.find(
          (localFacet) => localFacet.id === facet.id
        );

        // istanbul ignore next
        if (!localFacet) {
          return facet;
        }

        const ruleSetFacet = ruleSetDetail.facets?.find(
          (facet) => facet.id === localFacet.id
        );

        // istanbul ignore next
        if (!ruleSetFacet) {
          return localFacet;
        }

        return {
          ...localFacet,
          boosted: ruleSetFacet.boosted,
          excludedValues: ruleSetFacet.excludedValues,
        };
      })
      .filter((facet): facet is ReturnedFacet => Boolean(facet));

    setIncludedFacets(includedFacets);

    const excludedFacets = facetList.filter((facet) =>
      ruleSetDetail.excludedFacets?.facets?.some(
        (excludedFacet) => excludedFacet?.id === facet.id
      )
    );

    const restOfFacets = facetList.filter(
      (facet) =>
        !includedFacets.some((ruleFacet) => ruleFacet.id === facet.id) &&
        !excludedFacets.some((ruleFacet) => ruleFacet.id === facet.id)
    );

    setExcludedFacets(excludedFacets);
    setOrderedFacetList([
      ...includedFacets,
      ...restOfFacets,
      ...excludedFacets,
    ]);
  }, [
    facetList,
    facetsFromCategoryRuleSet,
    ruleSetDetail.facets,
    ruleSetDetail.excludedFacets?.facets,
  ]);

  useEffect(() => {
    setFacetList(facets);
  }, [facets]);

  const handleSave = async (categoryIds: string[]) => {
    const response = await updateCategoryRuleSet({
      categoryIds,
      rules: ruleSetDetail.rules,

      facets: orderedFacetList.filter((facet) =>
        includedFacets.some((includedFacet) => includedFacet.id === facet.id)
      ),
      isEnabled: ruleSetDetail.isEnabled,
      ...(dateTime[0] && { startDate: new Date(dateTime[0]).toISOString() }),
      ...(dateTime[1] && {
        endDate: new Date(dateTime[1]).toISOString(),
      }),

      ruleSetId: id,
      excludedFacets: {
        facets: excludedFacets.map((excludedFacet) => ({
          id: excludedFacet.id,
        })),
      },
    });
    if (response && response.status !== 'error') {
      return router.push(`/category/facets/`);
    }
  };

  const handleCancel = () => {
    router.push('/category/facets');
  };

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

  const handleUpdatedValues = (
    included: string[],
    excluded: string[],
    id: string
  ) => {
    setOrderedFacetList((prev) => {
      const updatedFacets = prev.map((facet) => {
        if (facet.id === id) {
          return {
            ...facet,
            boosted: included,
            excludedValues: excluded,
          };
        } else {
          return facet;
        }
      });
      return updatedFacets;
    });

    setIncludedFacets((prev) => {
      const updatedFacets = prev.map((facet) => {
        if (facet.id === id) {
          return {
            ...facet,
            boosted: included,
            excludedValues: excluded,
          };
        } else {
          return facet;
        }
      });
      return updatedFacets;
    });
  };

  const handleUserSelectedCategoryChange = (
    category: Required<Category> | undefined
  ) => {
    setFacetList([]);
    setExcludedFacets([]);
    setIncludedFacets([]);
    setFacetsFromCategoryRuleSet([]);
    setUserSelectedCategory(category);
  };

  return (
    <>
      <Heading breadcrumbs={['Categories', 'Facet Management', 'Editor']} />

      {getRulesetDetailError && (
        <ErrorMessage>
          Error whilst retrieving ruleset: {getRulesetDetailError}
        </ErrorMessage>
      )}
      {updateRulesetError && (
        <ErrorMessage>
          Error whilst updating ruleset: {updateRulesetError}
        </ErrorMessage>
      )}
      {getFacetListError && (
        <ErrorMessage>
          Error whilst retrieving facet list: {getFacetListError}
        </ErrorMessage>
      )}

      {isLoading ? (
        <FacetsPanelSkeleton title="Facet Rule Editor" />
      ) : (
        <FacetsPanel
          onSave={handleSave}
          onCancel={handleCancel}
          setSearch={setSearch}
          title="Facet Rule Editor"
          facetsData={filteredFacets}
          displayRowOrderControls={true}
          onFacetsDataRowOrderChange={(index, direction) => {
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
          }}
          onHandleStatusChange={onHandleStatusChange}
          onSelectedCategoryChange={handleUserSelectedCategoryChange}
          onScheduleDateChange={(
            updatedDateTime: [Date | null, Date | null]
          ) => {
            setDateTime(updatedDateTime);
          }}
          refreshData={refreshRuleset}
          categoryIds={ruleSetDetail.categoriesInfo.map(
            (category) => category.id
          )}
          endDate={ruleSetDetail.endDate}
          includedFacets={includedFacets}
          excludedFacets={{
            facets: excludedFacets?.map((facet) => ({ id: facet.id })),
          }}
          facetType="category"
          rulesetMerchandisingRules={ruleSetDetail.rules}
          searchTerm={search}
          startDate={ruleSetDetail.startDate}
          updatedValues={handleUpdatedValues}
        />
      )}
    </>
  );
};

export default Page;
