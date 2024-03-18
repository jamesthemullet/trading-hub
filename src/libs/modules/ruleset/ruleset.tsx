import styled from '@emotion/styled';
import {
  CategorySearch,
  Preview,
  ProductGridHeader,
  ProductSearch,
  RulesetAttributes,
  RulesetChanges,
  Tabs,
  VisualEditor,
} from '../../components';
import { useEffect, useState } from 'react';
import type { Category, Product, MerchandisingRules } from '@/libs/api';
import { useCategoryPreview, useCategoryProductSearch } from '../../hooks';
import { useRouter } from 'next/router';

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

const PanelTop = styled.div`
  position: sticky;
  top: 65px;
  background-color: #fff;
  padding-top: 1px;
  z-index: 1;
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
  onCancel,
  onCreate,
  onSave,
  rulesetCategory,
  rulesetId,
  rulesetMerchandisingRules,
}: {
  onSave?: ({}: EditRulesetValues) => void;
  onCancel: () => void;
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
        // boosts: { numeric: [], alphaNumeric: [], product: [] },
        // buries: { numeric: [], alphaNumeric: [], product: [] },
      }
    );
  const [hasChanges, setHasChanges] = useState(false);
  const { handleGet } = useCategoryProductSearch();
  const [searchProducts, setSearchProducts] = useState<Product[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const warningText =
      'You have unsaved changes - are you sure you wish to leave this page?';
    /* istanbul ignore next */
    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (!hasChanges) return;
      e.preventDefault();
      return (e.returnValue = warningText);
    };
    /* istanbul ignore next */
    const handleBrowseAway = () => {
      if (!hasChanges) return;
      if (window.confirm(warningText)) return;
      router.events.emit('routeChangeError');
      throw 'routeChange aborted.';
    };
    window.addEventListener('beforeunload', handleWindowClose);
    router.events.on('routeChangeStart', handleBrowseAway);
    return () => {
      window.removeEventListener('beforeunload', handleWindowClose);
      router.events.off('routeChangeStart', handleBrowseAway);
    };
  }, [hasChanges]);

  const onSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    if (!hasChanges) setHasChanges(true);
  };

  const { categoryProducts } = useCategoryPreview(
    selectedCategory?.identifier,
    merchandisingRules
  );

  useEffect(() => {
    setSortedProducts(categoryProducts);
  }, [categoryProducts]);

  const onChangePosition = ({
    isPinned,
    newPosition,
    id,
  }: ChangePositionTypes) => {
    if (!hasChanges) setHasChanges(true);

    const oldPosition = sortedProducts.findIndex(
      (product) => product.id === id
    );

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
    setMerchandisingRules({
      pinnedProducts,
      blockedProducts: [],
      // boosts: { numeric: [], alphaNumeric: [], product: [] },
      // buries: { numeric: [], alphaNumeric: [], product: [] },
    });
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
        onSave={() => {
          onSaveRuleset();
          setHasChanges(false);
        }}
        hasPreview={!!selectedCategory?.identifier}
        onPreview={() => setShowPreview(!showPreview)}
        hasChanges={hasChanges}
        onCancel={() => {
          setHasChanges(false);
          onCancel();
        }}
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
          <PanelTop>
            <Tabs
              tabs={[{ title: 'Product' }, { title: 'Attribute' }]}
              onTabChange={setCurrentProductTab}
              currentTab={currentProductTab}
            />
          </PanelTop>
          {currentProductTab === 0 && selectedCategory.identifier && (
            <ProductSearch
              onSearch={async (query) => {
                /* istanbul ignore next */
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
          {currentProductTab === 1 && <RulesetAttributes />}
        </ProductSearchPanel>
        <RulesPanel>
          <PanelTop>
            <Tabs
              tabs={[
                { title: 'Visual Editor' },
                {
                  title: 'Changes',
                  count: merchandisingRules.pinnedProducts.length,
                },
              ]}
              onTabChange={setCurrentEditorTab}
              currentTab={currentEditorTab}
            />
          </PanelTop>

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
        </RulesPanel>
      </MainContainerPanel>
    </>
  );
};
