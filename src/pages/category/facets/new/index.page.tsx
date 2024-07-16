import { useRouter } from 'next/router';

import { Heading } from '@/libs/components';
import { FacetsPanel } from '@/libs/modules/facets-panel/facets-panel';

const Page = () => {
  const router = useRouter();

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('save');
  };
  const handleCancel = () => {
    router.push('/category/facets');
  };

  return (
    <>
      <Heading breadcrumbs={['Categories', 'Facet Management', 'New']} />

      <FacetsPanel
        onSave={handleSave}
        onCancel={handleCancel}
        title="Facet Rule Editor"
        facetsData={[]}
        canPreviewChanges={true}
        canAddFacet={true}
      />
    </>
  );
};

export default Page;
