import styled from '@emotion/styled';
import { useCallback } from 'react';

import { ChevronIcon } from './chevron-icon';

type Props = {
  current: number;
  total: number;
  onClick: (
    e: React.MouseEvent | React.KeyboardEvent,
    pageNumber: number
  ) => void;
};

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
`;

const PageNavigationButton = styled.button`
  border: none;
  background: none;
  cursor: pointer;
  outline: none;
  padding: 0;
`;

export const Pagination = ({ current, total, onClick }: Props) => {
  const onNextPageActivated = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      onClick(e, Math.min(current + 1, total));
    },
    [current, total, onClick]
  );
  const onPrevPageActivated = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      onClick(e, Math.max(current - 1, 1));
    },
    [current, onClick]
  );
  return (
    <PaginationContainer>
      {`Page ${current} of ${total}`}
      <PageNavigationButton
        name={'prev-button'}
        aria-label="Previous page"
        onClick={onPrevPageActivated}
        onKeyDown={onPrevPageActivated}
      >
        <ChevronIcon type="prev" isEnabled={current > 1} />
      </PageNavigationButton>
      <PageNavigationButton
        name={'next-button'}
        aria-label="Next page"
        onClick={onNextPageActivated}
        onKeyDown={onNextPageActivated}
      >
        <ChevronIcon type="next" isEnabled={current < total} />
      </PageNavigationButton>
    </PaginationContainer>
  );
};
