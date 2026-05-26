import { useState } from 'react';

import { Button, Typography } from '@/libs/components';
import type {
  OperationalStatusVariant,
  ProductStatusVariant,
} from '@/libs/components/status-badge/status-badge';
import { StatusBadge } from '@/libs/components/status-badge/status-badge';
import type { RecentSearch } from '@/libs/hooks/product-status/reducer';

import Image from 'next/image';

import styles from './recent-searches.module.css';

const MNS_IMAGE_BASE = 'https://asset1.cxnmarksandspencer.com/is/image/mands';

type CardProps = {
  search: RecentSearch;
  onSelect: (displayId: string) => void;
};

const SearchCard = ({ search, onSelect }: CardProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={styles.card}>
      <div className={styles.cardDetails}>
        <div>
          <Typography variant="titleMedium">
            {search.title ?? 'Title not available'}
          </Typography>
          <Typography variant="bodySmall" className={styles.displayId}>
            {search.displayId}
          </Typography>
        </div>

        <StatusBadge
          variant={
            search.mainStatusVariant as
              | ProductStatusVariant
              | OperationalStatusVariant
          }
          label={search.mainStatusLabel}
        />

        <Button
          theme="outlined"
          type="button"
          onClick={() => onSelect(search.displayId)}
          className={styles.viewButton}
        >
          View product
        </Button>
      </div>

      {search.imageUrl && !imageError ? (
        <Image
          src={`${MNS_IMAGE_BASE}/${search.imageUrl}`}
          alt={search.title ?? ''}
          width={213}
          height={277}
          className={styles.productImage}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={styles.imagePlaceholder} />
      )}
    </div>
  );
};

type Props = {
  searches: RecentSearch[];
  onBack: () => void;
  onSelect: (displayId: string) => void;
};

export const RecentSearches = ({ searches, onBack, onSelect }: Props) => {
  return (
    <>
      <section className={styles.hero}>
        <Button theme="outlined" type="button" onClick={onBack}>
          Back to Product status
        </Button>
        <div className={styles.heroContent}>
          <Typography as="h1" variant="headlineMedium" isStrong>
            Recent searches
          </Typography>
          <Typography as="span" variant="bodyMedium">
            From this session
          </Typography>
        </div>
      </section>

      <div className={styles.list}>
        <Typography variant="bodyMedium" className={styles.count}>
          {searches.length} recent search{searches.length !== 1 ? 'es' : ''}
        </Typography>

        {searches.map((search) => (
          <SearchCard
            key={search.displayId}
            search={search}
            onSelect={onSelect}
          />
        ))}
      </div>
    </>
  );
};
