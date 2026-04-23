import { useReducer } from 'react';

import { Heading, Typography } from '@/libs/components';
import ProductStatusHeader from '@/libs/features/product-status/header/product-status-header';
import { initialState, reducer } from '@/libs/hooks/product-status/reducer';
import { useFetchProductStatus } from '@/libs/hooks/product-status/use-fetch-product-status';

import dynamic from 'next/dynamic';
import Head from 'next/head';

import styles from './index.module.css';

const ProductStatus = () => {
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

  const isOnline = data && data.products.length > 0;

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

          {data && (
            <div className={styles.result}>
              <div className={styles.statusRow}>
                <Typography variant="headlineSmall" isStrong>
                  {isOnline ? data.products[0].title : `Product ${query}`}
                </Typography>
                <span className={styles.statusBadge} data-online={isOnline}>
                  <Typography variant="labelSmall">
                    {isOnline ? 'Online' : 'Offline'}
                  </Typography>
                </span>
              </div>

              {!isOnline && data.issues.length > 0 && (
                <div className={styles.issues}>
                  <Typography variant="bodySmall" isStrong>
                    Blocking issues
                  </Typography>
                  <ul className={styles.issueList}>
                    {data.issues.map((issue) => (
                      <li key={issue.reason} className={styles.issue}>
                        <Typography variant="bodySmall">
                          {issue.reason}
                        </Typography>
                        <Typography
                          variant="bodySmall"
                          className={styles.action}
                        >
                          {issue.action}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(ProductStatus), {
  ssr: false,
});
