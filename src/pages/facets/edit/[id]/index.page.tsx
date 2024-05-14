import { useRouter } from 'next/router';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';

import { Heading } from '@/libs/components';
import { FacetsPanel } from '@/libs/modules/facets-panel/facets-panel';
import {
  useFacetsFilter,
  useFacetsList,
  useRuleSetPreview,
} from '@/libs/hooks';
import { FacetsPanelSkeleton } from '@/libs/modules/facets-panel/facets-panel-skeleton';

export const getServerSideProps: GetServerSideProps = (
  context: GetServerSidePropsContext
) => {
  return Promise.resolve({
    props: { id: context.query.id },
  });
};

const Page = ({ id }: { id: string }) => {
  const router = useRouter();
  const { ruleSets } = useRuleSetPreview(id);
  const { facets, isLoading } = useFacetsList([id]);

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('save');
  };
  const handleCancel = () => {
    router.push('/facets');
  };

  const { setSearch, filteredFacets } = useFacetsFilter(facets);

  const category = {
    identifier: ruleSets.categoryId,
    name: ruleSets.categoryName,
    path: '/',
  };

  return (
    <>
      <Heading breadcrumbs={['Categories', 'Facet Management', 'Editor']} />

      {isLoading ? (
        <FacetsPanelSkeleton title="Global Facet Rule Editor" />
      ) : (
        <FacetsPanel
          onSave={handleSave}
          onCancel={handleCancel}
          setSearch={setSearch}
          title="Facet Rule Editor"
          categoryName={ruleSets.categoryId}
          facetsData={filteredFacets}
          defaultCategory={category}
        />
      )}
    </>
  );
};

export default Page;
