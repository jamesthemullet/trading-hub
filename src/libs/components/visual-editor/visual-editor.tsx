import { Dispatch } from 'react';

import type { Product as ProductType } from '../../api';
import { Product } from '../product/product';
import { Action } from '../types';
import { Layout, ProductBox } from './visual-editor.styles';

type Props = {
  products: ProductType[];
  dispatch: Dispatch<Action>;
  hasBulkAction: boolean;
};

export const VisualEditor = ({ products, dispatch, hasBulkAction }: Props) => {
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
            pinnedProductsCount={pinnedProductsCount}
          />
        </ProductBox>
      ))}
    </Layout>
  );
};
