import { Dispatch } from 'react';

import type { Product as ProductType } from '../../api';
import { Product } from '../product/product';
import { Action } from '../types';
import { Layout, ProductBox } from './visual-editor.styles';

type Props = {
  dispatch: Dispatch<Action>;
  hasBulkAction: boolean;
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
  hasBulkAction,
  onSelectProduct,
  selectedProducts,
  isSelectionDisabled,
}: Props) => {
  const pinnedProductsCount = products.filter(
    (product) => product.metadata.isPinned
  ).length;

  return (
    <Layout aria-label="Visual Editor">
      {products.map((product, index) => (
        <ProductBox key={`product-${product.id}`}>
          <Product
            {...product}
            hasBulkAction={hasBulkAction}
            index={index}
            isPinnable={true}
            dispatch={dispatch}
            onSelectProduct={onSelectProduct}
            isSelected={selectedProducts.includes(product.id)}
            isSelectionDisabled={isSelectionDisabled}
            pinnedProductsCount={pinnedProductsCount}
          />
        </ProductBox>
      ))}
    </Layout>
  );
};
