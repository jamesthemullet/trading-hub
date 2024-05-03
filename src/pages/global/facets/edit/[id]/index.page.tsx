import { Heading } from '@/libs/components';

import { useRouter } from 'next/router';
import { FacetsPanel } from '@/libs/modules/facets-panel/facets-panel';
import { FacetsPanelSkeleton } from '@/libs/modules/facets-panel/facets-panel-skeleton';
import styled from '@emotion/styled';
import { spacing } from '../../../../../libs/components';
import { useFacetsList } from '@/libs/hooks';

type mockAttributes = {
  id: string;
  attribute: string;
  displayName: string;
  order: null;
  valueOptions: string[];
}[];

const NavigationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: ${spacing(4)};
  margin-left: auto;
  margin-right: ${spacing(2)};
  margin-bottom: ${spacing(18)};
  font-weight: 400;
  font-size: 14px;
`;

const TotalResultsLabel = styled.div`
  font-family: mnsLondonRegular, monospace;
  margin-left: 31px;
`;

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

const defaultCategory = {
  identifier: 'Applies to all pages in marksandspencer.com',
  name: 'All products',
  path: '/',
};

const Page = () => {
  const { facets, isLoading } = useFacetsList();

  const router = useRouter();

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('save');
  };

  const handleCancel = () => {
    router.push('/global/facets');
  };

  const mockDefaultOrderData = [
    { defaultOrder: 'Include only' },
    { defaultOrder: 'Exclude only' },
    { defaultOrder: 'Exclude only' },
    { defaultOrder: 'Include only' },
    { defaultOrder: 'Include only' },
  ];

  return (
    <>
      <Heading
        breadcrumbs={['Categories', 'Global Facet Management', 'Editor']}
      />

      {isLoading ? (
        <FacetsPanelSkeleton title="Global Facet Rule Editor" />
      ) : (
        <FacetsPanel
          onSave={handleSave}
          onCancel={handleCancel}
          title="Global Facet Rule Editor"
          facetsData={facets}
          defaultCategory={defaultCategory}
          defaultOrderData={mockDefaultOrderData}
        />
      )}
      <NavigationContainer>
        <TotalResultsLabel>{mockAttributes.length} results</TotalResultsLabel>
      </NavigationContainer>
    </>
  );
};

export default Page;
