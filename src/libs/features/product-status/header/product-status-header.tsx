import type { ReactElement } from 'react';

import { Button, Typography } from '@/libs/components';
import { SearchBox } from '@/libs/components/search/search';

import styles from './product-status-header.module.css';

type ProductStatusHeaderProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: React.ComponentProps<'form'>['onSubmit'];
  onRecentSearchesClick: () => void;
};

const ProductStatusHeader = ({
  query,
  onQueryChange,
  onSearch,
  onRecentSearchesClick,
}: ProductStatusHeaderProps): ReactElement => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroHeader}>
        <Typography as="h1" variant="headlineMedium" isStrong>
          Product status search
        </Typography>

        <Button theme="outlined" type="button" onClick={onRecentSearchesClick}>
          Recent searches
        </Button>
      </div>

      <Typography as="span" variant="bodyMedium">
        Use the P number to search
      </Typography>

      <form onSubmit={onSearch} className={styles.searchForm}>
        <SearchBox
          inputProps={{
            id: 'product-search',
            label: 'Search by P number',
            isLabelHidden: true,
            placeholder: 'e.g. 60538523',
            value: query,
            onChange: (e) => onQueryChange(e.target.value),
          }}
        />
      </form>
    </section>
  );
};

export default ProductStatusHeader;
