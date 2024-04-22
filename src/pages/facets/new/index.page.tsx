import { useRouter } from 'next/router';

import { Heading } from '@/libs/components';
import { Facets } from '@/libs/modules/facets/facets';

const Page = () => {
  const router = useRouter();

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('save');
  };
  const handleCancel = () => {
    router.push('/facets');
  };

  return (
    <>
      <Heading breadcrumbs={['Categories', 'Facet Management', 'New']} />

      <Facets onSave={handleSave} onCancel={handleCancel} />
    </>
  );
};

export default Page;
