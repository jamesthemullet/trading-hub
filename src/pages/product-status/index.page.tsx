import { useReducer } from 'react';

import type { MerchandisingCountryCode } from '@/libs/api/generated/open-api';
import { Heading, Typography } from '@/libs/components';
import {
  CombinedDropdown,
  DropdownVariant,
} from '@/libs/components/dropdown/dropdown';
import { COUNTRY_SELECTOR_OPTIONS } from '@/libs/components/dropdown/dropdown.constants';
import { ProductResult } from '@/libs/components/product-result/product-result';
import ProductStatusHeader from '@/libs/features/product-status/header/product-status-header';
import { initialState, reducer } from '@/libs/hooks/product-status/reducer';
import { useFetchProductStatus } from '@/libs/hooks/product-status/use-fetch-product-status';

import dynamic from 'next/dynamic';
import Head from 'next/head';

import styles from './index.module.css';

const MARKET_OPTIONS = COUNTRY_SELECTOR_OPTIONS.filter(
  (o) => o.countryCode === 'UK' || o.countryCode === 'IE'
).map((o, i) => ({ ...o, index: i }));

const ProductStatus = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const fetchProductStatus = useFetchProductStatus(dispatch);

  const setQuery = (query: string) =>
    dispatch({ type: 'SET_QUERY', payload: query });

  const { query, market, productDisplay, isLoading, error } = state;

  const handleSearch: React.ComponentProps<'form'>['onSubmit'] = (e) => {
    e.preventDefault();
    if (query.trim()) {
      void fetchProductStatus(query.trim(), market);
    }
  };

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Product Status</title>
      </Head>

      <div className={styles.wrapper}>
        <Heading breadcrumbs={['Finding ID']} />
        <ProductStatusHeader
          query={query}
          onQueryChange={setQuery}
          onSearch={handleSearch}
        />

        <div className={styles.results}>
          {isLoading && (
            <Typography variant="bodyMedium">Searching...</Typography>
          )}

          {error && (
            <Typography variant="bodyMedium" className={styles.error}>
              {error}
            </Typography>
          )}

          {productDisplay && (
            <>
              <div className={styles.marketSelector}>
                <Typography variant="titleMedium">
                  {market === 'IE' ? 'IE Market' : 'UK Market'}
                </Typography>
                <CombinedDropdown
                  variant={DropdownVariant.CountrySelector}
                  selectedCountryCode={market}
                  countrySelectorOptions={MARKET_OPTIONS}
                  onChange={(code) => {
                    dispatch({
                      type: 'SET_MARKET',
                      payload: code as MerchandisingCountryCode,
                    });

                    if (query.trim() && productDisplay) {
                      void fetchProductStatus(
                        query.trim(),
                        code as MerchandisingCountryCode
                      );
                    }
                  }}
                />
              </div>
              <ProductResult productDisplay={productDisplay} />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(ProductStatus), {
  ssr: false,
});
