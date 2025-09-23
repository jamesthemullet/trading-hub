import styled from '@emotion/styled';
import { useCallback } from 'react';

import { color } from '@/libs/utils/constants';

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

const PageNavigationButton = styled.button<{ isEnabled: boolean }>`
  border: none;
  background: none;
  cursor: pointer;
  outline: none;
  padding: 0;
  opacity: ${({ isEnabled }) => (isEnabled ? 1 : 0.2)};

  &:hover,
  &:focus {
    rect {
      fill: ${({ isEnabled }) =>
        isEnabled ? '#e1e1e1' : color.backgroundDarkGrey};
    }
    &:disabled {
      cursor: default;
    }
  }
  &:focus {
    svg {
      outline: solid 2px ${color.focusBlue};
      border-radius: 50%;
    }
  }
`;

export const Pagination = ({ current, total, onClick }: Props) => {
  const onNextPageActivated = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      // istanbul ignore else
      if ((e as React.KeyboardEvent).key === 'Enter' || e.type === 'click') {
        onClick(e, Math.min(current + 1, total));
      }
    },
    [current, total, onClick]
  );
  const onPrevPageActivated = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      // istanbul ignore else
      if ((e as React.KeyboardEvent).key === 'Enter' || e.type === 'click') {
        onClick(e, Math.max(current - 1, 1));
      }
    },
    [current, onClick]
  );
  return (
    <PaginationContainer>
      {`Page ${current} of ${total}`}
      <PageNavigationButton
        name="prev-button"
        aria-label="Previous page"
        onClick={onPrevPageActivated}
        onKeyDown={onPrevPageActivated}
        isEnabled={current > 1}
        disabled={!(current > 1)}
      >
        <ChevronIcon type="prev" />
      </PageNavigationButton>
      <PageNavigationButton
        name="next-button"
        aria-label="Next page"
        onClick={onNextPageActivated}
        onKeyDown={onNextPageActivated}
        isEnabled={current < total}
        disabled={!(current < total)}
      >
        <ChevronIcon type="next" />
      </PageNavigationButton>
    </PaginationContainer>
  );
};
