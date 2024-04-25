import styled from '@emotion/styled';
import isEqual from 'lodash/isEqual';
import {
  CategorySearch,
  ChangeProductBoostBury,
  Preview,
  ProductGridHeader,
  ProductSearch,
  RulesetAttributes,
  RulesetChanges,
  spacing,
  Tabs,
  VisualEditor,
} from '../../components';
import { useEffect, useState } from 'react';
import type {
  Category,
  Product,
  MerchandisingRules,
  AlphanumericBoostBury,
  NumericBoostBury,
  AttributeType,
} from '@/libs/api';
import { useCategoryPreview, useCategoryProductSearch } from '../../hooks';
import { useRouter } from 'next/router';

const CategoryPanel = styled.div`
  border-top: 2px solid #005640;
  padding: ${spacing(1)};
`;

const MainContainerPanel = styled.div`
  display: flex;
`;

const ProductSearchPanel = styled.div`
  background-color: #fff;
  border-right: 1px solid #707070;
  margin: 0;
  width: 360px;
`;

const RulesPanel = styled.div`
  background-color: #fff;
  width: calc(100% - 360px);
`;

const PanelTop = styled.div`
  background-color: #fff;
  padding-top: 1px;
  z-index: 1;
`;

const TabContent = styled.div`
  height: calc(100vh - 285px);
  overflow: auto;
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

export type EditAttribute = {
  attribute: AlphanumericBoostBury | NumericBoostBury;
  change: 'add' | 'remove' | 'modify';
  index?: number;
  operation: 'boosts' | 'buries';
  type: AttributeType;
};

export const Ruleset = ({
  onCancel,
  onCreate,
  onSave,
  rulesetCategory,
  rulesetId,
  rulesetMerchandisingRules,
}: {
  onSave?: ({ rulesetId }: EditRulesetValues) => void;
  onCancel: () => void;
  onCreate?: ({ categoryId, merchandisingRules }: NewRulesetValues) => void;
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
        boosts: {
          alphanumeric: [],
          numeric: [],
          product: [],
        },
        buries: {
          alphanumeric: [],
          numeric: [],
          product: [],
        },
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
  }, [hasChanges, router]);

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

    /* istanbul ignore next */
    const product = isNewProduct
      ? searchProducts.find((p) => p.id === id)
      : sortedProducts[oldPosition];

    /* istanbul ignore next */
    if (!product) {
      console.error('Product not found', id);
      return;
    }

    const metadata = { ...product.metadata, isPinned, isBoosted: false };
    const updatedProduct = { ...product, metadata, isLastChanged: isPinned };

    updatedList.splice(newPosition, 0, updatedProduct);

    // LPN-1653 for BE to send all metadata
    /* istanbul ignore next */
    const sortedByBoost = [
      ...updatedList.sort(
        (b, a) =>
          Number(a.metadata.isBoosted || false) -
          Number(b.metadata.isBoosted || false)
      ),
    ];
    const sortedByPinned = [
      ...sortedByBoost.sort(
        (b, a) => Number(a.metadata.isPinned) - Number(b.metadata.isPinned)
      ),
    ];

    setSortedProducts(sortedByPinned);
    const pinnedProducts = sortedByPinned
      .filter((product) => product.metadata.isPinned)
      .map((product) => ({
        id: product.id,
      }));
    setMerchandisingRules({
      ...merchandisingRules,
      pinnedProducts,
      boosts: {
        ...merchandisingRules.boosts,
        product: merchandisingRules.boosts.product.filter(
          (product) => product.id !== id
        ),
      },
    });
    if (!hasChanges) setHasChanges(true);
  };

  const onChangeAttribute = ({
    attribute,
    change,
    index,
    operation,
    type,
  }: EditAttribute) => {
    setMerchandisingRules((prevState) => {
      if (change === 'modify') {
        return {
          ...prevState,
          [operation]: {
            ...prevState[operation],
            [type]: prevState[operation][type].map((attr, attributeIndex) => {
              if (attributeIndex === index) {
                return attribute;
              }
              return attr;
            }),
          },
        };
      }
      if (type === 'alphanumeric') {
        return {
          ...prevState,
          [operation]: {
            ...prevState[operation],
            alphanumeric:
              change === 'add'
                ? [
                    ...merchandisingRules[operation][type],
                    attribute as AlphanumericBoostBury,
                  ]
                : [
                    ...merchandisingRules[operation][type].filter(
                      (attr) => !isEqual(attr, attribute)
                    ),
                  ],
          },
        };
      }
      if (type === 'numeric') {
        return {
          ...prevState,
          [operation]: {
            ...prevState[operation],
            numeric:
              change === 'add'
                ? [
                    ...merchandisingRules[operation][type],
                    attribute as NumericBoostBury,
                  ]
                : merchandisingRules[operation][type].filter(
                    (attr) => !isEqual(attr, attribute)
                  ),
          },
        };
      }
      /* istanbul ignore next */
      return { ...prevState };
    });
  };

  const onProductBoostBury = ({
    id,
    operation,
    change,
  }: ChangeProductBoostBury) => {
    const product =
      sortedProducts.find((product) => product.id === id) ||
      searchProducts.find((product) => product.id === id);

    /* istanbul ignore next */
    if (!product) return;

    const isBoosted = change === 'add' && operation === 'boosts';
    const isBuried = change === 'add' && operation === 'buries';

    const productBoosts = isBoosted
      ? [...merchandisingRules.boosts.product, { id, weight: 1 }]
      : merchandisingRules.boosts.product.filter(
          (product) => product.id !== id
        );
    const productBuries = isBuried
      ? [...merchandisingRules.buries.product, { id, weight: 1 }]
      : merchandisingRules.buries.product.filter(
          (product) => product.id !== id
        );

    const updatedRules: MerchandisingRules = {
      ...merchandisingRules,
      boosts: {
        ...merchandisingRules.boosts,
        product: productBoosts,
      },
      buries: {
        ...merchandisingRules.buries,
        product: productBuries,
      },
      pinnedProducts: merchandisingRules.pinnedProducts.filter(
        (product) => product.id !== id
      ),
    };

    setMerchandisingRules(updatedRules);

    const metadata = {
      ...(product && product.metadata),
      isPinned: false,
      isBoosted,
      isBuried,
    };
    const updatedProduct = { ...product, metadata };

    const updatedList = [
      ...(isBoosted ? [updatedProduct] : []),
      ...sortedProducts.filter((product) => product.id !== id),
      ...(change === 'remove' || isBuried ? [updatedProduct] : []),
    ];

    // TODO LPN-1653 for BE to send all metadata
    /* istanbul ignore next */
    const sortedByBury = [
      ...updatedList.sort(
        (a, b) =>
          Number(a.metadata.isBuried || false) -
          Number(b.metadata.isBuried || false)
      ),
    ];
    /* istanbul ignore next */
    const sortedByBoost = [
      ...sortedByBury.sort(
        (b, a) =>
          Number(a.metadata.isBoosted || false) -
          Number(b.metadata.isBoosted || false)
      ),
    ];
    const sortedByPinned = [
      ...sortedByBoost.sort(
        (b, a) => Number(a.metadata.isPinned) - Number(b.metadata.isPinned)
      ),
    ];

    setSortedProducts(sortedByPinned);

    if (!hasChanges) setHasChanges(true);
  };

  /* istanbul ignore next */
  const totalCount =
    merchandisingRules.pinnedProducts.length +
    (merchandisingRules.boosts?.alphanumeric || []).length +
    (merchandisingRules.boosts?.numeric || []).length +
    (merchandisingRules.boosts?.product || []).length +
    (merchandisingRules.buries?.alphanumeric || []).length +
    (merchandisingRules.buries?.numeric || []).length +
    (merchandisingRules.buries?.product || []).length;

  const onSaveRuleset = (categoryId: string) => {
    if (rulesetId && onSave) {
      onSave({
        rulesetId,
        merchandisingRules,
        categoryId,
      });
    } else if (onCreate) {
      onCreate({
        merchandisingRules,
        categoryId,
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
        onSave={(categoryId) => {
          onSaveRuleset(categoryId);
          setHasChanges(false);
        }}
        categoryId={selectedCategory.identifier}
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
          <TabContent>
            {currentProductTab === 0 && selectedCategory.identifier && (
              <ProductSearch
                onSearch={async (query) => {
                  /* istanbul ignore next */
                  if (!selectedCategory.identifier) {
                    return;
                  }
                  if (!query) {
                    setSearchProducts([]);
                    return;
                  }
                  const data = await handleGet({
                    categoryId: selectedCategory.identifier,
                    query,
                    start: 0,
                    rows: 10,
                    merchandisingRules,
                  });
                  setSearchProducts(data.products);
                }}
                onChangePosition={onChangePosition}
                onProductBoostBury={onProductBoostBury}
                products={searchProducts}
              />
            )}
            {currentProductTab === 1 && (
              <RulesetAttributes
                merchandisingRules={merchandisingRules}
                category={selectedCategory.identifier}
                onChangeAttribute={onChangeAttribute}
              />
            )}
          </TabContent>
        </ProductSearchPanel>
        <RulesPanel>
          <PanelTop>
            <Tabs
              tabs={[
                { title: 'Visual Editor' },
                {
                  title: 'Changes',
                  count: totalCount,
                },
              ]}
              onTabChange={setCurrentEditorTab}
              currentTab={currentEditorTab}
            />
          </PanelTop>
          <TabContent>
            {currentEditorTab === 0 && (
              <VisualEditor
                products={sortedProducts}
                onChangePosition={onChangePosition}
                onProductBoostBury={onProductBoostBury}
              />
            )}
            {currentEditorTab === 1 && (
              <RulesetChanges
                merchandisingRules={merchandisingRules}
                category={selectedCategory.identifier}
                onChangePosition={onChangePosition}
                onProductBoostBury={onProductBoostBury}
              />
            )}
          </TabContent>
        </RulesPanel>
      </MainContainerPanel>
    </>
  );
};
