import type { ReactElement } from 'react';

import { Typography } from '../typography/typography';
import styles from './count.module.css';

export const Count = ({
  children,
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode;
  'aria-label'?: string;
}): ReactElement => (
  <Typography
    as="output"
    variant="labelSmall"
    className={styles.count}
    aria-label={ariaLabel}
    align="center"
  >
    {children}
  </Typography>
);
