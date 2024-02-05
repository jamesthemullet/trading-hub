import type { Product as ProductType } from '../../api';

import { Product } from '../product/product';
import { Layout, ProductBox } from './visual-editor.styles';

type ChangePositionTypes = {
  isPinned: boolean;
  id: string;
  newPosition: number;
  oldPosition: number;
};

type Props = {
  products: ProductType[];
  onChangePosition: (arg: ChangePositionTypes) => void;
};

export const VisualEditor = ({ products, onChangePosition }: Props) => {
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
            onChangePosition={onChangePosition}
            totalProducts={products.length}
            pinnedProductsCount={pinnedProductsCount}
          />
        </ProductBox>
      ))}
    </Layout>
  );
};
