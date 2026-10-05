import type { ReactElement, ReactNode } from 'react';

import { Breadcrumb } from '../breadcrumb/breadcrumb';
import { Typography } from '../typography/typography';
import styles from './heading.module.css';

type Props = {
  breadcrumbs: string[];
  title?: string;
  actions?: ReactNode;
  banner?: ReactNode;
};

export const Heading = ({
  breadcrumbs,
  title,
  actions,
  banner,
}: Props): ReactElement => {
  return (
    <div>
      <div className={styles.headingSpacer} />
      <div className={styles.headingWrapper}>
        <Breadcrumb>
          {breadcrumbs.map((breadcrumb) => (
            <Typography
              as="span"
              variant="bodySmall"
              className={styles.breadcrumbText}
              key={breadcrumb}
            >
              {breadcrumb}
            </Typography>
          ))}
        </Breadcrumb>
      </div>
      {banner}
      {title && (
        <div className={styles.titleBlock}>
          <Typography variant="titleMedium" isStrong as="h1">
            {title}
          </Typography>
          {actions}
        </div>
      )}
    </div>
  );
};
