import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import { ReturnedFacet, RuleSetFacetConfigWithId } from '@/libs/api';
import { Heading } from '@/libs/components';
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
  const { ruleSetDetail, isLoading } = useRuleSetDetail(id);

  const categoryId = useMemo(
    () => [ruleSetDetail.categoryId],
    [ruleSetDetail.categoryId]
  );

  const [facetsFromCategoryRuleSet, setFacetsFromCategoryRuleSet] = useState<
    RuleSetFacetConfigWithId[] | []
  >([]);

  const { facets } = useFacetsList(categoryId, !isLoading);
  const [facetList, setFacetList] = useState<ReturnedFacet[]>([]);
  const [includedFacets, setIncludedFacets] = useState<ReturnedFacet[]>([]);
  const [orderedFacetList, setOrderedFacetList] = useState<ReturnedFacet[]>([]);

  const { setSearch, filteredFacets } = useFacetsFilter(orderedFacetList);
  const { updateRuleSet } = useUpdateRuleSet();

  useEffect(() => {
    if (ruleSetDetail.facets) {
      setFacetsFromCategoryRuleSet(ruleSetDetail.facets);
    }
  }, [ruleSetDetail]);

  useEffect(() => {
    const includedFacets = facetsFromCategoryRuleSet
      .map((facet) => {
        const localFacet = facetList.find(
          (localFacet) => localFacet.id === facet.id
        );
        return localFacet;
      })
      .filter((facet): facet is ReturnedFacet => Boolean(facet));
    setIncludedFacets(includedFacets);
    const excludedFacets = facetList.filter(
      (facet) =>
        !facetsFromCategoryRuleSet.some(
          (ruleFacet) => ruleFacet.id === facet.id
        )
    );
    setOrderedFacetList([...includedFacets, ...excludedFacets]);
  }, [facetList, facetsFromCategoryRuleSet]);

  useEffect(() => {
    setFacetList(facets);
  }, [facets]);

  const handleSave = async () => {
    const response = await updateRuleSet({
      categoryId: categoryId[0],
      rules: {
        facets: orderedFacetList.filter((facet) =>
          includedFacets.some((includedFacet) => includedFacet.id === facet.id)
        ),
        isEnabled: ruleSetDetail.isEnabled,
        rules: ruleSetDetail.rules,
      },
      ruleSetId: id,
    });
    if (response) {
      return router.push(`/category/facets/`);
    }
  };

  const handleCancel = () => {
    router.push('/category/facets');
  };

  const category = {
    identifier: ruleSetDetail.categoryId,
    name: ruleSetDetail.categoryName,
    path: '/',
  };

  const onHandleStatusChange = async (
    value: 'included' | 'excluded',
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
    const currentlyExcludedFacets = orderedFacetList.filter(
      (facet) => !includedFacets.includes(facet)
    );

    if (value === 'included') {
      setOrderedFacetList([
        ...currentlyIncludedFacets,
        facetToChange,
        ...currentlyExcludedFacets.filter((facet) => facet !== facetToChange),
      ]);
      setIncludedFacets([...includedFacets, facetToChange]);
    } else {
      setOrderedFacetList([
        ...currentlyIncludedFacets.filter((facet) => facet !== facetToChange),
        facetToChange,
        ...currentlyExcludedFacets,
      ]);
      setIncludedFacets(
        includedFacets.filter((facet) => facet.id !== facetToChange.id)
      );
    }
  };

  return (
    <>
      <Heading breadcrumbs={['Categories', 'Facet Management', 'Editor']} />

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
          defaultCategory={category}
          includedFacets={includedFacets}
          facetType="category"
          rulesetMerchandisingRules={ruleSetDetail.rules}
        />
      )}
    </>
  );
};

export default Page;
