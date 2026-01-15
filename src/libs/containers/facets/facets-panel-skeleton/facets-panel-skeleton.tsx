import { Skeleton } from '@mantine/core';

import { Typography } from '@/libs/components';
import { COLUMNS } from '@/libs/constants/facets-panel-columns';
import styles from '@/libs/features/facets/facets-panel/facets-panel.module.css';

export const FacetsPanelSkeleton = ({ title }: { title: string }) => {
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
        {Array.from({ length: 5 }).map((_, index) => {
          return (
            <div key={index} className={styles.facetTableRow}>
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
