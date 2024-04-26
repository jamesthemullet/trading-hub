import { useRouter } from 'next/router';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';

import { Heading } from '@/libs/components';
import { FacetsPanel } from '@/libs/modules/facets-panel/facets-panel';
import { useRuleSetPreview } from '@/libs/hooks';

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

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('save');
  };
  const handleCancel = () => {
    router.push('/facets');
  };

  return (
    <>
      <Heading breadcrumbs={['Categories', 'Facet Management', 'Editor']} />

      <FacetsPanel
        onSave={handleSave}
        onCancel={handleCancel}
        title="Facet Rule Editor"
        categoryName={ruleSets.categoryId}
        facetsData={[]}
      />
    </>
  );
};

export default Page;
