import {
  Button,
  CategorySearch,
  Heading,
  spacing,
  Text,
} from '@/libs/components';

import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import { Category } from '../../../../libs/api';
import { useState } from 'react';

const ActionContainer = styled.div`
  display: flex;

  h1 {
    font-size: 1.5em;
    padding: ${spacing(3)} ${spacing(2)};
  }

  a,
  button {
    min-width: 110px;
    text-align: center;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: ${spacing(2)};
  margin-left: auto;
  padding: 18px;
`;

const CategoryPanel = styled.div`
  border-top: 2px solid #005640;
  padding: 20px;
`;

const AddFacetPanel = styled.div`
  border-top: 2px solid #005640;
  padding: 20px;
  display: flex;
  gap: ${spacing(2)};
  margin-left: auto;
  padding: 18px;
  justify-content: space-between;

  button {
    width: 150px;
  }
`;

const LowerHeading = styled(Text)`
  font-size: 1em;
  margin-bottom: 1em;
`;

const mockSelectedCategory = {
  identifier: 'SubCategory_26224926',
  name: 'Casual Shirts',
  path: 'path/to/plp',
};

const Page = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>({});
  const router = useRouter();

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('save');
  };

  const onPreview = () => {
    // TODO: Implement preview functionality
    console.log('preview');
  };

  // istanbul ignore next
  const onSelectCategory = () => {
    // TODO: Implement category selection
    console.log('select category');
    setSelectedCategory(mockSelectedCategory);
  };

  return (
    <>
      <Heading breadcrumbs={['Categories', 'Facet Management', 'Editor']} />

      <ActionContainer>
        <h1>Facet Management</h1>

        <Actions>
          <Button onClick={() => router.push('/facet-management')}>
            Cancel
          </Button>
          <Button onClick={onPreview}>Preview</Button>
          <Button theme="primary" onClick={handleSave}>
            Save
          </Button>
        </Actions>
      </ActionContainer>
      <CategoryPanel>
        <LowerHeading isStrong>Rule scope</LowerHeading>
        <CategorySearch
          selectedCategory={selectedCategory}
          onClearSelection={
            // istanbul ignore next
            () => setSelectedCategory({})
          }
          // istanbul ignore next
          onSelectCategory={onSelectCategory}
        />
      </CategoryPanel>
      <AddFacetPanel>
        <div>
          <LowerHeading isStrong>Preview and manage facets</LowerHeading>
          <p>(sort by algo control)</p>
        </div>
        <div>
          <Button>Add facet</Button>
        </div>
      </AddFacetPanel>
    </>
  );
};

export default Page;
