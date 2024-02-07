import { useEffect, useState } from 'react';

import styled from '@emotion/styled';
import {
  Button,
  Heading,
  ProductSearch,
  Tabs,
  VisualEditor,
} from '@/libs/components';
import type { GetServerSideProps, GetServerSidePropsContext } from 'next';

import { spacing } from '@/libs/components/utils/spacing';
import { Product } from '@/libs/api';
import { useUpdateRuleSet } from '@/libs/hooks/use-update-rule-set';
import { useRuleSetPreview } from '@/libs/hooks/use-rule-set-preview';
import { useCategoryProductSearch } from '@/libs/hooks/use-category-product-search';

const RuleSetOptions = styled.div`
  background-color: #005640;
  color: #fff;
  display: flex;

  h1 {
    /* stylelint-disable-next-line property-disallowed-list */
    font-size: 1.5em;
    padding: ${spacing(3)} ${spacing(2)};
  }
`;

const Actions = styled.div`
  display: flex;
  gap: ${spacing(2)};
  margin-left: auto;
  padding: 18px;
`;

const CategoryPanel = styled.div`
  border-top: 2px solid #e8e8e8;
  color: #fff;
  background-color: #005640;
`;

const MainContainerPanel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: stretch;
`;

const ProductSearchPanel = styled.div`
  background-color: #fff;
  border-right: 1px solid #707070;
  max-width: 361px;
  min-width: 361px;
  margin: 0;
`;

const RulesPanel = styled.div`
  background-color: #fff;
  width: 100%;
`;

type ChangePositionTypes = {
  isPinned: boolean;
  id: string;
  newPosition: number;
  oldPosition: number;
};

type PageProps = {
  id: string;
};

const Page = ({ id }: PageProps) => {
  const { ruleSets, products, error } = useRuleSetPreview(id);
  const { handleGet } = useCategoryProductSearch();
  const [currentEditorTab, setCurrentEditorTab] = useState(0);
  const [currentProductTab, setCurrentProductTab] = useState(0);
  const [sortedProducts, setSortedProducts] = useState<Product[]>(products);
  const [searchProducts, setSearchProducts] = useState<Product[]>([]);

  useEffect(() => {
    setSortedProducts(products);
  }, [products]);

  const { updateRuleSet } = useUpdateRuleSet();

  const onChangePosition = ({
    isPinned,
    oldPosition,
    newPosition,
  }: ChangePositionTypes) => {
    const updatedList = sortedProducts.map((product) => ({
      ...product,
      isLastChanged: false,
    }));

    // eslint-disable-next-line functional/immutable-data
    const product = updatedList.splice(oldPosition, 1)[0];
    const metadata = { ...product.metadata, isPinned };
    const updatedProduct = { ...product, metadata, isLastChanged: isPinned };

    // eslint-disable-next-line functional/immutable-data
    updatedList.splice(newPosition, 0, updatedProduct);

    // eslint-disable-next-line functional/immutable-data
    updatedList.sort(
      (a, b) => Number(b.metadata.isPinned) - Number(a.metadata.isPinned)
    );

    setSortedProducts(updatedList);
  };

  const handleSaveChanges = async () => {
    const pinnedProducts = sortedProducts
      .filter((product) => product.metadata.isPinned)
      .map((product) => ({
        id: product.id,
      }));

    await updateRuleSet({
      id,
      pinnedProducts,
      categoryId: ruleSets.categoryId,
    });
  };

  return (
    <>
      <Heading
        breadcrumbs={['Search & Merchandising', 'Categories', 'Ranking rules']}
      />

      <RuleSetOptions>
        <h1>Product Grid</h1>

        <Actions>
          <Button as="a" href="/rules">
            Cancel
          </Button>
          <Button as="a" href="">
            Preview
          </Button>
          <Button theme="primary" onClick={handleSaveChanges}>
            Save
          </Button>
        </Actions>
      </RuleSetOptions>

      <CategoryPanel style={{ padding: '20px' }}>
        {ruleSets.categoryId} | {ruleSets.categoryName}
      </CategoryPanel>
      <MainContainerPanel>
        <ProductSearchPanel>
          <Tabs
            tabs={['Product', 'Attribute', 'Insights']}
            onTabChange={setCurrentProductTab}
            currentTab={currentProductTab}
          />
          {currentProductTab === 0 && (
            <ProductSearch
              onSearch={async (query) => {
                const data = await handleGet({
                  categoryId: ruleSets.categoryId,
                  query,
                  start: 0,
                  rows: 10,
                });
                setSearchProducts(data.products);
              }}
              onChangePosition={onChangePosition}
              products={searchProducts}
            />
          )}
          {currentProductTab === 1 && (
            <p style={{ padding: spacing(2) }}>Tab 2</p>
          )}
          {currentProductTab === 2 && (
            <p style={{ padding: spacing(2) }}>Tab 3</p>
          )}
        </ProductSearchPanel>
        <RulesPanel>
          <Tabs
            tabs={['Visual Editor', 'Changes', 'External Changes']}
            onTabChange={setCurrentEditorTab}
            currentTab={currentEditorTab}
          />

          {currentEditorTab === 0 && (
            <>
              {error && <p style={{ padding: '20px' }}>Error: {error}</p>}
              <VisualEditor
                products={sortedProducts}
                onChangePosition={onChangePosition}
              />
            </>
          )}
          {currentEditorTab === 1 && (
            <p style={{ padding: spacing(2) }}>Tab 2</p>
          )}
          {currentEditorTab === 2 && (
            <p style={{ padding: spacing(2) }}>Tab 3</p>
          )}
        </RulesPanel>
      </MainContainerPanel>
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
