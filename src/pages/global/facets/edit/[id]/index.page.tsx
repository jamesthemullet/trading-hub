import { Heading } from '@/libs/components';

import { useRouter } from 'next/router';
import { FacetsPanel } from '@/libs/modules/facets-panel/facets-panel';
import { FacetsPanelSkeleton } from '@/libs/modules/facets-panel/facets-panel-skeleton';
import { useFacetsList } from '@/libs/hooks';
import { useFacetsFilter } from '@/libs/hooks/use-facets-filter';
import { useEffect, useState } from 'react';
import { ReturnedFacet } from '@/libs/api';
import { FilteredResultsPanel } from '@/libs/components/filtered-results-panel/filtered-results-panel';

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

  const [localFacetData, setLocalFacetData] = useState<ReturnedFacet[]>(facets);

  useEffect(() => {
    setLocalFacetData(facets);
  }, [facets]);

  const { setSearch, filteredFacets } = useFacetsFilter(localFacetData);

  const onDisplayValueChange = (newValue: string, index: number) => {
    setLocalFacetData((prev) => {
      const updatedFacet: ReturnedFacet = {
        ...prev[index],
        displayValue: newValue,
      };
      return [...prev.slice(0, index), updatedFacet, ...prev.slice(index + 1)];
    });
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
          setSearch={setSearch}
          onDisplayValueChange={onDisplayValueChange}
          title="Global Facet Rule Editor"
          facetsData={filteredFacets}
          defaultCategory={defaultCategory}
          defaultOrderData={mockDefaultOrderData}
        />
      )}
      <FilteredResultsPanel filteredFacets={filteredFacets.length} />
    </>
  );
};

export default Page;
