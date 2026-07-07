import type { Dispatch } from 'react';

import type { MerchandisingProduct as ProductType } from '@/libs/api';
import type { RuleSetActions } from '@/libs/components/types';
import { Product } from '@/libs/containers/rulesets/product/product';

import styles from './visual-editor.module.css';

type Props = {
  dispatch: Dispatch<RuleSetActions>;
  canSetBoostWeight?: boolean;
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
  canSetBoostWeight = false,
  onSelectProduct,
  selectedProducts,
  isSelectionDisabled,
}: Props) => {
  const pinnedProductsCount = products.filter(
    (product) => product.metadata.isPinned
  ).length;

  return (
    <section className={styles.layout}>
      {products.map((product, index) => (
        <div className={styles.productBox} key={`product-${product.id}`}>
          <Product
            {...product}
            index={index}
            isPinnable
            dispatch={dispatch}
            onSelectProduct={onSelectProduct}
            isSelected={selectedProducts.includes(product.id)}
            isSelectionDisabled={isSelectionDisabled}
            pinnedProductsCount={pinnedProductsCount}
            hasSupplementaryInfo
            canSetBoostWeight={canSetBoostWeight}
          />
        </div>
      ))}
    </section>
  );
};
