import { useRouter } from 'next/router';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';

import { Heading } from '@/libs/components';
import { FacetsPanel } from '@/libs/modules/facets-panel/facets-panel';
import { useFacetsFilter, useRuleSetPreview } from '@/libs/hooks';

import { FacetsPanelSkeleton } from '@/libs/modules/facets-panel/facets-panel-skeleton';
import { useEffect, useState } from 'react';
import { ReturnedFacet } from '@/libs/api';

export const getServerSideProps: GetServerSideProps = (
  context: GetServerSidePropsContext
) => {
  return Promise.resolve({
    props: { id: context.query.id },
  });
};

const Page = ({ id }: { id: string }) => {
  const router = useRouter();
  const { ruleSets, facets, isLoading } = useRuleSetPreview(id);
  const [localFacets, setLocalFacets] = useState<ReturnedFacet[]>(facets);
  const { setSearch, filteredFacets } = useFacetsFilter(localFacets);

  useEffect(() => {
    setLocalFacets(facets);
  }, [facets]);

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('save');
  };
  const handleCancel = () => {
    router.push('/facets');
  };

  const category = {
    identifier: ruleSets.categoryId,
    name: ruleSets.categoryName,
    path: '/',
  };

  const onFacetDataChange = (index: number) => {
    // TO-DO This will need to be covered in /search/beta/merchandising/category/ruleset/{ruleSetId}
    console.log(index);
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
            const updatedFacets = [...localFacets];
            // eslint-disable-next-line functional/immutable-data
            const [removed] = updatedFacets.splice(index, 1);
            // eslint-disable-next-line functional/immutable-data
            updatedFacets.splice(index + direction, 0, removed);
            setLocalFacets(updatedFacets);
          }}
          onFacetDataChange={onFacetDataChange}
          defaultCategory={category}
        />
      )}
    </>
  );
};

export default Page;
