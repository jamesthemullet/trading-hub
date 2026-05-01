import { useMemo, useState } from 'react';

import type { BetaMerchandisingProductDiagnosticsListData } from '@/libs/api/generated/open-api';
import { Typography } from '@/libs/components';
import { InfoCard } from '@/libs/components/info-card/info-card';
import { InfoBox } from '@/libs/components/infoBox/info-box';
import type { ProductStatusVariant } from '@/libs/components/status-badge/status-badge';
import { StatusBadge } from '@/libs/components/status-badge/status-badge';
import { useProductDetails } from '@/libs/hooks/product-status/use-product-details';

import Image from 'next/image';

import styles from './product-result.module.css';

const MNS_IMAGE_BASE = 'https://asset1.cxnmarksandspencer.com/is/image/mands';

type Props = {
  query: string;
  data: BetaMerchandisingProductDiagnosticsListData;
};

export const ProductResult = ({ query, data }: Props) => {
  const { isOnline, product, sections } = useProductDetails(data);
  const { productAssembly } = sections;
  const [imageError, setImageError] = useState(false);

  const { mainStatusLabel, mainStatusVariant } = useMemo(() => {
    switch (productAssembly.status) {
      case 'operational':
        return {
          mainStatusLabel: 'Product is operational',
          mainStatusVariant: 'product-operational',
        };
      case 'issue-detected':
        return {
          mainStatusLabel: `${data.issues.length} issue${data.issues.length !== 1 ? 's' : ''} detected`,
          mainStatusVariant: 'error',
        };
      case 'blocked':
        return { mainStatusLabel: 'Blocked', mainStatusVariant: 'blocked' };
      case 'push-available':
        return {
          mainStatusLabel: 'Emergency push available',
          mainStatusVariant: 'emergency',
        };
      /* istanbul ignore next */
      default:
        return { mainStatusLabel: '', mainStatusVariant: '' };
    }
  }, [productAssembly.status, data.issues.length]);
  const { statusLabel } = useMemo(() => {
    switch (productAssembly.status) {
      case 'operational':
        return { statusLabel: 'Operational' };
      case 'issue-detected':
        return { statusLabel: 'Issue detected' };
      case 'blocked':
        return { statusLabel: 'Blocked' };
      /* istanbul ignore next */
      case 'waiting':
        return { statusLabel: 'Waiting for push' };
      case 'push-available':
        return { statusLabel: 'Push available' };
      /* istanbul ignore next */
      default:
        return { statusLabel: '' };
    }
  }, [productAssembly.status]);

  const displayId = useMemo(() => {
    const id = product?.productId ?? query;

    return id.includes('P') ? id : `P${id}`;
  }, [product?.productId, query]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.productCard}>
        <div className={styles.productCardDetails}>
          <Typography
            variant="titleMedium"
            className={!isOnline ? styles.titleUnavailable : undefined}
          >
            {product?.title ?? 'Title not available'}
          </Typography>

          <Typography variant="bodySmall" className={styles.productId}>
            {displayId}
          </Typography>

          <StatusBadge
            variant={mainStatusVariant as ProductStatusVariant}
            label={mainStatusLabel}
          />

          {isOnline && productAssembly.issues.length === 0 && (
            <InfoBox
              height="86px"
              width="694px"
              title="Can't see this on the website yet?"
              text="Everything is set up correctly. If you can't see this product in the M&S website yet, it will appear shortly."
            />
          )}
        </div>

        {isOnline && product?.imageUrl[0] && !imageError ? (
          <Image
            src={`${MNS_IMAGE_BASE}/${product.imageUrl[0]}`}
            alt={product.title}
            width={213}
            height={277}
            className={styles.productImage}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
      </div>

      <div className={styles.infoCards}>
        <InfoCard
          title="Product data (Product Assembly)"
          statusVariant={productAssembly.status}
          statusLabel={statusLabel}
        >
          {productAssembly.issues.length > 0 ? (
            <ul className={styles.issueList}>
              {productAssembly.issues.map((issue) => (
                <li key={issue.reason}>
                  <InfoBox
                    showIcon={false}
                    variant={issue.type}
                    title={issue.reason}
                    text={issue.action}
                    height="auto"
                    width="auto"
                  />
                </li>
              ))}
            </ul>
          ) : (
            <ul className={styles.detailList}>
              {productAssembly.content.map(({ label, value }) => (
                <li key={label}>
                  <Typography variant="bodySmall">
                    {label}: {value}
                  </Typography>
                </li>
              ))}
            </ul>
          )}
        </InfoCard>
      </div>
    </div>
  );
};
