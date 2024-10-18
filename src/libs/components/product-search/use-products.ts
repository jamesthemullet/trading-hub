import { useCallback, useEffect, useState } from 'react';

import type { MerchandisingRules, Product as ProductType } from '@/libs/api';
import { useCategoryProductSearch } from '@/libs/hooks';

import { useScrollOffset } from './use-scroll-offset';

export const useProducts = ({
  categoryId,
  productSearchTerm,
  maxToQuery,
  merchandisingRules,
}: {
  categoryId?: string;
  productSearchTerm: string;
  maxToQuery: number;
  merchandisingRules: MerchandisingRules;
}) => {
  const { searchForProduct } = useCategoryProductSearch();
  const [totalProducts, setTotalProducts] = useState(0);
  const [products, setSearchProducts] = useState<
    (
      | {
          id: string;
          type: 'product';
          product: ProductType;
        }
      | { id: string; type: 'placeholder' }
    )[]
  >([]);

  const { offset, scrollContainerRef } = useScrollOffset({
    totalProducts,
    maxToQuery,
  });

  const fetchData = useCallback(async () => {
    const { products, pagination } = await searchForProduct({
      ...(categoryId && {
        categoryId,
      }),
      query: productSearchTerm,
      start: offset,
      rows: maxToQuery,
      merchandisingRules,
    });

    const { totalItems } = pagination;

    setTotalProducts(totalItems ?? products.length);
    setSearchProducts((prev) =>
      Array.from({ length: totalItems ?? products.length }).map((_, index) => {
        const productOffset = index - offset;
        const product =
          prev[index]?.type === 'product'
            ? prev[index].product
            : productOffset < 0 || productOffset >= products.length
              ? undefined
              : products[productOffset];
        return product !== undefined
          ? {
              id: `${product.id}-${index}`,
              type: 'product' as const,
              product: product,
            }
          : {
              id: `placeholder-${index}`,
              type: 'placeholder' as const,
            };
      })
    );
  }, [
    searchForProduct,
    productSearchTerm,
    categoryId,
    merchandisingRules,
    maxToQuery,
    offset,
  ]);

  useEffect(() => {
    if (productSearchTerm) {
      fetchData();
    }
  }, [productSearchTerm, fetchData]);

  return {
    products,
    totalProducts,
    scrollContainerRef,
    clearProducts: () => {
      setTotalProducts(0);
      setSearchProducts([]);
    },
  };
};
