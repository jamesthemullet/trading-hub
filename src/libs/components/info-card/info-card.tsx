import { Typography } from '@/libs/components';

import {
  type OperationalStatusVariant,
  StatusBadge,
} from '../status-badge/status-badge';
import styles from './info-card.module.css';

type InfoCardData = {
  title: string;
  statusVariant: OperationalStatusVariant;
  statusLabel: string;
  children: React.ReactNode;
};

export const InfoCard = ({
  title,
  statusVariant,
  statusLabel,
  children,
}: InfoCardData) => (
  <div className={styles.infoCard}>
    <div className={styles.header}>
      <Typography variant="bodyLarge" isStrong>
        {title}
      </Typography>
      <StatusBadge variant={statusVariant} label={statusLabel} />
    </div>
    <div className={styles.body}>{children}</div>
  </div>
);
