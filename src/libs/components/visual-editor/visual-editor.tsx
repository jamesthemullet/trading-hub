import type { Dispatch } from 'react';

import type { MerchandisingProduct as ProductType } from '../../api';
import { Product } from '../product/product';
import type { RuleSetActions } from '../types';
import { Layout, ProductBox } from './visual-editor.styles';

type Props = {
  dispatch: Dispatch<RuleSetActions>;

  onSelectProduct: ({
    id,
    isSelected,
  }: {
    id: string;
    isSelected: boolean;
  }) => void;
  selectedProducts: string[];
  isSelectionDisabled: boolean;
  products: ProductType[];
};

export const VisualEditor = ({
  products,
  dispatch,

  onSelectProduct,
  selectedProducts,
  isSelectionDisabled,
}: Props) => {
  const pinnedProductsCount = products.filter(
    (product) => product.metadata.isPinned
  ).length;

  return (
    <Layout>
      {products.map((product, index) => (
        <ProductBox key={`product-${product.id}`}>
          <Product
            {...product}
            index={index}
            isPinnable={true}
            dispatch={dispatch}
            onSelectProduct={onSelectProduct}
            isSelected={selectedProducts.includes(product.id)}
            isSelectionDisabled={isSelectionDisabled}
            pinnedProductsCount={pinnedProductsCount}
            hasSupplementaryInfo={true}
          />
        </ProductBox>
      ))}
    </Layout>
  );
};
