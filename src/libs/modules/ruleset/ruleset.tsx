import styled from '@emotion/styled';
import {
  CategorySearch,
  ProductGridHeader,
  Tabs,
  VisualEditor,
  spacing,
} from '../../components';
import { useEffect, useState } from 'react';
import type { Category } from '@/libs/api';
import { useCategoryPreview } from '../../hooks';
import { Product, MerchandisingRules } from '@/libs/api';

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

type ChangePositionTypes = {
  isPinned: boolean;
  id: string;
  newPosition: number;
  oldPosition: number;
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

  const onSelectCategory = (category: Category) => {
    setSelectedCategory(category);
  };

  const { categoryPreview } = useCategoryPreview(
    selectedCategory?.identifier,
    merchandisingRules
  );

  console.log('sort', categoryPreview);

  useEffect(() => {
    setSortedProducts(categoryPreview);
  }, [categoryPreview]);

  const onChangePosition = ({
    isPinned,
    oldPosition,
    newPosition,
  }: ChangePositionTypes) => {
    const updatedList = sortedProducts.map((product) => ({
      ...product,
      isLastChanged: false,
    }));

    const product = updatedList.splice(oldPosition, 1)[0];
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
      <ProductGridHeader onSave={onSaveRuleset} />

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
            tabs={['Product', 'Attribute', 'Insights']}
            onTabChange={setCurrentProductTab}
            currentTab={currentProductTab}
          />
          {currentProductTab === 0 && (
            <p style={{ padding: spacing(2) }}>Tab 1</p>
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
            <VisualEditor
              products={sortedProducts}
              onChangePosition={onChangePosition}
            />
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
