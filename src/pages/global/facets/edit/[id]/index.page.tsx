import { Heading } from '@/libs/components';

import { useRouter } from 'next/router';
import { FacetsPanel } from '@/libs/modules/facets-panel/facets-panel';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';

type PageProps = {
  id: string;
};

type mockAttributes = {
  id: string;
  attribute: string;
  displayName: string;
  order: null;
  valueOptions: string[];
}[];

export const mockAttributes = [
  {
    id: 'color-id',
    attribute: 'Colour',
    displayName: 'Colour',
    order: null,
    valueOptions: ['Red', 'Blue', 'Green'],
  },
  {
    id: 'size-id',
    attribute: 'Size',
    displayName: 'Size',
    order: null,
    valueOptions: ['S', 'M', 'L'],
  },
  {
    id: 'brand-id',
    attribute: 'Brand',
    displayName: 'Brand',
    order: null,
    valueOptions: ['Nike', 'Adidas', 'Puma'],
  },
  {
    id: 'category-id',
    attribute: 'Category',
    displayName: 'Category',
    order: null,
    valueOptions: ['category1', 'category2', 'category3'],
  },
  {
    id: 'price-id',
    attribute: 'Price',
    displayName: 'Price',
    order: null,
    valueOptions: ['£5.00', '£10.00', '!15.00'],
  },
] as mockAttributes;

const Page = ({ id }: PageProps) => {
  const router = useRouter();

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('save');
  };

  const handleCancel = () => {
    router.push('/global/facets');
  };

  const attributesData = mockAttributes.find((facet) => facet.id === id);

  return (
    <>
      <Heading
        breadcrumbs={['Categories', 'Global Facet Management', 'Editor']}
      />

      <FacetsPanel
        onSave={handleSave}
        onCancel={handleCancel}
        title="Global Facet Rule Editor"
        attributesData={attributesData}
        defaultToExcludeOnly={true}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = (
  context: GetServerSidePropsContext
) => {
  return Promise.resolve({
    props: { id: context.query.id },
  });
};

export default Page;
