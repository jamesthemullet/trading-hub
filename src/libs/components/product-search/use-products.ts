import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  CountryCode,
  MerchandisingRules,
  Product as ProductType,
} from '@/libs/api';
import { useCategoryProductSearch } from '@/libs/hooks';

import { useScrollOffset } from './use-scroll-offset';

export const useProducts = ({
  categoryId,
  searchTerms,
  productSearchTerm,
  maxToQuery,
  merchandisingRules,
  countryCode = 'UK_IE',
}: {
  categoryId?: string;
  searchTerms?: string[];
  productSearchTerm: string;
  maxToQuery: number;
  merchandisingRules: MerchandisingRules;
  countryCode?: CountryCode;
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

  const prevQuery = useRef<string | null>(null);
  const prevCategoryId = useRef<string | null>(null);

  const { offset, scrollContainerRef, query } = useScrollOffset({
    productSearchTerm,
    totalProducts,
    maxToQuery,
    categoryId,
  });

  const fetchData = useCallback(
    async (query: string, offset: number) => {
      const { products, pagination } = await searchForProduct({
        ...(categoryId && {
          categoryId,
        }),
        countryCode,
        ...(searchTerms && { searchTerms }),
        query,
        start: offset,
        rows: maxToQuery,
        merchandisingRules,
      });

      const { totalItems } = pagination;

      setTotalProducts(totalItems ?? products.length);
      setSearchProducts((prev) => {
        return Array.from({ length: totalItems ?? products.length }).map(
          (_, index) => {
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
          }
        );
      });
    },
    [
      searchForProduct,
      categoryId,
      merchandisingRules,
      maxToQuery,
      searchTerms,
      countryCode,
    ]
  );

  useEffect(() => {
    if (query) {
      if (prevQuery.current !== query) {
        // eslint-disable-next-line functional/immutable-data
        prevQuery.current = query;
        setTotalProducts(0);
        setSearchProducts([]);
      }
      fetchData(query, offset);
    }
  }, [fetchData, query, offset]);

  useEffect(() => {
    if (categoryId) {
      if (prevCategoryId.current !== categoryId) {
        // eslint-disable-next-line functional/immutable-data
        prevCategoryId.current = categoryId;
        setTotalProducts(0);
        setSearchProducts([]);
      }
    }
  }, [categoryId]);

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
