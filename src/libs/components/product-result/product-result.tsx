import { useState } from 'react';

import { Typography } from '@/libs/components';
import { InfoCard } from '@/libs/components/info-card/info-card';
import { InfoBox } from '@/libs/components/infoBox/info-box';
import { StatusBadge } from '@/libs/components/status-badge/status-badge';
import type { ProductDisplay } from '@/libs/hooks/product-status/reducer';

import Image from 'next/image';

import styles from './product-result.module.css';

const MNS_IMAGE_BASE = 'https://asset1.cxnmarksandspencer.com/is/image/mands';

type Props = {
  productDisplay: ProductDisplay;
};

export const ProductResult = ({ productDisplay }: Props) => {
  const {
    isIndexed,
    product,
    displayId,
    mainStatusLabel,
    mainStatusVariant,
    sections,
  } = productDisplay;
  const { productAssembly } = sections;
  const [imageError, setImageError] = useState(false);

  return (
    <div className={styles.wrapper}>
      <div className={styles.productCard}>
        <div className={styles.productCardDetails}>
          <Typography
            variant="titleMedium"
            className={!isIndexed ? styles.titleUnavailable : undefined}
          >
            {product?.title ?? 'Title not available'}
          </Typography>

          <Typography variant="bodySmall" className={styles.productId}>
            {displayId}
          </Typography>

          <StatusBadge variant={mainStatusVariant} label={mainStatusLabel} />

          {isIndexed && productAssembly.issues.length === 0 && (
            <InfoBox
              height="86px"
              width="694px"
              title="Can't see this on the website yet?"
              text="Everything is set up correctly. If you can't see this product in the M&S website yet, it will appear shortly."
            />
          )}
        </div>

        {isIndexed && product?.imageUrl[0] && !imageError ? (
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
          statusLabel={productAssembly.statusLabel}
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

        <InfoCard
          title="Availability"
          statusVariant={sections.availability.status}
          statusLabel={sections.availability.statusLabel}
        >
          {sections.availability.issues.length > 0 ? (
            <ul className={styles.issueList}>
              {sections.availability.issues.map((issue) => (
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
            <Typography variant="bodySmall">
              {isIndexed ? 'In-store and online' : 'Not available'}
            </Typography>
          )}
        </InfoCard>
      </div>
    </div>
  );
};
