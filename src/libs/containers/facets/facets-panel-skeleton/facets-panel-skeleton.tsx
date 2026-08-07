import type { ReactElement } from 'react';
import { Skeleton } from '@mantine/core';

import { Typography } from '@/libs/components';
import { COLUMNS } from '@/libs/constants/facets-panel-columns';
import styles from '@/libs/features/facets/facets-panel/facets-panel.module.css';

export const FacetsPanelSkeleton = ({
  title,
}: {
  title: string;
}): ReactElement => {
  const placeholderRows = ['row-1', 'row-2', 'row-3', 'row-4', 'row-5'];

  return (
    <>
      <div className={styles.actionContainer}>
        <h1>{title}</h1>
        <div className={styles.actions}>
          <Skeleton miw={150} />
          <Skeleton miw={150} />
          <Skeleton miw={150} />
        </div>
      </div>
      <div className={styles.sectionWrapper}>
        <Typography variant="bodyMedium" isStrong>
          Rule scope
        </Typography>
        <Skeleton height={96} width="100%" />
      </div>
      <div className={styles.sectionWrapper}>
        <Skeleton height={41} />
      </div>
      <div className={styles.attributesTable}>
        <div className={styles.facetTableRow}>
          {COLUMNS.map(({ label }) => (
            <div key={`column-${label}`} className={styles.tableCol}>
              <Typography isStrong variant="bodySmall">
                {label}
              </Typography>
            </div>
          ))}
        </div>
        {placeholderRows.map((rowId) => {
          return (
            <div key={rowId} className={styles.facetTableRow}>
              {COLUMNS.map(({ label }) => (
                <div key={`column-${label}`} className={styles.tableCol}>
                  <Skeleton miw={150} mih={43} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
};
