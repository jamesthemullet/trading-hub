import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useState } from 'react';

import type {
  MerchandisingCountryCode,
  MerchandisingProduct as ProductType,
  MerchandisingRules,
  SearchMerchandisingProductsV1ParamsEnum,
} from '@/libs/api';
import { useCategoryProductSearch } from '@/libs/hooks';

const PRODUCTS_TO_LOAD = 8;
const MAXIMUM_PRODUCTS_TO_LOAD_BACKEND_SUPPORTS = 10;

type ProductRule = { id: string };

/**
 * Loads product details for the visible slice of a ruleset change list,
 * fetching in batches as more products are shown.
 */
export const useProductsLoader = ({
  products,
  merchandisingRules,
  countryCode,
  catalogue,
}: {
  products: ProductRule[];
  merchandisingRules: MerchandisingRules;
  countryCode: MerchandisingCountryCode;
  catalogue?: SearchMerchandisingProductsV1ParamsEnum;
}): {
  productDetails: ProductType[];
  missingProductDetails: string[];
  productsShown: number;
  setProductsShown: Dispatch<SetStateAction<number>>;
  isLoading: boolean;
} => {
  const [productDetails, setProductDetails] = useState<ProductType[]>([]);
  const [missingProductDetails, setMissingProductDetails] = useState<string[]>(
    []
  );
  const [productsShown, setProductsShown] = useState(PRODUCTS_TO_LOAD);

  const { searchForProduct, isLoading } = useCategoryProductSearch();

  const fetch = useCallback(
    async (productIds: string[]) => {
      const data = await searchForProduct({
        productIds,
        merchandisingRules,
        countryCode,
        catalogue,
      });
      return data.products;
    },
    [searchForProduct, merchandisingRules, countryCode, catalogue]
  );

  useEffect(() => {
    const fetchData = async () => {
      const productsToGet = [...products]
        .splice(0, productsShown)
        .filter(
          (product) => !productDetails.find(({ id }) => id === product.id)
        )
        .filter(
          (product) => !missingProductDetails.find((id) => id === product.id)
        )
        .map((product) => product.id);

      if (productsToGet.length === 0) {
        return;
      }

      const productsToFetch = productsToGet.slice(
        0,
        MAXIMUM_PRODUCTS_TO_LOAD_BACKEND_SUPPORTS
      );
      const data = await fetch(productsToFetch);

      const missingProducts = productsToFetch.filter((id) =>
        data.filter((x) => x.id.includes(id))
      );

      setMissingProductDetails((prev) => [...prev, ...missingProducts]);

      setProductDetails((prev) => [...prev, ...data]);
    };

    fetchData();
  }, [products, productsShown, missingProductDetails, productDetails, fetch]);

  return {
    productDetails,
    missingProductDetails,
    productsShown,
    setProductsShown,
    isLoading,
  };
};
