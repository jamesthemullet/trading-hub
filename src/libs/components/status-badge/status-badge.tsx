import { Typography } from '@/libs/components';

import Image from 'next/image';

import styles from './status-badge.module.css';

const variantConfig: Record<
  ProductStatusVariant | OperationalStatusVariant,
  { icon: string; alt: string }
> = {
  operational: {
    icon: '/trading-hub/asset/icon-tick-in-circle-success.svg',
    alt: 'Operational',
  },
  waiting: {
    icon: '/trading-hub/asset/icon-waiting.svg',
    alt: 'Waiting',
  },
  emergency: {
    icon: '/trading-hub/asset/icon-info.svg',
    alt: 'Emergency',
  },
  'product-operational': {
    icon: '/trading-hub/asset/icon-tick-in-circle-success.svg',
    alt: 'Product is operational',
  },
  'issue-detected': {
    icon: '/trading-hub/asset/icon-cross-error.svg',
    alt: 'Issue detected',
  },
  'push-available': {
    icon: '/trading-hub/asset/icon-info-warning.svg',
    alt: 'Push available',
  },
  error: {
    icon: '/trading-hub/asset/icon-warning-triangle.svg',
    alt: 'Error',
  },
  blocked: {
    icon: '/trading-hub/asset/icon-blocked.svg',
    alt: 'Blocked by an issue',
  },
};

type Props = {
  variant: ProductStatusVariant | OperationalStatusVariant;
  label: string;
};

export type ProductStatusVariant =
  | 'product-operational'
  | 'issue-detected'
  | 'push-available';
export type OperationalStatusVariant =
  | 'operational'
  | 'waiting'
  | 'emergency'
  | 'error'
  | 'blocked'
  | 'issue-detected'
  | 'push-available';

export const StatusBadge = ({ variant, label }: Props) => {
  const { icon, alt } = variantConfig[variant];

  return (
    <span className={styles.badge} data-variant={variant}>
      <Image src={icon} alt={alt} width={16} height={16} />
      <Typography as="span" variant="labelSmall">
        {label}
      </Typography>
    </span>
  );
};
