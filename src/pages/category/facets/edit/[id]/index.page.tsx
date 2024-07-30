import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import { ReturnedFacet, RuleSetFacetConfigWithId } from '@/libs/api';
import { Heading } from '@/libs/components';
import {
  useFacetsFilter,
  useFacetsList,
  useRuleSetPreview,
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
  const { ruleSetDetail, isLoading } = useRuleSetPreview(id);

  const categoryId = useMemo(
    () => [ruleSetDetail.categoryId],
    [ruleSetDetail.categoryId]
  );

  const [facetsFromCategoryRuleSet, setFacetsFromCategoryRuleSet] = useState<
    RuleSetFacetConfigWithId[] | []
  >([]);

  const { facets } = useFacetsList(categoryId, !isLoading);
  const [localFacetData, setLocalFacetData] = useState<ReturnedFacet[]>(facets);

  const { setSearch, filteredFacets } = useFacetsFilter(localFacetData);

  useEffect(() => {
    if (ruleSetDetail.facets) {
      setFacetsFromCategoryRuleSet(ruleSetDetail.facets);
    }
  }, [ruleSetDetail]);

  useEffect(() => {
    setLocalFacetData(orderByStatus(facets));
  }, [facets]);

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('save');
  };

  const handleCancel = () => {
    router.push('/category/facets');
  };

  const category = {
    identifier: ruleSetDetail.categoryId,
    name: ruleSetDetail.categoryName,
    path: '/',
  };

  const orderByStatus = (facets: ReturnedFacet[]) => {
    const included = facets.filter((facet) => facet.status === 'included');
    const excluded = facets.filter((facet) => facet.status === 'excluded');
    return [...included, ...excluded];
  };

  const onHandleStatusChange = async (
    value: 'included' | 'excluded',
    id?: string
  ) => {
    setFacetsFromCategoryRuleSet((prev) => {
      if (value === 'excluded') {
        return prev.filter((item) => item.id !== id);
      } else {
        const existingFacet = localFacetData.find((facet) => facet.id === id);
        // istanbul ignore next
        if (!existingFacet) {
          return prev;
        }

        const facetToAdd = {
          id: existingFacet.id,
          boosted: existingFacet.boosted,
          excludedValues: existingFacet.excludedValues,
        };

        if (!prev.find((facet) => facet.id === facetToAdd.id)) {
          return [...prev, facetToAdd];
        } else {
          return prev;
        }
      }
    });
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
            const item = localFacetData[index];
            const firstPart = localFacetData.slice(0, index);
            const secondPart = localFacetData.slice(index + 1);
            const updatedFacets =
              direction === -1
                ? [
                    ...firstPart.slice(0, -1),
                    item,
                    firstPart[firstPart.length - 1],
                    ...secondPart,
                  ]
                : [...firstPart, secondPart[0], item, ...secondPart.slice(1)];
            setLocalFacetData(updatedFacets);
          }}
          onHandleStatusChange={onHandleStatusChange}
          defaultCategory={category}
          includedFacets={facetsFromCategoryRuleSet}
          canPreviewChanges
        />
      )}
    </>
  );
};

export default Page;
