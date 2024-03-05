import styled from '@emotion/styled';
import {
  CategorySearch,
  Preview,
  ProductGridHeader,
  ProductSearch,
  RulesetChanges,
  Tabs,
  VisualEditor,
  spacing,
} from '../../components';
import { useEffect, useState } from 'react';
import type { Category, Product, MerchandisingRules } from '@/libs/api';
import { useCategoryPreview, useCategoryProductSearch } from '../../hooks';

const CategoryPanel = styled.div`
  border-top: 2px solid #005640;
  padding: 20px;
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

export type ChangePositionTypes = {
  isPinned: boolean;
  id: string;
  newPosition: number;
};

type NewRulesetValues = {
  merchandisingRules: MerchandisingRules;
  categoryId: string;
};

interface EditRulesetValues extends NewRulesetValues {
  rulesetId: string;
}

export const Ruleset = ({
  onSave,
  onCreate,
  rulesetCategory,
  rulesetId,
  rulesetMerchandisingRules,
}: {
  onSave?: ({}: EditRulesetValues) => void;
  onCreate?: ({}: NewRulesetValues) => void;
  rulesetCategory?: Category;
  rulesetId?: string;
  rulesetMerchandisingRules?: MerchandisingRules;
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    rulesetCategory || {}
  );
  const [sortedProducts, setSortedProducts] = useState<Product[]>([]);
  const [currentEditorTab, setCurrentEditorTab] = useState(0);
  const [currentProductTab, setCurrentProductTab] = useState(0);
  const [merchandisingRules, setMerchandisingRules] =
    useState<MerchandisingRules>(
      rulesetMerchandisingRules || {
        pinnedProducts: [],
        blockedProducts: [],
        boosts: [],
      }
    );
  const { handleGet } = useCategoryProductSearch();
  const [searchProducts, setSearchProducts] = useState<Product[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const onSelectCategory = (category: Category) => {
    setSelectedCategory(category);
  };

  const { categoryPreview } = useCategoryPreview(
    selectedCategory?.identifier,
    merchandisingRules
  );

  useEffect(() => {
    setSortedProducts(categoryPreview);
  }, [categoryPreview]);

  const onChangePosition = ({
    isPinned,
    newPosition,
    id,
  }: ChangePositionTypes) => {
    const oldPosition = sortedProducts.findIndex(
      (product) => product.id === id
    );

    console.log('onChangePosition', isPinned, oldPosition, newPosition, id);

    const isNewProduct = oldPosition === -1;

    const updatedList = sortedProducts
      .filter((product) => product.id !== id)
      .map((product) => ({
        ...product,
        isLastChanged: false,
      }));

    const product = isNewProduct
      ? searchProducts.find((p) => p.id === id)
      : sortedProducts[oldPosition];

    /* istanbul ignore next */
    if (!product) {
      console.error('Product not found', id);
      return;
    }

    const metadata = { ...product.metadata, isPinned };
    const updatedProduct = { ...product, metadata, isLastChanged: isPinned };

    updatedList.splice(newPosition, 0, updatedProduct);

    updatedList.sort(
      (a, b) => Number(b.metadata.isPinned) - Number(a.metadata.isPinned)
    );

    setSortedProducts(updatedList);
    const pinnedProducts = updatedList
      .filter((product) => product.metadata.isPinned)
      .map((product) => ({
        id: product.id,
      }));
    // TODO: blocked and boosts
    setMerchandisingRules({ pinnedProducts, blockedProducts: [], boosts: [] });
  };

  const onSaveRuleset = () => {
    if (!selectedCategory?.identifier) {
      return;
    }

    if (rulesetId && onSave) {
      onSave({
        rulesetId,
        merchandisingRules,
        categoryId: selectedCategory.identifier,
      });
    } else if (onCreate) {
      onCreate({
        merchandisingRules,
        categoryId: selectedCategory.identifier,
      });
    }
  };

  return (
    <>
      {showPreview && selectedCategory.identifier && (
        <Preview
          onClose={() => setShowPreview(!showPreview)}
          categoryId={selectedCategory.identifier}
          merchandisingRules={merchandisingRules}
        />
      )}

      <ProductGridHeader
        onSave={onSaveRuleset}
        hasPreview={!!selectedCategory?.identifier}
        onPreview={() => setShowPreview(!showPreview)}
      />

      <CategoryPanel>
        <CategorySearch
          selectedCategory={selectedCategory}
          onClearSelection={() => {
            setSelectedCategory({});
          }}
          onSelectCategory={onSelectCategory}
        />
      </CategoryPanel>

      <MainContainerPanel>
        <ProductSearchPanel>
          <Tabs
            tabs={[
              { title: 'Product' },
              { title: 'Attribute' },
              { title: 'Insights' },
            ]}
            onTabChange={setCurrentProductTab}
            currentTab={currentProductTab}
          />
          {currentProductTab === 0 && (
            <ProductSearch
              onSearch={async (query) => {
                if (!selectedCategory.identifier) return;
                const data = await handleGet({
                  categoryId: selectedCategory.identifier,
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
            tabs={[
              { title: 'Visual Editor' },
              {
                title: 'Changes',
                count: merchandisingRules.pinnedProducts.length,
              },
              { title: 'External Changes' },
            ]}
            onTabChange={setCurrentEditorTab}
            currentTab={currentEditorTab}
          />

          {currentEditorTab === 0 && (
            <VisualEditor
              products={sortedProducts}
              onChangePosition={onChangePosition}
            />
          )}
          {currentEditorTab === 1 && (
            <RulesetChanges
              merchandisingRules={merchandisingRules}
              onChangePosition={onChangePosition}
            />
          )}
          {currentEditorTab === 2 && (
            <p style={{ padding: spacing(2) }}>Tab 3</p>
          )}
        </RulesPanel>
      </MainContainerPanel>
    </>
  );
};
