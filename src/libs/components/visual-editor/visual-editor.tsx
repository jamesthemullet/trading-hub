import type { Product as ProductType } from '../../api';
import { ChangeProductBoostBury, Product } from '../product/product';
import { Layout, ProductBox } from './visual-editor.styles';

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
            onChangePosition={onChangePosition}
            onProductBoostBury={onProductBoostBury}
            pinnedProductsCount={pinnedProductsCount}
          />
        </ProductBox>
      ))}
    </Layout>
  );
};
