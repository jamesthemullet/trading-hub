import { useState } from 'react';

import { Button, Typography } from '@/libs/components';
import { color } from '@/libs/utils/constants';

import styles from './facets-panel-accordion.module.css';

type FacetsPanelAccordionProps = {
  boostedCount: number;
  excludedCount: number;
  nonBoostedExcludedCount: number;
};

export const FacetsPanelAccordion = ({
  boostedCount,
  excludedCount,
  nonBoostedExcludedCount,
}: FacetsPanelAccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.accordionContainer}>
      <div className={styles.contentWrapper}>
        {isOpen && (
          <div className={styles.content}>
            <Typography
              data-testid="attribute-summary-label"
              variant="labelMedium"
            >
              Attribute Summary
            </Typography>
            <div className={styles.summary}>
              <div
                className={styles.summaryBox}
                data-testid="include-only-count"
              >
                <Typography variant="headlineMedium">{boostedCount}</Typography>
                <Typography variant="labelMedium">Include only</Typography>
              </div>
              <div
                className={styles.summaryBox}
                data-testid="algo-control-count"
              >
                <Typography variant="headlineMedium">
                  {nonBoostedExcludedCount}
                </Typography>
                <Typography variant="labelMedium">Algo control</Typography>
              </div>
              <div
                className={styles.summaryBox}
                data-testid="exclude-only-count"
              >
                <Typography variant="headlineMedium">
                  {excludedCount}
                </Typography>
                <Typography variant="labelMedium">Exclude only</Typography>
              </div>
            </div>
          </div>
        )}
      </div>

      <Button
        type="button"
        appearance="plain"
        className={styles.toggleButton}
        onClick={() => setIsOpen((open) => !open)}
      >
        <svg
          className={`${styles.animatedSvg} ${isOpen ? styles.animatedSvgOpen : ''}`}
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12.4425 6.22119L9 9.65619L5.5575 6.22119L4.5 7.27869L9 11.7787L13.5 7.27869L12.4425 6.22119Z"
            fill={color.role.link.link}
          />
        </svg>
        {isOpen ? 'Hide Summary' : 'View Summary'}
      </Button>
    </div>
  );
};
