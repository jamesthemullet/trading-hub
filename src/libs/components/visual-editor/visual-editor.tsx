import type { Product as ProductType } from '../../api';
import { Product } from '../product/product';
import { EditProduct } from '../types';
import { Layout, ProductBox } from './visual-editor.styles';

export type ChangeProductBoostBury = {
  id: string;
} & Pick<EditProduct, 'change' | 'operation'>;

type ChangePositionTypes = {
  isPinned: boolean;
  id: string;
  newPosition: number;
};

type Props = {
  products: ProductType[];
  onChangePosition: (arg: ChangePositionTypes) => void;
  onProductBoostBury: (arg: ChangeProductBoostBury) => void;
};

export const VisualEditor = ({
  products,
  onChangePosition,
  onProductBoostBury,
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
            index={index}
            isPinnable={true}
            onChangePosition={onChangePosition}
            onProductBoostBury={onProductBoostBury}
            pinnedProductsCount={pinnedProductsCount}
          />
        </ProductBox>
      ))}
    </Layout>
  );
};
