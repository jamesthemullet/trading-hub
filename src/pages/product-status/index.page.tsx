import { useReducer } from 'react';

import { Heading, Typography } from '@/libs/components';
import { useProductStatusFlag } from '@/libs/components/feature-flag/feature-flag';
import { ProductResult } from '@/libs/components/product-result/product-result';
import ProductStatusHeader from '@/libs/features/product-status/header/product-status-header';
import { initialState, reducer } from '@/libs/hooks/product-status/reducer';
import { useFetchProductStatus } from '@/libs/hooks/product-status/use-fetch-product-status';

import dynamic from 'next/dynamic';
import Head from 'next/head';

import styles from './index.module.css';

const ProductStatus = () => {
  const hasProductStatus = useProductStatusFlag();

  const [state, dispatch] = useReducer(reducer, initialState);
  const fetchProductStatus = useFetchProductStatus(dispatch);

  const setQuery = (query: string) =>
    dispatch({ type: 'SET_QUERY', payload: query });

  const { query, data, isLoading, error } = state;

  const handleSearch: React.ComponentProps<'form'>['onSubmit'] = (e) => {
    e.preventDefault();
    if (query.trim()) {
      void fetchProductStatus(query.trim());
    }
  };

  if (!hasProductStatus) {
    return <Typography variant="bodyMedium">Coming soon</Typography>;
  }

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

          {data && <ProductResult query={query} data={data} />}
        </div>
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(ProductStatus), {
  ssr: false,
});
