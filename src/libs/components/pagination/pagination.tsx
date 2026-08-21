import type { ReactElement } from 'react';
import { useCallback } from 'react';

import { Button } from '@/libs/components/button/button';

import { Typography } from '../typography/typography';
import { ChevronIcon } from './chevron-icon';
import styles from './pagination.module.css';

type Props = {
  current: number;
  total: number;
  onClick: (pageNumber: number) => void;
};

export const Pagination = ({
  current,
  total,
  onClick,
}: Props): ReactElement => {
  const onNextPageActivated = useCallback(() => {
    const pageNumber = Math.min(current + 1, total);
    onClick(pageNumber);
  }, [current, total, onClick]);

  const onPrevPageActivated = useCallback(() => {
    const pageNumber = Math.max(current - 1, 1);
    onClick(pageNumber);
  }, [current, onClick]);

  return (
    <div className={styles.paginationContainer}>
      <Typography variant="bodySmall">{`Page ${current} of ${total}`}</Typography>
      <Button
        aria-label="Previous page"
        onClick={onPrevPageActivated}
        isDisabled={!(current > 1)}
        isInline
      >
        <ChevronIcon type="prev" />
      </Button>
      <Button
        aria-label="Next page"
        onClick={onNextPageActivated}
        isDisabled={!(current < total)}
        isInline
      >
        <ChevronIcon type="next" />
      </Button>
    </div>
  );
};
